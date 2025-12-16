"""
Standalone Redis Consumer - Always-On Message Processor
Instead of relying on Celery Beat scheduling, this runs as a simple
infinite loop that BRPOP blocks on the Redis queue and immediately 
processes each message as it arrives (zero delay).
"""
import json
import os
import sys
import time
import requests
import redis
from dotenv import load_dotenv

# Add the parent directory to path so we can import from brain
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from brain.main import inference_router, TestMessage

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brain", ".env"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:3000")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def send_reply(to, message, source, business_id, **kwargs):
    """
    Send the AI reply back via the Gateway. 
    Uses structured retries and clear logging.
    """
    gateway_url = GATEWAY_URL.rstrip('/')
    
    payload = {
        "to": to,
        "message": message,
        "source": source,
        "business_id": business_id,
        "sender": "ai",
        "timestamp": time.time()
    }
    
    # Add optional context
    for key in ['conversation_id', 'chat_id']:
        if kwargs.get(key):
            payload[key] = kwargs.get(key)
            
    try:
        response = requests.post(f"{gateway_url}/api/messages/send", json=payload, timeout=10)
        response.raise_for_status()
        print(f"[Consumer] ✅ Callback to {gateway_url} successful ({response.status_code})")
    except Exception as e:
        print(f"[Consumer] ❌ Callback failed to {gateway_url}: {e}")
        # Secondary fallback if the primary service name fails (usually for local dev)
        if "localhost" not in gateway_url:
            try:
                print("[Consumer] 🔄 Attempting fallback to localhost:3000...")
                requests.post("http://localhost:3000/api/messages/send", json=payload, timeout=5)
            except:
                pass

def run():
    print(f"[Consumer] 🚀 Starting production-grade Redis consumer.")
    print(f"[Consumer]    Queue: 'incoming_messages' | Redis: {REDIS_URL}")
    
    while True:
        try:
            result = redis_client.brpop('incoming_messages', timeout=5)
            if not result:
                continue
            
            _, payload_bytes = result
            try:
                job = json.loads(payload_bytes)
            except json.JSONDecodeError as je:
                print(f"[Consumer] ⚠️ Failed to decode message JSON: {je}")
                continue
            
            print(f"[Consumer] 📩 Message from '{job.get('source')}' | User: {job.get('user_phone')}")
            
            # ── DELEGATE TO CELERY WORKER POOL ──
            # This allows 1000s of WhatsApp messages to be dispatched instantly!
            try:
                from worker.tasks import async_inference_router
                async_inference_router.delay(job)
                print(f"[Consumer] ⚡ Dispatched to Celery Worker")
            except ImportError:
                # Fallback for different execution contexts
                from tasks import async_inference_router
                async_inference_router.delay(job)
                print(f"[Consumer] ⚡ Dispatched to Celery Worker (fallback import)")
            
        except redis.exceptions.ConnectionError:
            print("[Consumer] 🔌 Redis connection lost. Reconnecting in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"[Consumer] 💥 Critical Loop Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    run()
