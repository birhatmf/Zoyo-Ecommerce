# CMS Rebuild — Backlog

## P0 (all resolved)
- [x] RBAC enforcement (EDITOR vs ADMIN).
- [x] Cover-image IDOR.

## P1 (all resolved)
- [x] Admin user management.
- [x] Audit log.
- [x] Delete confirmations.

## P2 (all resolved)
- [x] SEO fields (meta title/description/OG) for product/category/page + site defaults.
- [x] Category search/filter (name/slug + active/inactive).

## P3
- [x] Media library centralization (MediaAsset + safe delete + reference counting).
- [x] Order status transition rules (centralized + enforced + UI reflects).
- [x] Automated test foundation (node:test + tsx).
- [x] Homepage preview link (real storefront rendering path).

## Remaining (future / non-blocking)
- [ ] Full drag-and-drop homepage section reordering (accepted deferral — see DECISIONS.md).
- [ ] Playwright E2E flows (foundation uses node:test; E2E can be added later).
