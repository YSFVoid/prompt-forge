# Prompt Forge

AI chatbot specializing in prompt engineering. Normal chat + prompt generation with a multi-language ML engine.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Auth | NextAuth (Google OAuth, Email magic link) |
| API | Next.js Route Handlers |
| LLM | Groq (llama-3.1-8b-instant) |
| Gateway | Go |
| ML | Python FastAPI, scikit-learn |
| Retriever | C++ TF-IDF |
| Database | MongoDB |

## Services

| Service | Port | Path |
|---------|------|------|
| Web | 3000 | `apps/web` |
| Engine Gateway | 4000 | `apps/engine-gateway` |
| ML Service | 5000 | `apps/ml-service` |
| Retriever | 6000 | `apps/retriever-cpp` |

## Setup

```bash
cd apps/web && npm install
cp .env.example apps/web/.env
npm run dev
```

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/chat` | Yes |
| GET | `/api/v1/history` | Yes |
| GET | `/api/v1/history/:id` | Yes |
| POST | `/api/v1/feedback` | Yes |
| GET | `/api/v1/health` | No |

## License

MIT
