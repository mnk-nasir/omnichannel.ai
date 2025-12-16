"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  UploadCloud, FileText, Globe, Trash2, RefreshCw,
  CheckCircle2, Clock, AlertCircle, Loader2, Link, X,
  BookOpen, Plus, Zap, Activity, Info, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessContext } from '@/context/BusinessContext';

const S = {
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' },
  input: { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' },
  label: { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' },
  btn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }
};

const STATUS = {
  queued: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: <Clock size={12} />, label: 'Queued' },
  processing: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: <Loader2 size={12} className="animate-spin" />, label: 'Processing' },
  completed: { color: 'text-[#00E88F]', bg: 'bg-[#00E88F]/10', border: 'border-[#00E88F]/20', icon: <CheckCircle2 size={12} />, label: 'Ready' },
  error: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: <AlertCircle size={12} />, label: 'Failed' },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.queued;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid transparent`, ...s }}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

export default function KnowledgeManagerPage() {
  const { businessId } = useBusinessContext();
  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState(null);
  const [viewingSource, setViewingSource] = useState(null);
  const [sourceNodes, setSourceNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadSources = useCallback(async () => {
    if (!businessId) return;
    setSourcesLoading(true);
    try {
      const res = await fetch(`/api/rag/sources?business_id=${businessId}`);
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch { setSources([]); }
    finally { setSourcesLoading(false); }
  }, [businessId]);

  useEffect(() => { loadSources(); }, [loadSources]);

  useEffect(() => {
    const hasActive = sources.some(s => s.status === 'queued' || s.status === 'processing');
    if (!hasActive) return;
    const id = setInterval(loadSources, 8000);
    return () => clearInterval(id);
  }, [sources, loadSources]);

  const activeBusinessId = businessId || '00000000-0000-4000-8000-000000000001';

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('business_id', activeBusinessId);
      const res = await fetch('/api/rag/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadResult({ success: true });
      setFile(null);
      setTimeout(loadSources, 1500);
    } catch (err) { setUploadResult({ error: err.message }); }
    finally { setUploading(false); }
  };

  const handleWebsite = async () => {
    if (!websiteUrl.trim()) return;
    setUrlLoading(true);
    setUrlResult(null);
    try {
      const res = await fetch('/api/rag/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: activeBusinessId, url: websiteUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setUrlResult({ success: true });
      setWebsiteUrl('');
      setTimeout(loadSources, 1500);
    } catch (err) { setUrlResult({ error: err.message }); }
    finally { setUrlLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this knowledge source? This will also remove all AI embeddings from this document.')) return;
    try {
      await fetch(`/api/rag/sources?id=${id}`, { method: 'DELETE' });
      setSources(prev => prev.filter(s => s.id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleViewData = async (source) => {
    setViewingSource(source);
    setNodesLoading(true);
    try {
      const res = await fetch(`/api/rag/nodes?source_id=${source.id}`);
      const data = await res.json();
      setSourceNodes(data);
    } catch { setSourceNodes([]); }
    finally { setNodesLoading(false); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setUploadResult(null);
    }
  };

  const completedCount = sources.filter(s => s.status === 'completed').length;
  const processingCount = sources.filter(s => s.status === 'queued' || s.status === 'processing').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '12px' }}>
            <BookOpen size={11} color="#818cf8" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Intelligence Engine</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0 }}>Knowledge Base</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', fontWeight: 500 }}>
            Ground your AI agents in reality with company documents and data.
          </p>
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AnimatePresence>
            {processingCount > 0 && (
              <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ fontSize: '11px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={13} className="animate-spin" /> {processingCount} indexing...
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={loadSources} style={{ ...S.btn, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={15} style={{ animation: sourcesLoading ? 'spin 1s linear infinite' : 'none', color: sourcesLoading ? '#00E88F' : 'inherit' }} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {[
          { label: 'Total Sources', value: sources.length, icon: <FileText size={18} />, color: '#F0F4FA', accent: '#3E4A57' },
          { label: 'Ready Chunks', value: completedCount, icon: <CheckCircle2 size={18} />, color: '#00E88F', accent: '#00E88F' },
          { label: 'Processing', value: processingCount, icon: <Zap size={18} />, color: '#818cf8', accent: '#818cf8' },
        ].map(c => (
          <div key={c.label} style={{ ...S.card, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${c.accent}12`, border: `1px solid ${c.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload/Link Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ ...S.card, padding: '28px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={18} color="#818cf8" /> Upload PDF
          </h2>
          <div
            style={{ border: '2px dashed rgba(129,140,248,0.25)', borderRadius: '16px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', marginBottom: '20px' }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { setFile(e.target.files[0]); setUploadResult(null); }} />
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <UploadCloud size={24} color="#818cf8" />
            </div>
            {!file ? (
              <>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '14px' }}>Drop a PDF document</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maximum 20MB · PDF only</p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, color: '#818cf8', margin: '0 0 4px', fontSize: '14px' }}>{file.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ marginTop: '10px', fontSize: '11px', fontWeight: 800, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remove</button>
              </>
            )}
          </div>
          {uploadResult?.success && <div style={{ padding: '12px', background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)', borderRadius: '10px', color: '#00E88F', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>File successfully queued for training!</div>}
          {uploadResult?.error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>{uploadResult.error}</div>}
          <button onClick={handleUpload} disabled={!file || uploading} style={{ ...S.btn, width: '100%', background: 'linear-gradient(135deg,#6366F1,#4f46e5)', color: '#fff', border: 'none', opacity: (!file || uploading) ? 0.4 : 1, display: 'flex', justifyContent: 'center' }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Train on PDF
          </button>
        </div>

        <div style={{ ...S.card, padding: '28px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={18} color="#60a5fa" /> Index Website
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            Enter a URL and the AI will crawl and index its content as part of your knowledge base.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Link size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://company.com/faq" style={{ ...S.input, paddingLeft: '36px' }} onKeyDown={e => e.key === 'Enter' && handleWebsite()} />
            </div>
            <button onClick={handleWebsite} disabled={!websiteUrl.trim() || urlLoading} style={{ ...S.btn, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', opacity: (!websiteUrl.trim() || urlLoading) ? 0.4 : 1 }}>
              {urlLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
            </button>
          </div>
          {urlResult?.success && <div style={{ padding: '12px', background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)', borderRadius: '10px', color: '#00E88F', fontSize: '12px', fontWeight: 600 }}>Website queued for crawling!</div>}
          {urlResult?.error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>{urlResult.error}</div>}

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              <Info size={13} color="#60a5fa" /> Best sources:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['FAQ Pages', 'Docs', 'Pricing', 'Articles'].map(i => (
                <div key={i} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa' }} /> {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Library card */}
      <div style={S.card}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            <Activity size={14} color="var(--text-muted)" /> Knowledge Library
          </h2>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sources.length} sources total</span>
        </div>

        {sourcesLoading && sources.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(0,232,143,0.2)', borderTopColor: '#00E88F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : sources.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <BookOpen size={42} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.15 }} />
            <p style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>No intelligence found</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Start by uploading a company PDF or adding a website URL.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sources.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="source-row">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.source_type === 'web' ? 'rgba(96,165,250,0.1)' : 'rgba(129,140,248,0.1)', border: `1px solid ${s.source_type === 'web' ? 'rgba(96,165,250,0.2)' : 'rgba(129,140,248,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.source_type === 'web' ? '#60a5fa' : '#818cf8', flexShrink: 0 }}>
                  {s.source_type === 'web' ? <Globe size={18} /> : <FileText size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.source_name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.source_type}</span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Added {new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}><StatusBadge status={s.status} /></div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {s.status === 'completed' && (
                    <button onClick={() => handleViewData(s)} style={{ ...S.btn, padding: '7px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '11px' }}>
                      View Logic
                    </button>
                  )}
                  <button onClick={() => handleDelete(s.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {viewingSource && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingSource(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', background: '#131820', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>{viewingSource.source_name}</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginTop: '3px' }}>Neural Extract Library</p>
                </div>
                <button onClick={() => setViewingSource(null)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scrollbar">
                {nodesLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 size={32} className="animate-spin text-[#00E88F]" /></div>
                ) : sourceNodes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data chunks extracted for this source.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sourceNodes.map((n, i) => (
                      <div key={i} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '9px', fontWeight: 900, color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Chunk {i + 1}</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .source-row:hover { background: rgba(255,255,255,0.02); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
