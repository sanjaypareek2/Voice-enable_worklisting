# Voice Task Manager

Voice-enabled to-do and productivity dashboard with Express + React + Prisma. Quick-capture tasks with speech, track status in realtime, and work offline with queued sync.

## Prerequisites
- Node.js 18+
- npm 9+

## Installation
```bash
npm install
```
If Prisma engine downloads are blocked in your environment, export `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` before running generate commands.

## Database
SQLite is used by default. Set `DATABASE_URL` in `server/.env` to point to Postgres if desired.

Generate the Prisma client (requires network to download engines on first run):
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate --schema server/prisma/schema.prisma
```

Seed sample data (25 tasks across categories):
```bash
npm run prisma --prefix server db push
npm run seed --prefix server
```

## Development
Run API and web together:
```bash
npm run dev
```
- API: http://localhost:4000
- Web: http://localhost:5173

Build for production:
```bash
npm run build
```
Start the API only (after building server):
```bash
npm run start
```

## Docker
A simple compose stack is provided:
```bash
docker compose up --build
```
- `server` service runs the Express API
- `web` service serves the built React app via `vite preview`

## Key Features
- Voice quick-capture modal with Web Speech API fallback to manual entry.
- Automatic start date (local now) and due date computation from estimated days.
- Status recomputation on every read and hourly in the UI (On Track, Delayed, Completed On Time/Late).
- Dashboard KPIs, category chart, throughput bar chart, SLA tile.
- Task table with complete/extend actions and audit logs on deadline changes.
- CSV import/export endpoints.
- Offline caching + queued writes with service worker precache.

## Testing
Planned scripts (add as needed):
- Unit tests for status computation
- API tests for create/update/extend/complete flows
- Playwright e2e for voice capture + completion
