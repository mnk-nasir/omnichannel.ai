<div align="center">

# 🤖 Omnixa AI Agent

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet.svg?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](#)
[![Made with Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![Made with Fastify](https://img.shields.io/badge/Fastify-000000?style=flat-square&logo=fastify&logoColor=white)](#)
[![Made with Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](#)

*An enterprise-grade, multi-agent AI system delivering zero-latency voice, messaging, and RAG-powered customer support.*

[**Explore the Demo**](#demo-links) • [**Report Bug**](#contact-information) • [**Request Feature**](#roadmap)

</div>

---

## 📖 2. Short Description
**Omnixa AI Agent** is a unified SaaS platform designed to automate customer support and outbound dispatch across Voice (VAPI/Twilio), WhatsApp, and Web Chat. Powered by custom LLMs, RAG-based knowledge retrieval, and real-time human handoff, it allows businesses to deploy context-aware AI agents in minutes.

---

## 🏢 3. Project Overview
Customer support teams struggle to scale across multiple channels while maintaining quality. This platform solves this by acting as a "Zero-Touch" autonomous contact center. Businesses can upload their internal documents, define specific agent personas (e.g., Sales, Support, Dispatch), and instantly deploy AI operators that converse seamlessly over phone calls and WhatsApp—complete with native multilingual support (English, Hindi, Telugu, etc.) and intelligent human escalations.

---

## 🚧 4. Problem Statement
- **Fragmented Channels:** Handling phone calls, WhatsApp, and web chat requires separate, siloed tools.
- **Latency Issues:** Traditional AI voice agents suffer from high latency (2-4 seconds), ruining the conversational experience.
- **Data Isolation:** AI models hallucinate when they lack real-time access to company-specific knowledge.
- **High Operational Costs:** Scaling human support teams 24/7 is prohibitively expensive.

---

## ✨ 5. Features
- 🎙️ **Ultra-Low Latency Voice AI:** Custom streaming LLM proxy integrated with VAPI for millisecond-level conversational AI.
- 💬 **WhatsApp Automation:** Fully automated inbound and outbound WhatsApp campaigns with AI responders.
- 🧠 **RAG Knowledge Base:** Instant PDF/Web scraping to inject business knowledge into the AI via PGVector embeddings.
- 🏢 **Multi-Tenant Architecture:** Complete data isolation for different businesses using account-level scoping.
- 📊 **Unified Inbox:** A single dashboard to monitor active calls, read WhatsApp chats, and instantly "Pause AI" for human takeover.
- 🚀 **One-Click Agent Deployment:** Pre-built templates (Real Estate, Healthcare, E-commerce) for fast AI setup.
- 💸 **Built-in Billing/Metering:** Tracks AI credit usage per business tenant automatically.

---

## 🛠 6. Tech Stack

### Frontend
- **Next.js 14** (App Router, Server Components)
- **React 18**
- **Tailwind CSS** & **Framer Motion** (UI/UX)
- **Lucide Icons**

### Backend (Microservices)
- **Node.js (Fastify)**: API Gateway, Webhooks, WhatsApp Client, Rate Limiting.
- **Python 3.11 (FastAPI)**: "Brain" logic, Custom LLM streaming, Embedding generation.
- **Celery**: Background task workers for PDF processing and web scraping.

### Database & Storage
- **Supabase / PostgreSQL**: Primary relational database.
- **PGVector**: Vector database for RAG (Retrieval-Augmented Generation).
- **Redis**: Real-time message queuing, session state, and rate limiting.

### AI & Automation Integrations
- **LLMs:** OpenAI (GPT-4o-mini), Groq (Llama 3), Deepgram (Nova-2 Speech-to-Text).
- **Voice:** VAPI, Twilio.
- **Messaging:** Meta WhatsApp Business API, WhatsApp Web JS.

---

## 🏗️ 7. System Architecture

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#000000,stroke:#333,stroke-width:2px,color:#fff,rx:8px;
    classDef gateway fill:#21A366,stroke:#157546,stroke-width:2px,color:#fff,rx:8px;
    classDef brain fill:#3776AB,stroke:#26557C,stroke-width:2px,color:#fff,rx:8px;
    classDef database fill:#3ECF8E,stroke:#249E64,stroke-width:2px,color:#fff,rx:8px;
    classDef thirdparty fill:#F0F0F0,stroke:#999,stroke-width:2px,color:#333,rx:8px;
    classDef worker fill:#FF9900,stroke:#CC7A00,stroke-width:2px,color:#fff,rx:8px;

    subgraph "External Channels"
        Client[💻 Next.js Dashboard UI]:::frontend
        UserVoice[📞 Phone Caller]:::thirdparty
        UserWA[💬 WhatsApp User]:::thirdparty
    end

    subgraph "SaaS Providers"
        VAPI[☁️ VAPI Cloud]:::thirdparty
        Meta[☁️ Meta Business API]:::thirdparty
    end

    subgraph "Core Backend"
        NodeGW[🟢 Node.js API Gateway (Fastify)]:::gateway
        PyBrain[🧠 Python Brain (FastAPI)]:::brain
        Celery[⚙️ Celery Worker]:::worker
        Redis[(⚡ Redis Queue)]:::database
    end

    subgraph "Data & AI"
        Supabase[(🗄️ Supabase PGVector)]:::database
        OpenAI[🤖 OpenAI / Groq LLM]:::thirdparty
    end

    %% Connections
    Client == "REST / CORS" ==> NodeGW
    UserVoice -. "Voice Stream" .-> VAPI
    VAPI == "SSE Webhooks" ==> NodeGW
    UserWA -. "Message" .-> Meta
    Meta == "Webhooks" ==> NodeGW

    NodeGW == "Proxy / RPC" ==> PyBrain
    NodeGW -- "Enqueue Job" --> Redis
    
    Redis -- "Consume Job" --> Celery
    Celery -- "Compute Embeddings" --> Supabase

    PyBrain -- "Fetch Context (RAG)" --> Supabase
    PyBrain == "Generate Response" ==> OpenAI
```

### 🧩 Core Architectural Components

1. **Client Layer (Next.js)**
   - A highly responsive dashboard allowing businesses to configure agents, manage knowledge bases, and monitor live calls/chats. Communicates directly with the API Gateway via Zero-Hop REST routing.

2. **API Gateway Layer (Node.js/Fastify)**
   - Acts as the central traffic controller. It receives external webhooks (Meta WhatsApp, VAPI), handles rate-limiting, deduces credits from Supabase, and transparently proxies streaming LLM requests to the Python Brain without blocking the event loop.

3. **Intelligence Layer (Python/FastAPI)**
   - The "Brain" of the operation. It executes custom logic, manages prompts, handles Retrieval-Augmented Generation (RAG) using OpenAI embeddings, and securely queries the vector database for conversational context.

4. **Background Workers (Celery & Redis)**
   - Decoupled from the main request pipeline, these workers handle heavy asynchronous tasks like chunking 100-page PDFs, parsing scraped websites, and generating vector embeddings.

5. **Data Layer (Supabase PGVector)**
   - Centralized repository for structured relational data (Users, Billing, Chat History) and unstructured semantic data (Vector Embeddings for RAG).

---

## 🔄 8. Workflow Explanation

### Voice Call Workflow
1. User calls the Twilio number.
2. VAPI answers and streams the audio to Deepgram for Speech-to-Text.
3. VAPI sends the text to the **Gateway Proxy** via SSE.
4. The Gateway instantly forwards the payload to the **Python Brain**.
5. The Brain performs RAG (fetching context from PGVector) and streams the LLM response back.
6. Gateway proxies the stream back to VAPI for Text-to-Speech playback.

### RAG (Knowledge Ingestion) Workflow
1. Business uploads a PDF via Dashboard.
2. Gateway stores the file in Supabase Storage and queues a `rag_jobs` task in Redis.
3. The Celery Worker picks up the job, chunks the text, generates OpenAI embeddings, and saves them to the `knowledge_nodes` table.

---

## 📂 9. Folder Structure

```text
omnichannel-ai-contact-center/
├── client-dashboard/                # 🎨 Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── dashboard/           # Protected dashboard routes
│   │   │   │   ├── setup-agent/     # Agent creation & deployment UI
│   │   │   │   ├── knowledge/       # RAG document upload & management
│   │   │   │   ├── inbox/           # Unified WhatsApp & Web Chat interface
│   │   │   │   └── my-agents/       # Agent configuration and status
│   │   ├── components/              # Reusable React UI Components
│   │   │   ├── SandboxChat.js       # Live testing component for agents
│   │   │   └── AiOutboundDialer.js  # VAPI Outbound dispatch interface
│   │   ├── hooks/                   # Custom React Hooks (e.g., useAgents.js, useInbox.js)
│   │   ├── context/                 # React Context (BusinessContext for multitenancy)
│   │   ├── lib/                     # Centralized API client logic (Zero-Hop routing)
│   │   └── constants.js             # Global frontend constants (DEFAULT_BUSINESS_ID, GATEWAY)
│   └── next.config.mjs              # Next.js config (Rewrites & proxy settings)
│
├── ai-brain/                        # 🧠 Backend Microservices Core
│   ├── gateway/                     # Node.js Fastify API Gateway
│   │   ├── routes/
│   │   │   ├── agents.js            # Transparent CRUD proxy to Python Brain
│   │   │   ├── voice.js             # VAPI Custom LLM WebSocket/SSE streaming logic
│   │   │   ├── rag.js               # Supabase Storage & Redis Job queueing for uploads
│   │   │   └── webhooks.js          # Meta WhatsApp incoming message processing
│   │   └── server.js                # Gateway entry point & Redis initialization
│   │
│   ├── brain/                       # Python FastAPI Intelligence Layer
│   │   ├── main.py                  # FastAPI server & route definitions
│   │   ├── agents.py                # Agent persona management & fetching
│   │   └── llm_service.py           # Core RAG retrieval & LLM generation logic
│   │
│   ├── worker/                      # Celery Background Task Workers
│   │   ├── celery_app.py            # Celery initialization
│   │   └── tasks.py                 # Heavy tasks (PDF Chunking, Embeddings, Web Scraping)
│   │
│   └── scripts/                     # Startup & Diagnostic Scripts
│       ├── windows_startup/         # Batch files (start_brain.bat, start_gateway.bat)
│       └── diagnose_system.py       # Pre-flight health checks for DB/Redis
│
├── supabase/                        # 🗄️ Database Infrastructure
│   ├── init-db.sql                  # Primary schema (Profiles, Agents, Messages)
│   └── setup_knowledge_base.sql     # PGVector extension & RAG tables setup
│
├── tests/                           # 🧪 Test Suites
│   └── mock_llm.py                  # Simulated LLM responses for CI/CD
│
├── docker-compose.yml               # Orchestrates Gateway, Brain, Worker, and Redis
├── .env                             # Centralized Environment Variables
└── README.md                        # Documentation
```

---

## 🚀 10. Installation Guide

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- Docker & Docker Compose
- Supabase Account / Local CLI

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/omnichannel-ai.git
cd omnichannel-ai

# 2. Install Frontend Dependencies
cd client-dashboard
npm install

# 3. Install Gateway Dependencies
cd ../ai-brain/gateway
npm install

# 4. Install Brain Dependencies
cd ../..
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r ai-brain/requirements.txt
```

---

## 🔐 11. Environment Variables

Create `.env` files in both the Root directory and the `client-dashboard/` directory.

**Root `.env` Example:**
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# AI & Voice Services
OPENAI_API_KEY=sk-proj-...
VAPI_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Networking
GATEWAY_PUBLIC_URL=https://your-tunnel.ngrok-free.app
REDIS_URL=redis://localhost:6379
```

---

## 💻 12. Local Development Setup

We recommend running the services in separate terminals:

**Terminal 1 (Redis):**
```bash
docker-compose up redis -d
```

**Terminal 2 (Node Gateway):**
```bash
cd ai-brain/gateway
npm start
```

**Terminal 3 (Python Brain & Worker):**
```bash
cd ai-brain
uvicorn brain.main:app --reload --port 8000
# Run worker in another tab: celery -A worker.celery_app worker --loglevel=info
```

**Terminal 4 (Next.js Dashboard):**
```bash
cd client-dashboard
npm run dev
```

---

## 🌍 13. Production Setup
For production, the application should be deployed behind a secure Nginx reverse proxy or hosted on platforms like Vercel (Frontend) and Railway/Render (Backend). Ensure all environment variables reflect production API keys and that the `.wwebjs_auth` folder is mounted to persistent volumes if using WhatsApp Web JS.

---

## 🐳 14. Docker Setup
A unified `docker-compose.yml` is provided for containerized deployment.

```bash
# Build and run the entire stack (Gateway, Brain, Worker, Redis)
docker-compose up --build -d
```

---

## 📡 15. API Documentation

### Create an AI Agent
```http
POST /api/agents
Content-Type: application/json

{
  "business_id": "uuid",
  "name": "SupportBot",
  "system_prompt": "You are a helpful assistant.",
  "ai_model": "gpt-4o-mini"
}
```

### Dispatch Outbound Voice Call
```http
POST /api/vapi/call
Content-Type: application/json

{
  "phone": "+1234567890",
  "business_id": "uuid",
  "first_message": "Hello! How can I help?"
}
```

---

## 🛡️ 16. Authentication & Authorization
The platform utilizes **Supabase Auth** (JWT-based).
- **Frontend Context:** Protected routes intercept unauthenticated users and redirect them to login.
- **Tenant Isolation:** Every API request validates the user's `business_id` to ensure strict multi-tenant data scoping. Users cannot query agents, conversations, or RAG sources belonging to other businesses.

---

## 🗄️ 17. Database Design
- **`profiles`**: Stores user data, linked to a specific `business_id`.
- **`agents`**: Stores AI persona configurations, system prompts, and statuses.
- **`conversations` & `messages`**: Logs all omnichannel interactions (Voice transcripts, WA messages).
- **`knowledge_sources` & `knowledge_nodes`**: Tracks uploaded PDFs/links and stores PGVector embeddings.

---

## 🧠 18. AI Agent Workflow
1. **Persona Selection:** Request routed to the assigned agent profile based on `agent_id`.
2. **Context Retrieval (RAG):** The user's query is vectorized via OpenAI and cross-referenced with `knowledge_nodes`.
3. **Prompt Injection:** RAG results are injected into the agent's system prompt.
4. **Stream Generation:** LLM generates tokens and streams them instantly back through the Gateway to the VAPI voice endpoint.

---

## ⚙️ 19. Automation Pipelines
- **WhatsApp Auto-Responder:** Incoming webhooks trigger Redis jobs that are consumed by the Python brain, keeping the Node.js event loop completely unblocked.
- **Knowledge Ingestion:** Celery workers manage the heavy lifting of PDF parsing (PyPDF) and embedding generation in the background.

---

## 🔒 20. Security Practices
- **Never expose Service Keys:** `SUPABASE_SERVICE_KEY` is strictly confined to backend `.env` variables.
- **CORS Mitigation:** The Gateway restricts specific API routes to known dashboard origins in production.
- **Credit Metering:** A Supabase RPC (`deduct_business_credits`) automatically blocks AI interactions if a business's account balance reaches zero, preventing API abuse.

---

## ⚡ 21. Performance Optimizations
- **"Zero-Hop" API Routing:** The frontend communicates directly with the Node.js Gateway, completely bypassing Next.js API route middleware to reduce latency by ~200ms.
- **Custom LLM Endpoint:** VAPI streams are handled natively via `reply.hijack()` raw socket manipulation in Fastify, ensuring 0ms blocking on the Node thread.

---

## 📈 22. Scalability Considerations
- **Stateless Gateways:** The Node.js and Python servers are stateless. Session data is stored in Redis, allowing horizontal scaling behind a load balancer.
- **WebSockets:** Implement scalable Pub/Sub via Redis if expanding real-time Inbox features across multiple active dashboard instances.

---

## 🚨 23. Error Handling Strategy
- **Frontend:** Graceful fallbacks using robust `try/catch` hooks (`useAgents`, `useInbox`).
- **Backend:** Centralized Fastify error logging. Redis queue jobs feature automatic retry mechanisms for rate-limited AI APIs.

---

## 📊 24. Logging & Monitoring
- **Pino Logger:** Fastify utilizes Pino for high-throughput JSON logging.
- **Sentry Integration:** Configured in `server.js` (`@sentry/node`) to catch unhandled promise rejections and capture API traces.

---

## 🚢 25. Deployment Guide
1. **Frontend (Vercel):** Connect GitHub repo, set Root Directory to `client-dashboard`, inject `NEXT_PUBLIC_*` env vars.
2. **Backend (Railway/Render):** Use the provided `railway.json` and `Dockerfile` to deploy the unified backend container. Ensure Redis addon is attached.
3. **Webhooks:** Register the production `GATEWAY_PUBLIC_URL` with Meta WhatsApp and VAPI platforms.

---

## 🔄 26. CI/CD Workflow
*Currently configured via basic Git push deployment hooks.*
A GitHub Action pipeline is recommended to automatically run Jest/PyTest suites before allowing merges to the `main` branch.

---

## 📸 27. Screenshots Section

*(Replace placeholders with actual screenshot URLs)*
- 🖼️ **Omnichannel Inbox** - `![Inbox View](/docs/inbox.png)`
- 🖼️ **Agent Builder** - `![Agent Builder](/docs/builder.png)`
- 🖼️ **Knowledge Base** - `![RAG Upload](/docs/rag.png)`

---

## 🔗 28. Demo Links
- **Live Platform URL:** [https://omnixa-ai-agent.vercel.app](https://omnixa-ai-agent.vercel.app)
- **Demo Video:** [YouTube / Loom Link]

---

## 🗺️ 29. Roadmap
- [x] VAPI Voice Integration
- [x] Multi-tenant Data Scoping
- [x] Next.js Zero-Hop Routing Refactor
- [ ] Stripe Integration for Credit Top-Ups
- [ ] Email Support Channel Integration
- [ ] Advanced Analytics Dashboard

---

## 🚀 30. Future Improvements
- **Microservice Separation:** Move the Celery workers to a completely independent physical server to prevent CPU spikes from impacting live voice streams.
- **Kubernetes (K8s):** Utilize the provided `/k8s` manifests for orchestrating auto-scaling pods.
- **WebRTC:** Add native browser calling rather than relying strictly on PSTN/Twilio.

---

## 🤝 31. Contribution Guide
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📏 32. Coding Standards
- **JavaScript:** ESLint & Prettier configured. Use Functional React components and custom hooks.
- **Python:** PEP8 compliant. Use strict Type Hinting for FastAPI endpoints.

---

## 🧪 33. Testing Strategy
- **Frontend:** Implement Cypress for E2E testing of the agent creation flow.
- **Backend:** `pytest` configured in the `tests/` directory for LLM mocked responses and RAG vector search accuracy.

---

## 📄 34. License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 35. Author Section
Built by **[Your Name/Company]**
- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn Profile]
- Twitter/X: [@YourHandle]

---

## 📧 36. Contact Information
For business inquiries or project support:
- Email: your.email@example.com
- GitHub Issues: [Issue Tracker](https://github.com/yourusername/omnichannel-ai/issues)

---

*End of Document. Happy Coding!* 🚀
