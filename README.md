# Prompt Forge

AI-powered chatbot specializing in prompt engineering. Normal chat + prompt generation with a 3-language ML engine.

## Architecture

```
┌──────────┐     ┌─────────────────┐     ┌─────────────┐
│  Next.js │────▶│  Engine Gateway │────▶│  Python ML  │
│  :3000   │     │  (Go) :4000     │     │  (FastAPI)  │
│          │     │                 │     │  :5000      │
│  - Auth  │     │  - idea_score   │     │             │
│  - Chat  │     │  - quality_score│     │  - train    │
│  - UI    │     │  - retrieve     │     │  - predict  │
└──────────┘     │  - cache        │     └─────────────┘
                 │                 │     ┌─────────────┐
                 │                 │────▶│  C++ Retrvr │
                 └─────────────────┘     │  :6000      │
                                         │  - search   │
                                         └─────────────┘
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + TypeScript + Tailwind + Framer Motion |
| Auth | NextAuth (Google OAuth + Email magic link) |
| API | Next.js Route Handlers |
| LLM | Groq (llama-3.1-8b-instant) |
| Gateway | Go HTTP server with caching |
| ML | Python FastAPI (scikit-learn) |
| Retriever | C++ TF-IDF cosine similarity |
| Database | MongoDB (Mongoose + NextAuth adapter) |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/YSFVoid/prompt-forge.git
cd prompt-forge

# 2. Install web deps
cd apps/web && npm install

# 3. Configure env
cp .env.example apps/web/.env
# Edit apps/web/.env with your keys

# 4. Run web
npm run dev  # http://localhost:3000
```

### Run All Services

```bash
# Terminal 1: Web
npm run dev

# Terminal 2: Gateway (requires Go)
npm run dev:gateway

# Terminal 3: ML Service (requires Python)
npm run dev:ml

# Terminal 4: Retriever (requires g++)
cd apps/retriever-cpp && make && ./retriever
```

### Docker (all services)

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Project Structure

```
prompt-forge/
├── apps/
│   ├── web/                  # Next.js frontend + API
│   │   ├── app/              # Pages + API routes
│   │   ├── components/       # 12 Framer Motion components
│   │   └── lib/              # Auth, DB, Groq, models
│   ├── engine-gateway/       # Go internal gateway
│   ├── ml-service/           # Python ML training + inference
│   └── retriever-cpp/        # C++ TF-IDF retriever
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/chat` | ✅ | Send message, get AI response |
| GET | `/api/v1/history` | ✅ | List conversations |
| GET | `/api/v1/history/:id` | ✅ | Get conversation messages |
| POST | `/api/v1/feedback` | ✅ | Submit feedback (👍👎) |
| GET | `/api/v1/health` | ❌ | Health check |

## Gateway API (internal)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/infer/idea_score` | Score text as idea (0-1) |
| POST | `/infer/quality_score` | Score prompt quality (0-1) |
| POST | `/retrieve/examples` | Get similar prompt examples |
| POST | `/reload` | Clear cache, reload artifacts |

## Environment Variables

See `.env.example` for all required variables.

## License

MIT
