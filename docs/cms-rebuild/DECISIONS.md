# CMS Rebuild — Decisions

## Decision: Keep existing section-based homepage CMS
Reason: Preserves design consistency; PRD explicitly favors structured content over arbitrary builders.
Consequences: No drag-and-drop page builder. Hero remains two models (HomepageContent fallback + HeroSlide) — acceptable but noted for P3 consolidation.

## Decision: Enforce RBAC at action boundary, not UI
Reason: UI hiding is not security. Every mutation calls `requireRole()`.
Consequences: Each action gains an explicit minimum-role guard.

## Decision: Add AuditLog as a separate Prisma model
Reason: Accountability + debugging; avoid sensitive data.
Consequences: `recordAudit()` helper; mutations call it after success.

## Decision: Defer drag-and-drop homepage section reordering
Reason: Current section-based CMS already controls content; full reordering needs a schema migration
to a flexible section model + a risky storefront refactor. Preview uses the real storefront path.
Consequences: Homepage "Sitede görüntüle" link added. Reordering remains a future item.

## Decision: Use node:test + tsx instead of adding Vitest
Reason: Project already ships tsx; node:test covers pure-logic units (transitions, slugify, format)
without adding a test-runner dependency. E2E can use Playwright later.
Consequences: `npm test` runs `tsx --test`. No Vitest config/maintenance burden.
