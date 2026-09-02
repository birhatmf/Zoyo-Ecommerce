# CMS Rebuild — Acceptance Checklist

- [x] RBAC: EDITOR cannot perform ADMIN-only mutations (server-side). PASS
- [x] Cover image ownership: cross-product imageId rejected. PASS
- [x] Admin users manageable (list/create/disable/role). PASS
- [x] Audit log records key mutations. PASS
- [x] Dangerous deletes require confirmation. PASS
- [x] Product list paginated + category filter. PASS
- [x] SEO fields (product/category/page + site defaults). PASS
- [x] Category list search + status filter. PASS
- [x] Order status transition rules enforced. PASS
- [x] Media library + safe delete + reference counting. PASS
- [x] Unit tests (14 passing). PASS
- [x] TypeScript passes. PASS
- [x] Lint passes (2 pre-existing seed warnings only). PASS
- [x] Production build passes. PASS

## Deferred (non-blocking, documented)
- Full drag-and-drop homepage section reordering
- Playwright E2E flows
