# CMS Rebuild — Progress

## Loop 1 — Discovery + audit + docs
- Task: Discovery, audit, persistent docs.
- Files changed: docs/cms-rebuild/* (created).
- Result: P0 findings recorded (RBAC, cover IDOR).

## Loop 2 — P0 fixes
- Task: RBAC enforcement + cover-image IDOR.
- Files changed: src/lib/auth.ts, products/actions.ts, settings/actions.ts, orders/actions.ts, categories/actions.ts, content/actions.ts.
- Result: `requireRole()` added; EDITOR limited to catalog/content/orders; settings/users/security are ADMIN-only. Cover IDOR fixed with ownership check.
- Verification: tsc PASS, lint PASS.

## Loop 3 — Audit log + admin user management
- Task: AuditLog model, recordAudit service, wire key mutations; admin user CRUD.
- Files changed: prisma/schema.prisma + migration, src/lib/audit.ts, src/app/admin/(panel)/users/*, src/components/admin/admin-users-form.tsx, admin-nav.tsx, layout.tsx.
- Result: AuditLog records create/update/delete/status/enable/disable. Admin users list/create/disable/role. Nav gated by role.
- Verification: tsc PASS, lint PASS.

## Loop 4 — Delete confirmations + product list pagination
- Task: Inline delete confirmations; product list pagination + category filter.
- Files changed: confirm-delete-button.tsx (new), categories/page.tsx, products/[id]/page.tsx, content/pages/page.tsx, content/footer/page.tsx, settings/bank/page.tsx, products/page.tsx.
- Result: Dangerous deletes require explicit confirmation. Product list paginated (20/page) + category filter.
- Verification: tsc PASS, lint PASS, next build PASS.

## Loop 5 — Storefront text CMS (B option)
- Task: StorefrontText model + admin editor + wire navbar/footer/home/cart/checkout/orderSuccess texts.
- Files changed: prisma/schema.prisma + migration 004, src/lib/storefront-text.ts, settings/actions.ts + texts page, storefront components.
- Result: 49 CMS-editable texts; seed writes defaults without overwriting admin edits.
- Verification: tsc PASS, lint PASS, next build PASS.

## Loop 6 — P2: SEO fields + category search
- Task: SEO title/description on Product/Category/CmsPage + site SEO defaults; category list search + status filter.
- Files changed: prisma/schema.prisma + migration 005, product/category/cms-page actions + forms, storefront metadata (product/category/page/layout), category list page.
- Result: SEO metadata editable with fallback; category list searchable + filterable.
- Verification: tsc PASS, lint PASS, next build PASS.

## Loop 7 — P3: transitions, tests, media library, preview
- Task: Centralize order status transitions; add node:test test suite; MediaAsset model + safe delete; homepage preview link.
- Files changed: src/lib/order-transitions.ts + test, slugify (big-letter accent fix) + test, format test, storage.ts (MediaAsset + ref counting), media page/actions, admin-nav, order detail/actions, homepage content page.
- Result: status transitions enforced server-side + UI; 14 unit tests pass; media library with reference-aware safe delete; real-storefront preview link.
- Verification: tsc PASS, lint PASS, 14/14 tests PASS, next build PASS.
