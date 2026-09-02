# CMS Rebuild — Target Architecture

## Principles
- Keep existing Next.js 16 App Router + Prisma + server actions structure.
- Admin = Server Components by default, client components only for interactivity.
- Centralized authorization + audit at the action boundary.
- Storefront remains source of truth for rendering (no separate admin renderer).

## Layers
```
Admin UI (page.tsx / client forms)
    ↓
Server Action / Route Handler (authorization + audit + validation entry)
    ↓
Zod validation (shared domain schemas in src/validations)
    ↓
Domain service (src/services) where logic is non-trivial
    ↓
Prisma (src/lib/prisma)
```

## Module boundaries
- `src/lib/auth.ts` — session + `requireAdmin()` / `requireRole()`.
- `src/lib/audit.ts` — `recordAudit()` service, called from actions.
- `src/services/*` — catalog/content/order domain services.
- `src/validations/*` — shared Zod schemas (single source of truth).

## Authorization
- Roles: ADMIN (full), EDITOR (catalog + content + limited orders, no user/settings/security management).
- Enforced server-side in every mutation, never UI-only.

## Audit
- `AuditLog` model: actor, action, entityType, entityId, summary, metadata(Json?), createdAt.
- No secrets/passwords/tokens logged.

## Revalidation
- Domain helpers where duplicated: `revalidateCatalog()`, `revalidateChrome()`, `revalidateCmsPage()`, `revalidateHomepage()`.
