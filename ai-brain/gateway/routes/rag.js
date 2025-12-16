'use strict';
/**
 * routes/rag.js
 *
 * Knowledge Base ingestion routes.
 *
 * POST /api/rag/upload   — Receive file, save to Supabase Storage, queue worker job
 * POST /api/rag/website  — Queue a website URL scrape + ingest job
 * GET  /api/rag/sources  — List knowledge sources for a business
 * DELETE /api/rag/source — Delete a knowledge source + its nodes
 */

const { createClient } = require('@supabase/supabase-js');
const { createRedisClient } = require('../lib/redis');

const BUCKET = 'knowledge-base';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
  );
}

async function ragRoutes(fastify) {

  // ── POST /api/rag/upload ──────────────────────────────────────────────────
  // Accepts: multipart/form-data with fields: file, business_id
  fastify.post('/api/rag/upload', async (request, reply) => {
    const data = await request.file(); // requires @fastify/multipart registered in server.js

    if (!data) return reply.code(400).send({ error: 'No file received' });

    const businessId = data.fields?.business_id?.value;
    if (!businessId) return reply.code(400).send({ error: 'Missing business_id' });

    const filename = `${businessId}/${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    try {
      const supabase = getSupabase();
      const buffer   = await data.toBuffer();

      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType: data.mimetype, upsert: false });

      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

      // 2. Create knowledge_sources row (status = queued)
      const { data: sourceRow, error: sourceErr } = await supabase
        .from('knowledge_sources')
        .insert([{
          business_id: businessId,
          source_type: 'file',
          source_name: data.filename,
          status: 'queued'
        }])
        .select()
        .single();

      if (sourceErr) throw new Error(`DB insert failed: ${sourceErr.message}`);

      // 3. Queue worker job
      const redis = createRedisClient();
      await redis.lpush('rag_jobs', JSON.stringify({
        type: 'pdf',
        business_id: businessId,
        source_id: sourceRow.id,
        file_path: filename,
        bucket: BUCKET
      }));

      fastify.log.info({ sourceId: sourceRow.id, file: filename }, '📚 [RAG] PDF queued for ingestion');
      return reply.send({ success: true, source_id: sourceRow.id, file_path: filename });

    } catch (err) {
      fastify.log.error({ error: err.message }, '📚 [RAG] Upload failed');
      return reply.code(500).send({ error: err.message });
    }
  });

  // ── POST /api/rag/website ─────────────────────────────────────────────────
  fastify.post('/api/rag/website', async (request, reply) => {
    const { business_id, url } = request.body || {};
    if (!business_id || !url) return reply.code(400).send({ error: 'Missing business_id or url' });

    try {
      const supabase = getSupabase();

      const { data: sourceRow, error: sourceErr } = await supabase
        .from('knowledge_sources')
        .insert([{
          business_id,
          source_type: 'web',
          source_name: url,
          source_url: url,
          status: 'queued'
        }])
        .select()
        .single();

      if (sourceErr) throw new Error(`DB insert failed: ${sourceErr.message}`);

      const redis = createRedisClient();
      await redis.lpush('rag_jobs', JSON.stringify({
        type: 'website',
        business_id,
        source_id: sourceRow.id,
        url
      }));

      fastify.log.info({ sourceId: sourceRow.id, url }, '📚 [RAG] Website queued for ingestion');
      return reply.send({ success: true, source_id: sourceRow.id });

    } catch (err) {
      fastify.log.error({ error: err.message }, '📚 [RAG] Website queue failed');
      return reply.code(500).send({ error: err.message });
    }
  });

  // ── GET /api/rag/sources?business_id=... ─────────────────────────────────
  fastify.get('/api/rag/sources', async (request, reply) => {
    const { business_id } = request.query;
    if (!business_id) return reply.code(400).send({ error: 'Missing business_id' });

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('knowledge_sources')
        .select('id, source_name, source_type, source_url, status, created_at')
        .eq('business_id', business_id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return reply.send(data || []);

    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // ── DELETE /api/rag/source?id=... ─────────────────────────────────────────
  fastify.delete('/api/rag/source', async (request, reply) => {
    const { id } = request.query;
    if (!id) return reply.code(400).send({ error: 'Missing source id' });

    try {
      const supabase = getSupabase();

      // Delete all nodes first (cascades intentionally)
      await supabase.from('knowledge_nodes').delete().eq('source_id', id);
      const { error } = await supabase.from('knowledge_sources').delete().eq('id', id);
      if (error) throw new Error(error.message);

      return reply.send({ success: true });

    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });
  // ── GET /api/rag/nodes?source_id=... ──────────────────────────────────────
  fastify.get('/api/rag/nodes', async (request, reply) => {
    const { source_id } = request.query;
    if (!source_id) return reply.code(400).send({ error: 'Missing source_id' });

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('knowledge_nodes')
        .select('chunk_index, content')
        .eq('source_id', source_id)
        .order('chunk_index', { ascending: true });

      if (error) throw new Error(error.message);
      return reply.send(data || []);

    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

}

module.exports = ragRoutes;
