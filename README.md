# Prompt Forge 🔥

> Transform your ideas into powerful AI prompts that work with any model.

An enterprise-grade **Idea → Prompt Generator** platform with a Node.js/Express API and Next.js frontend.

## 🏗️ Architecture

```
prompt-forge/
├── apps/
│   ├── api/        # Express + TypeScript REST API
│   └── web/        # Next.js 14 Dashboard (App Router)
├── packages/
│   └── shared/     # Shared TypeScript types + Zod validators
├── docs/
└── README.md
```

## ✨ Features

- 🎨 Modern dark purple glassmorphism UI with animated gradient blobs
- 🌍 Multi-language support (English, Arabic, Darija — auto-detected)
- ⚡ Groq-powered AI prompt generation (OpenAI-compatible)
- 🧠 Smart idea detection — asks clarifying questions for vague ideas
- 📋 One-click copy + quality score badge
- 👍👎 Feedback buttons
- 📜 Local history (last 10 prompts)
- 🔐 API key authentication with hashed storage (argon2)
- 📊 Rate limiting + daily quotas per key
- 🛡️ Admin endpoints for key management and usage stats

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (optional — API works without it, data won't persist)
- **Groq API key** — get one free at [console.groq.com](https://console.groq.com)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set your GROQ_API_KEY

# Web
cp apps/web/.env.example apps/web/.env
```

#### Required API Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | **Required** |
| `ADMIN_KEY` | Admin secret for `/v1/admin/*` endpoints | (disabled if not set) |
| `MONGODB_URI` | MongoDB connection string | (disabled if not set) |
| `PORT` | API server port | `3001` |
| `DEFAULT_MODEL` | Default Groq model | `llama-3.1-8b-instant` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

### 3. Run Development Servers

```bash
# API only
npm run dev:api

# Web only
npm run dev:web

# Both
npm run dev:all
```

- **API**: http://localhost:3001
- **Web**: http://localhost:3000

### 4. Run Tests

```bash
npm test
```

## 🔑 API Authentication

### Creating an Admin Key

Set `ADMIN_KEY` in your `apps/api/.env` file:

```env
ADMIN_KEY=my-super-secret-admin-key-123
```

### Creating User API Keys (via Admin Endpoint)

```bash
curl -X POST http://localhost:3001/v1/admin/keys \
  -H "Content-Type: application/json" \
  -H "x-admin-key: my-super-secret-admin-key-123" \
  -d '{"name": "MyApp", "rateLimitPerMin": 30, "quotaPerDay": 500}'
```

The response will include the raw API key **once** — save it securely:

```json
{
  "success": true,
  "apiKey": {
    "id": "...",
    "name": "MyApp",
    "key": "pf_abc123...",
    "rateLimitPerMin": 30,
    "quotaPerDay": 500
  }
}
```

### Using the API Key

Send it in the `x-api-key` header:

```bash
curl -X POST http://localhost:3001/v1/prompt \
  -H "Content-Type: application/json" \
  -H "x-api-key: pf_abc123..." \
  -d '{"idea": "A mobile app that tracks water intake with smart reminders"}'
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/prompt` | `x-api-key` | Generate prompt from idea |
| `POST` | `/v1/feedback` | `x-api-key` | Submit feedback (👍/👎) |
| `GET` | `/v1/health` | None | Health check |
| `GET` | `/v1/models` | None | List available models |
| `POST` | `/v1/admin/keys` | `x-admin-key` | Create user API key |
| `DELETE` | `/v1/admin/keys/:id` | `x-admin-key` | Revoke API key |
| `GET` | `/v1/admin/usage` | `x-admin-key` | View usage stats |

## 🚢 Deployment

### Railway

1. Create a new Railway project
2. Add a **MongoDB** service
3. Add a **Node.js** service for the API:
   - Set build command: `npm run build:api`
   - Set start command: `npm run start --workspace=@prompt-forge/api`
   - Add environment variables (`GROQ_API_KEY`, `MONGODB_URI`, `ADMIN_KEY`)
4. Add a **Node.js** service for the web:
   - Set build command: `npm run build:web`
   - Set start command: `npm run start --workspace=@prompt-forge/web`
   - Set `NEXT_PUBLIC_API_URL` to the API service URL

## 📝 License

MIT
