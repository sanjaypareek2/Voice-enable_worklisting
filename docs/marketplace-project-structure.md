# Project Structure + Tasks (Preferred Stack)

## Stack
- Frontend: Next.js + Tailwind CSS + Mapbox
- Backend: NestJS + Prisma + PostgreSQL + PostGIS
- Search: Meilisearch
- Storage: S3-compatible (images/docs)

## Repo Layout (Monorepo)
```
repo/
  apps/
    web/                 # Next.js frontend
      src/
        app/
        components/
        features/
        styles/
    api/                 # NestJS backend
      src/
        modules/
        common/
        config/
      prisma/
  packages/
    ui/                  # Shared UI library
    types/               # Shared types (DTOs)
  docs/
```

## Tasks by Phase

### Phase 1: Foundation (Week 1-2)
- [ ] Monorepo scaffolding (apps/web, apps/api, packages/ui, packages/types)
- [ ] Auth + RBAC (owner/broker/tenant/admin)
- [ ] Prisma schema + migrations (core listings)
- [ ] Listing CRUD (API + UI)
- [ ] Media upload (S3) + image rendering

### Phase 2: Marketplace UX (Week 3-4)
- [ ] Search results page + filters
- [ ] Map view + clustering
- [ ] Listing detail page + inquiry form
- [ ] Post listing flow (multi-step)
- [ ] Leads inbox in dashboard

### Phase 3: Admin + Monetization (Week 5-6)
- [ ] Admin moderation queue
- [ ] Featured listing management
- [ ] Subscription packages / billing hooks
- [ ] Analytics dashboard (views, leads)

### Phase 4: Scale (Week 7-10)
- [ ] Meilisearch indexing + relevance tuning
- [ ] SEO + structured data
- [ ] Multi-language support
- [ ] Performance tuning + caching
