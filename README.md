# Prompt Forge

A premium AI chatbot specialized in **prompt engineering**. Chat naturally or generate powerful prompts for any AI model.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Auth | NextAuth.js (Google OAuth, Email Magic Link) |
| Database | MongoDB (Mongoose) |
| AI | Groq API (LLama 3.1) |

## Features

- Normal conversational chat with AI assistant
- Prompt engineering mode (toggle or auto-detect)
- Master Prompt + Variant A/B generation
- Conversation history with search
- Google OAuth and Email login
- Premium dark purple UI with animated backgrounds

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `apps/web/.env.example` to `apps/web/.env` and fill in:

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret
GROQ_API_KEY=gsk_...
GOOGLE_CLIENT_ID=...     (optional)
GOOGLE_CLIENT_SECRET=... (optional)
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/chat` | Send message (auth required) |
| GET | `/api/v1/history` | List conversations |
| GET | `/api/v1/history/:id` | Load conversation messages |
| GET | `/api/v1/health` | Health check |

## Project Structure

```
apps/web/
  app/
    api/auth/[...nextauth]/route.ts
    api/v1/chat/route.ts
    api/v1/history/route.ts
    api/v1/health/route.ts
    page.tsx
    signin/page.tsx
    history/page.tsx
    layout.tsx
    globals.css
  components/
    BackgroundBlobs.tsx
    ChatComposer.tsx
    HistoryPanel.tsx
    ModeToggle.tsx
    NoiseOverlay.tsx
    OutputPanel.tsx
    Providers.tsx
    Sidebar.tsx
    Skeleton.tsx
    Toast.tsx
    UserMenu.tsx
  lib/
    auth.ts
    groq.ts
    models.ts
    mongodb.ts
    promptDetector.ts
```

## License

MIT
