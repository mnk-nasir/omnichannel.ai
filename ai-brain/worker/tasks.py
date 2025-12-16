import time
import tempfile
import requests
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from .celery_app import celery_app

@celery_app.task(name="process_business_document")
def process_business_document(document_id: str, business_id: str, file_path: str):
    try:
        print(f"Starting background processing for document {document_id}")
        sb_url = os.getenv("SUPABASE_URL")
        sb_key = os.getenv("SUPABASE_KEY")
        
        # 1. Download PDF
        file_url = f"{sb_url}/storage/v1/object/public/knowledge-base/{file_path}"
        resp = requests.get(file_url)
        if resp.status_code != 200:
            print(f"Failed to download PDF {document_id}")
            return {"status": "failed", "error": "download_failed"}
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(resp.content)
            tmp_path = tmp.name
            
        # 2. Extract and chunk text
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = splitter.split_documents(docs)
        
        # 3. Embed text via OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        headers = {
            "apikey": sb_key,
            "Authorization": f"Bearer {sb_key}",
            "Content-Type": "application/json"
        }
        
        for chunk in chunks:
            res = client.embeddings.create(input=[chunk.page_content], model="text-embedding-3-small")
            embedding = res.data[0].embedding
            
            # 4. Save to Supabase
            payload = {
                "business_id": business_id,
                "document_id": document_id,
                "content": chunk.page_content,
                "embedding": embedding
            }
            req = requests.post(f"{sb_url}/rest/v1/document_embeddings", headers=headers, json=payload)
            if req.status_code not in (200, 201):
                print(f"Failed to insert chunk: {req.text}")
                
        os.remove(tmp_path)
        print(f"Successfully generated embeddings for {document_id}")
        return {"status": "completed", "document_id": document_id}
    except Exception as e:
        print(f"Error processing document: {e}")
        return {"status": "failed", "error": str(e)}

import json
import os
import requests
from dotenv import load_dotenv
import redis

# We import the AI clients and router logic directly from the Brain
# In a real microservice separation, they could be API calls, but here they run in the same codebase
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from brain.main import inference_router, TestMessage

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brain", ".env"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL)

@celery_app.task(name="poll_redis_message_queue")
def poll_redis_message_queue():
    """
    A persistent worker task that could constantly poll the 'incoming_messages' 
    Redis list created by the Node Fastify Gateway, and route them to the AI router.
    """
    print("Celery Worker: Starting to poll Redis for messages...")
    
    # We use a simple loop here for demonstration. 
    # In production, Celery Beat or a dedicated consumer loop is better.
    # For this Phase 2 testing, we'll process up to 10 messages per invocation.
    for _ in range(10):
        # BRPOP blocks for up to 2 seconds waiting for a message
        message_data = redis_client.brpop('incoming_messages', timeout=2)
        
        if message_data:
            _, payload_bytes = message_data
            job = json.loads(payload_bytes.decode('utf-8'))
            
            print(f"Worker received message: {job['message']} from {job['user_phone']} ({job['source']})")
            
            # Route to AI
            ai_payload = TestMessage(message=job['message'], business_id=job['business_id'])
            ai_result = inference_router(ai_payload)
            response_text = ai_result.get("response", "Sorry, I am offline.")
            
            print(f"AI Responded using {ai_result.get('model_used')}: {response_text}")
            
            # Send back to Gateway
            try:
                gateway_url = os.getenv("GATEWAY_URL", "http://omnichannel_gateway:3000")
                payload = {
                    "to": job['user_phone'],
                    "message": response_text,
                    "source": job['source'],
                    "business_id": job['business_id']
                }
                
                try:
                    # First try Docker or configured URL
                    requests.post(f"{gateway_url}/api/messages/send", json=payload, timeout=5)
                except:
                    # Fallback to localhost
                    requests.post('http://localhost:3000/api/messages/send', json=payload, timeout=5)
                
                print(f"Successfully sent reply to {job['source']} Gateway.")
            except Exception as e:
                print(f"Failed to reach Gateway: {e}")
        else:
            # Queue is empty, exit the loop so the task can finish and be re-queued by Celery Beat if needed
            break
            
    return {"status": "processed"}

@celery_app.task(name="async_inference_router")
def async_inference_router(job_dict):
    """
    Parallel Celery task to process incoming WhatsApp/webhook text messages.
    Scales horizontally based on Celery worker instances.
    """
    print(f"[Async Celery Worker] Processing message from {job_dict.get('user_phone')}")
    try:
        ai_payload = TestMessage(
            message=job_dict.get('message', ''), 
            business_id=job_dict.get('business_id', '00000000-0000-4000-8000-000000000001'),
            contact_id=job_dict.get('contact_id'),
            conversation_id=job_dict.get('conversation_id')
        )
        ai_result = inference_router(ai_payload)
        response_text = ai_result.get("response", "Internal Error: Please try again.")
        
        # Send back to Gateway
        gateway_url = os.getenv("GATEWAY_URL", "http://omnichannel_gateway:3000")
        payload = {
            "to": job_dict['user_phone'],
            "message": response_text,
            "source": job_dict.get('source', 'web'),
            "business_id": job_dict.get('business_id', ai_payload.business_id),
            "chat_id": job_dict.get('chat_id'),
            "sender": "ai",
            "conversation_id": job_dict.get('conversation_id')
        }
        
        try:
            requests.post(f"{gateway_url}/api/messages/send", json=payload, timeout=10)
        except Exception as e:
            requests.post('http://localhost:3000/api/messages/send', json=payload, timeout=5)
            
        print("[Async Celery Worker] ✅ Successfully replied.")
        return {"status": "success"}
    except Exception as e:
        print(f"[Async Celery Worker] ❌ Failure: {e}")
        return {"status": "error", "error": str(e)}
