# Prompt Forge 🔥

> Transform your ideas into powerful AI prompts that work with any model.

An enterprise-grade **Idea → Prompt Generator** platform with multi-service architecture.

## 🏗️ Architecture

```
prompt-forge/
├── apps/
│   ├── api/       # Express + TypeScript REST API
│   ├── web/       # Next.js 14 Frontend
│   ├── engine/    # C++ ML Inference Engine
│   └── trainer/   # Python FastAPI Training Service
├── packages/
│   └── shared/    # Shared TypeScript types
└── docker-compose.yml
```

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start API (port 3001)
npm run dev:api

# Start Web (port 3000) - in another terminal
cd apps/web && npm run dev
```

Open http://localhost:3000

### Docker Compose (All Services)

```bash
# Copy and configure env
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Start all services
docker-compose up -d
```

## ⚙️ Configuration

### API (.env)
```env
GROQ_API_KEY=your_key      # Required
PUBLIC_MODE=true           # No auth required
```

## 📡 API Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| **API** | `POST /v1/public/prompt` | Generate prompts |
| **API** | `GET /v1/health` | Health check |
| **Engine** | `POST /infer/idea_score` | Score idea |
| **Engine** | `POST /retrieve/examples` | RAG retrieval |
| **Trainer** | `POST /training/train` | Trigger training |

### Example Request

```bash
curl -X POST http://localhost:3001/v1/public/prompt \
  -H "Content-Type: application/json" \
  -d '{"idea": "A mobile app to track reading goals"}'
```

## ✨ Features

- 🎨 Modern glassmorphism dark UI
- 🌍 Multi-language (English, Arabic, Darija)
- ⚡ Fast Groq inference
- 📋 One-click copy
- 🧠 ML-powered scoring & retrieval
- 🐳 Docker-ready

## 📝 License

MIT