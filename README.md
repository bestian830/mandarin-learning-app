# Mandarin Master

A full-stack web application for learning Mandarin Chinese — featuring dictionary search with word segmentation, pinyin annotation, text-to-speech, flashcards with spaced repetition, and an HSK vocabulary browser.

## Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | **React 19** with TypeScript |
| Bundler | **Vite 8** (dev server + build) |
| Styling | **Tailwind CSS 4** (utility-first) |
| State Management | **Zustand 5** (lightweight, no Provider boilerplate) |
| Routing | **React Router 7** (SPA client-side routing) |
| Linting | ESLint 9 + typescript-eslint |

### Backend

| Layer | Technology |
|-------|-----------|
| Framework | **Express 5** with TypeScript |
| ORM | **Prisma 6** (schema-first, type-safe queries) |
| Database | **PostgreSQL 16** (user data, 17 tables) + **SQLite** via better-sqlite3 (offline dictionary) |
| Auth | **JWT** + **bcryptjs** (httpOnly cookie sessions) |
| Chinese NLP | **nodejieba** (word segmentation), **pinyin** (romanization), **opencc-js** (simplified ↔ traditional) |
| External APIs | **Azure Translator** (translation + transliteration), **Azure Speech** (TTS) |
| Dev Tooling | tsx, nodemon, Docker Compose |

### Infrastructure

- **Docker Compose** — local PostgreSQL 16 (Alpine) on port 5433
- **Vite Dev Proxy** — `/api` and `/auth` requests forwarded to Express backend
- **Prisma Migrations** — versioned schema changes in `backend/prisma/migrations/`

## Features

- **Dictionary Search** — enter Chinese characters, English words, or pinyin; returns segmented words with pinyin, part-of-speech, and definitions
- **Text-to-Speech** — pronunciation powered by Azure Speech Services
- **Flashcard System** — Leitner box-based spaced repetition (5 boxes), cloud-synced per user
- **HSK Vocabulary Browser** — browse HSK 1–9 word lists with infinite scroll
- **Pinyin Reference Guide** — interactive chart with audio samples for all initials, finals, and whole syllables
- **Simplified / Traditional Toggle** — switch between 简体 and 繁體 display via opencc-js
- **User Authentication** — email registration, login, JWT session persistence, onboarding flow
- **i18n** — UI available in English and Chinese, with server-side translation caching

## Project Structure

```
mandarin_master/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express entry point
│   │   ├── auth/               # JWT auth (register, login, middleware)
│   │   ├── db/                 # Prisma client initialization
│   │   ├── lib/                # NLP utilities (segmentation, pinyin, TTS, translation)
│   │   ├── routes/             # REST API routes
│   │   └── types/              # TypeScript type definitions
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (17 tables)
│   ├── scripts/                # Dictionary build & HSK import scripts
│   ├── docker-compose.yml      # Local PostgreSQL container
│   └── .env.example            # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root component (routing, session init)
│   │   ├── pages/              # Page components (Home, Login, Register, Onboarding, Profile)
│   │   ├── components/         # UI components (SearchBar, Result, FlashcardReview, etc.)
│   │   ├── store/              # Zustand store (user state)
│   │   ├── api/                # API client functions
│   │   ├── lib/                # Flashcard logic & cloud sync
│   │   └── data/               # Pinyin reference data
│   ├── public/audio/           # Pinyin audio samples (initials, finals, whole syllables)
│   └── vite.config.ts          # Vite config with API proxy
└── doc/                        # Version history (v0.0.1 – v0.0.12)
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** (for PostgreSQL)

### Setup

1. **Start the database**

   ```bash
   cd backend
   docker compose up -d
   ```

2. **Configure environment variables**

   ```bash
   cp backend/.env.example backend/.env
   # Fill in your Azure Translator / Speech keys and AUTH_SECRET
   ```

3. **Install dependencies & run migrations**

   ```bash
   cd backend
   npm install
   npm run db:migrate

   cd ../frontend
   npm install
   ```

4. **Start development servers**

   ```bash
   # Terminal 1 — Backend (port 3001)
   cd backend
   npm run dev

   # Terminal 2 — Frontend (port 5173)
   cd frontend
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser.

## Database Schema

The PostgreSQL database contains 17 tables managed by Prisma:

- **Auth**: `users`, `accounts`, `sessions`, `verification_tokens`
- **Student Profile**: `student_core` (language preferences, HSK level, learning goals), `student_rolling_summary`, `student_recent_lessons`
- **Vocabulary**: `vocab_log` (encounter history), `user_decks`, `user_flashcards` (Leitner SRS)
- **HSK**: `hsk_words` (pre-loaded HSK 1–9 word lists)
- **AI Classmates**: `classmates`, `lesson_archive` (planned conversation practice)
- **Billing**: `user_balance`, `balance_transactions` (prepaid credit system)
- **Shared**: `word_stats` (global search frequency), `i18n_cache` (UI translation cache)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Email registration |
| POST | `/auth/signin` | Email login |
| POST | `/auth/signout` | Logout (clear cookie) |
| GET | `/auth/session` | Get current session |
| GET | `/api/search` | Dictionary search (segmentation + translation) |
| GET | `/api/tts` | Text-to-speech audio |
| GET | `/api/stats/hot` | Trending search terms |
| GET | `/api/stats/hsk` | HSK word list by level |
| GET/PATCH | `/api/student/core` | Student profile |
| POST | `/api/student/onboard` | Onboarding completion |
| GET/POST/DELETE | `/api/decks/*` | Flashcard deck CRUD + cloud sync |

## License

ISC
