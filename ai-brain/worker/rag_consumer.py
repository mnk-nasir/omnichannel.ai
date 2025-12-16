"""
Standalone Redis Consumer - Knowledge Base RAG Ingestion Worker
This loop specifically listens to the 'rag_jobs' queue and processes
PDF downloads, chunking, and embeddings.
"""
import json
import os
import sys
import time
import requests
import redis
import tempfile
from dotenv import load_dotenv

# Add the worker directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rag_ingestor import RAGIngestor

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brain", ".env"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def update_status(source_id: str, status: str):
    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        requests.patch(f"{SUPABASE_URL}/rest/v1/knowledge_sources?id=eq.{source_id}", headers=headers, json={"status": status})
    except Exception as e:
        print(f"[RAG Worker] Failed to update status to {status}: {e}")

def run():
    print(f"[RAG Worker] 🚀 Starting RAG Knowledge Ingestion Worker.")
    print(f"[RAG Worker]    Queue: 'rag_jobs' | Redis: {REDIS_URL}")
    
    ingestor = RAGIngestor()
    
    while True:
        try:
            # Using reliable queue pattern to prevent data loss on crash
            payload_bytes = redis_client.brpoplpush('rag_jobs', 'rag_processing', timeout=5)
            if not payload_bytes:
                continue

            try:
                job = json.loads(payload_bytes)
            except json.JSONDecodeError as je:
                print(f"[RAG Worker] ⚠️ Failed to decode message JSON: {je}")
                continue
                
            job_type = job.get("type")
            business_id = job.get("business_id")
            source_id = job.get("source_id")
            
            print(f"[RAG Worker] 📩 Received '{job_type}' job for business: {business_id} | Source: {source_id}")
            
            # Immediately mark as processing so UI updates
            update_status(source_id, "processing")
            
            if job_type == "website":
                url = job.get("url")
                if not url:
                    raise ValueError("URL is missing from website job.")
                ingestor.ingest_website(business_id, url, source_id)
                # ingest_website will mark as completed

            elif job_type == "pdf":
                file_path = job.get("file_path")
                bucket = job.get("bucket", "knowledge-base")
                
                # Download PDF from Supabase
                file_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{file_path}"
                print(f"[RAG Worker] Downloading PDF: {file_url}")
                
                resp = requests.get(file_url)
                if resp.status_code != 200:
                    raise Exception(f"Failed to download PDF {file_path}. Code: {resp.status_code}")
                    
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(resp.content)
                    tmp_path = tmp.name
                
                # Ingest Local Temp File
                print(f"[RAG Worker] Successfully downloaded to {tmp_path}. Ingesting...")
                ingestor.ingest_pdf(business_id, tmp_path, source_id)
                # ingest_pdf will mark as completed
                
                # Cleanup
                os.remove(tmp_path)
            
            else:
                print(f"[RAG Worker] ⚠️ Unknown job type: {job_type}")
                update_status(source_id, "error")

            # Remove job from processing queue safely after completion/known-failure
            redis_client.lrem('rag_processing', 1, payload_bytes)
            
        except redis.exceptions.ConnectionError:
            print("[RAG Worker] 🔌 Redis connection lost. Reconnecting in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"[RAG Worker] 💥 Processing Error: {e}")
            if 'source_id' in locals() and source_id:
                update_status(source_id, "error")
            if 'payload_bytes' in locals() and payload_bytes:
                # Retry by pushing it back (optional) or leave it in 'rag_processing' for an auditor script
                pass
            time.sleep(1)

if __name__ == "__main__":
    run()
