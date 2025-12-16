import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

print(f"Checking Supabase at: {SUPABASE_URL}")

try:
    resp = requests.get(f"{SUPABASE_URL}/rest/v1/ai_agents", headers=headers)
    if resp.status_code == 200:
        agents = resp.json()
        print(f"Found {len(agents)} agents:")
        for a in agents:
            print(f"- {a.get('name')} (ID: {a.get('id')}, Business: {a.get('business_id')})")
    else:
        print(f"Error fetching agents: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"Network error: {e}")
