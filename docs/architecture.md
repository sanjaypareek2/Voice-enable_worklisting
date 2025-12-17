# Architecture Overview

This project is a two-package workspace (`server` and `web`) managed from the repository root. The intent is to keep the stack type-safe end to end while remaining simple to deploy locally or in Docker.

## Data Flow
- The **Express** API exposes CRUD endpoints under `/api`. Validation uses **zod** and persistence uses **Prisma** with a SQLite database by default.
- Task status is derived by `computeStatus` (shared concept on both client and server). Every read and write recomputes against "now" so refreshing the app updates delayed/on-track counts.
- A small audit log is written when tasks are created, edited, extended, completed, or reopened.
- CSV import/export uses streaming parsers (`csv-parse`/`csv-stringify`).

## Frontend
- **Vite + React + TypeScript** with **TailwindCSS** for styling. **React Query** handles API caching, **Recharts** handles charts, and **lucide-react** icons style the UI.
- `useSpeechCapture` wraps the Web Speech API and falls back to manual entry when unsupported. Parsed text pre-fills the quick capture form.
- An offline queue in `lib/api.ts` stores mutations in `localStorage` when offline and flushes them when the browser comes back online.
- A service worker (`public/sw.js`) precaches the shell for offline read access. Status recomputation runs hourly in `App.tsx`.

## Background Refresh
- On app load and every hour, the client invalidates task queries; the server recomputes and persists derived status on read. Due dates are calculated on the server from `startAt + estimatedDays` to keep a single source of truth.

## Timezone Handling
- The server stores UTC timestamps. Clients send `startAt` (defaulting to their local now). Comparisons always use the user's current local time in the browser to derive status and aging counters.

## Offline Sync
- Mutating API calls (create/update/complete/extend) enqueue requests when `navigator.onLine` is false. The queue flushes automatically on the `online` event and during the hourly refresh tick. A badge in the header signals that offline sync is ready.

## Extensibility
- The data model already includes `assigneeId` and `AuditLog` for multi-user expansion.
- Docker Compose runs API and web independently. Swapping SQLite for Postgres only requires adjusting `DATABASE_URL` in `server/.env` and running Prisma migrations.
