import os
import redis
import requests
import json
from datetime import datetime

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def check_redis():
    log("Checking Redis connectivity...")
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
    try:
        r = redis.from_url(redis_url)
        r.ping()
        log("✅ Redis is UP")
    except Exception as e:
        log(f"❌ Redis is DOWN: {e}")

def check_supabase():
    log("Checking Supabase connectivity...")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        log("❌ Supabase environment variables missing")
        return
    
    try:
        resp = requests.get(f"{url}/rest/v1/ai_agents", headers={"apikey": key, "Authorization": f"Bearer {key}"}, timeout=5)
        if resp.status_code == 200:
            log(f"✅ Supabase is reachable ({len(resp.json())} agents found)")
        else:
            log(f"❌ Supabase error {resp.status_code}: {resp.text}")
    except Exception as e:
        log(f"❌ Supabase connection failed: {e}")

    # Check local agents
    try:
        if os.path.exists("agents_local.json"):
            with open("agents_local.json", "r") as f:
                local_agents = json.load(f)
                log(f"✅ Local storage has {len(local_agents)} agents")
        else:
            log("⚠️ No local agents_local.json found")
    except Exception as e:
        log(f"❌ Error reading local agents: {e}")

def check_gateway():
    log("Checking Gateway connectivity...")
    try:
        resp = requests.get("http://gateway:3000/health", timeout=2)
        if resp.status_code == 200:
            log("✅ Gateway is UP internally")
        else:
            log(f"❌ Gateway returned {resp.status_code}")
    except Exception:
        log("❌ Gateway is unreachable internally")

def check_brain():
    log("Checking Brain connectivity...")
    try:
        resp = requests.get("http://brain:8000/health", timeout=2)
        if resp.status_code == 200:
            log("✅ Brain is UP internally")
        else:
            log(f"❌ Brain returned {resp.status_code}")
    except Exception:
        log("❌ Brain is unreachable internally")

def check_public_url():
    url = os.getenv("GATEWAY_PUBLIC_URL")
    if not url:
        log("⚠️ GATEWAY_PUBLIC_URL not set. VAPI will not work.")
        return
    
    log(f"Checking public reachability of {url}...")
    try:
        # We check the health endpoint on the public URL
        resp = requests.get(f"{url}/health", timeout=5)
        if resp.status_code == 200:
            log("✅ Gateway is reachable from the INTERNET")
        else:
            log(f"❌ Gateway public URL returned {resp.status_code}. Is ngrok running?")
    except Exception as e:
        log(f"❌ Gateway public URL unreachable: {e}. Check your tunnel.")

if __name__ == "__main__":
    print("=== Omnixa System Diagnosis ===")
    check_redis()
    check_supabase()
    check_gateway()
    check_brain()
    check_public_url()
    print("===============================")
