import os
import requests
import json
import hashlib
from typing import List
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class RAGIngestor:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.sb_url = os.getenv("SUPABASE_URL")
        self.sb_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        self.headers = {
            "apikey": self.sb_key,
            "Authorization": f"Bearer {self.sb_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _get_embedding(self, text: str) -> List[float]:
        """Generates embedding for a text chunk."""
        try:
            resp = self.client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return resp.data[0].embedding
        except Exception as e:
            print(f"OpenAI Embedding error: {e}")
            try:
                from google import genai
                api_key = os.getenv("GEMINI_API_KEY")
                if api_key:
                    client = genai.Client(api_key=api_key)
                    result = client.models.embed_content(
                        model="gemini-embedding-001",
                        contents=text
                    )
                    if result and result.embeddings:
                        print("Successfully used Gemini fallback for embedding (1536 dim).")
                        return result.embeddings[0].values[:1536]
                print("Gemini API Key not found or failed, skipping fallback.")
            except Exception as gemini_e:
                print(f"Gemini Fallback error: {gemini_e}")
            return []

    def _split_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """Simple recursive character splitter logic."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def ingest_website(self, business_id: str, url: str, source_id: str = None):
        """Crawls and ingests a website URL."""
        print(f"Ingesting website: {url}")
        try:
            # 1. Scrape Content
            res = requests.get(url, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Clean: Remove scripts, styles, nav, footer
            for s in soup(['script', 'style', 'nav', 'footer']):
                s.decompose()
            
            text = soup.get_text(separator=' ', strip=True)
            
            # 2. Chunking
            chunks = self._split_text(text)
            
            # 3. Create or Update Knowledge Source
            if not source_id:
                source_data = {
                    "business_id": business_id,
                    "source_type": "web",
                    "source_name": url,
                    "source_url": url,
                    "status": "processing"
                }
                source_res = requests.post(f"{self.sb_url}/rest/v1/knowledge_sources", headers=self.headers, json=source_data)
                source_id = source_res.json()[0]['id'] if source_res.status_code == 201 else None
            else:
                requests.patch(f"{self.sb_url}/rest/v1/knowledge_sources?id=eq.{source_id}", headers=self.headers, json={"status": "processing"})
            
            # 4. Embed and Store
            self._process_chunks(business_id, source_id, chunks)
            
            # 5. Mark as Completed
            requests.patch(f"{self.sb_url}/rest/v1/knowledge_sources?id=eq.{source_id}", headers=self.headers, json={"status": "completed"})
            
        except Exception as e:
            print(f"Website ingestion failed: {e}")

    def ingest_pdf(self, business_id: str, file_path: str, source_id: str = None):
        """Parses and ingests a PDF file."""
        print(f"Ingesting PDF: {file_path}")
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
                
            chunks = self._split_text(text)
            
            if not source_id:
                source_data = {
                    "business_id": business_id,
                    "source_type": "file",
                    "source_name": os.path.basename(file_path),
                    "status": "processing"
                }
                source_res = requests.post(f"{self.sb_url}/rest/v1/knowledge_sources", headers=self.headers, json=source_data)
                source_id = source_res.json()[0]['id'] if source_res.status_code == 201 else None
            else:
                requests.patch(f"{self.sb_url}/rest/v1/knowledge_sources?id=eq.{source_id}", headers=self.headers, json={"status": "processing"})
            
            self._process_chunks(business_id, source_id, chunks)
            
            requests.patch(f"{self.sb_url}/rest/v1/knowledge_sources?id=eq.{source_id}", headers=self.headers, json={"status": "completed"})

        except Exception as e:
            print(f"PDF ingestion failed: {e}")

    def _process_chunks(self, business_id: str, source_id: str, chunks: List[str]):
        """Embeds and batches chunks into Supabase knowledge_nodes."""
        nodes = []
        for i, chunk in enumerate(chunks):
            embedding = self._get_embedding(chunk)
            if embedding:
                nodes.append({
                    "business_id": business_id,
                    "source_id": source_id,
                    "content": chunk,
                    "embedding": embedding,
                    "chunk_index": i
                })
                
            # Batch insert every 10 chunks to avoid payload limits
            if len(nodes) >= 10:
                requests.post(f"{self.sb_url}/rest/v1/knowledge_nodes", headers=self.headers, json=nodes)
                nodes = []
        
        if nodes:
            requests.post(f"{self.sb_url}/rest/v1/knowledge_nodes", headers=self.headers, json=nodes)

if __name__ == "__main__":
    # Example usage (Conceptual)
    # ingestor = RAGIngestor()
    # ingestor.ingest_website("uuid-here", "https://example.com/faq")
    pass
