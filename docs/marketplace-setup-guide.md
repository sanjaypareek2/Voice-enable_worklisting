# Marketplace Setup Guide (Step-by-Step)

This guide walks you from an empty repo to a working skeleton of the marketplace
(frontend + backend + database), using the preferred stack:
Next.js + Tailwind, NestJS + Prisma, PostgreSQL + PostGIS, Meilisearch.

## 0) Prerequisites
- Node.js 18+
- Docker + Docker Compose
- Git

## 1) Create the monorepo structure
```bash
mkdir -p apps/web apps/api packages/ui packages/types docs
```

## 2) Initialize the workspace
```bash
npm init -y
npm install -D turbo concurrently
```

Add workspaces to `package.json`:
```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

## 3) Create the Next.js frontend
```bash
cd apps/web
npx create-next-app@latest . --ts --eslint --tailwind --app --src-dir
```

## 4) Create the NestJS backend
```bash
cd ../api
npm i -g @nestjs/cli
nest new . --package-manager npm
```

## 5) Install Prisma + PostgreSQL client
```bash
cd ../../apps/api
npm install prisma @prisma/client
npx prisma init
```

Replace `prisma/schema.prisma` with the contents of `docs/marketplace-schema.prisma`.

## 6) Add Docker services (Postgres + PostGIS + Meilisearch)
Create `docker-compose.yml` at the repo root:
```yaml
version: "3.9"
services:
  db:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: marketplace
      POSTGRES_PASSWORD: marketplace
      POSTGRES_DB: marketplace
    ports:
      - "5432:5432"
  meilisearch:
    image: getmeili/meilisearch:v1.7
    environment:
      MEILI_MASTER_KEY: masterKey
    ports:
      - "7700:7700"
```

## 7) Configure environment variables
Create `.env` in `apps/api`:
```bash
DATABASE_URL="postgresql://marketplace:marketplace@localhost:5432/marketplace?schema=public"
```

## 8) Apply the database schema
```bash
cd apps/api
npx prisma migrate dev --name init
```

## 9) Wire the API modules (NestJS)
Recommended modules:
- AuthModule
- ListingsModule
- LeadsModule
- AdminModule
- SearchModule (Meilisearch)

Use `docs/marketplace-openapi.yaml` to implement endpoints.

## 10) UI foundation
Recommended feature areas:
- Home, Search Results, Listing Details
- Post Listing flow (multi-step)
- Dashboard (Listings + Leads)

Use `docs/marketplace-ui-components.md` as the UI blueprint.

## 11) Run the stack
```bash
docker compose up -d
cd apps/api && npm run start:dev
cd ../web && npm run dev
```

## 11a) Run the UI only (frontend)
```bash
cd apps/web
npm run dev
```

Open http://localhost:3000 in your browser.

## 11b) Test the UI
Recommended checks for a Next.js + Tailwind app:
```bash
cd apps/web
npm run lint
npm run test
```

If you do not have tests set up yet, start with linting and add:
- Playwright or Cypress for end-to-end tests.
- React Testing Library + Jest/Vitest for component tests.

## 12) Next steps
- Add Mapbox integration for the map view.
- Add S3-compatible uploads for listing media.
- Add Meilisearch indexing for search.
