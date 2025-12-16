import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

agent_data = {
    "business_id": "00000000-0000-4000-8000-000000000001",
    "name": "Support Specialist",
    "role": "technical support",
    "system_prompt": "You are a professional customer support agent for Omnixa. Help customers politely with their technical inquiries. Keep answers short and conversational.",
    "ai_model": "llama-3.1-8b-instant",
    "status": "active"
}

print(f"Force-creating agent for Business ID: {agent_data['business_id']}...")

try:
    resp = requests.post(f"{SUPABASE_URL}/rest/v1/ai_agents", headers=headers, json=agent_data)
    if resp.status_code in [200, 201]:
        print("✅ SUCCESS: Support Specialist agent created!")
    else:
        print(f"❌ FAILED: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"❌ ERROR: {e}")
