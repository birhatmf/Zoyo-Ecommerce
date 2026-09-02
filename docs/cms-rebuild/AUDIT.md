# CMS Rebuild — Audit

Status: Discovery complete (2026-09-02). This reflects the CURRENT system at commit 96f7849 + prior security fixes.

## Inventory

| Feature | DB model | Backend | Admin UI | Storefront consumer | Problems |
|---|---|---|---|---|---|
| Products | Product, ProductImage | actions.ts (server actions) | list + editor + media | catalog.service.ts | No pagination, no category filter, no bulk ops, delete w/o confirm |
| Categories | Category | actions.ts | list + editor | catalog.service.ts | No search/filter, delete w/o confirm, no SEO fields |
| Orders | Order, OrderItem, OrderNote, OrderSequence | actions.ts + /api/orders | list + detail | n/a (admin only) | No status transition rules, no order history log |
| Homepage | HomepageContent, HeroSlide | content/actions.ts | structured form + slides | page.tsx, hero-slider | Two competing hero models (HomepageContent + HeroSlide), no section reordering, no preview |
| Navigation | HeaderLink | content/actions.ts | navbar manager | header.tsx | Free-text URL only, no structured destination |
| Footer | FooterLinkGroup, FooterLink | content/actions.ts | footer manager | footer.tsx | Contact info duplicated (settings + footer), no visibility toggle |
| CMS Pages | CmsPage | content/actions.ts | list + editor | cms-page-view | Sanitized OK, but no SEO fields, no preview |
| Settings | SiteSetting (kv) | settings/actions.ts | company/contact forms | settings.ts | One arbitrary kv table, no domain grouping, no SEO defaults |
| Bank accounts | BankAccount | settings/actions.ts | bank manager | siparis/basarili | OK |
| Admin users | AdminUser | login only | none | n/a | **No user management UI** |
| RBAC | AdminRole (ADMIN/EDITOR) | not enforced | not differentiated | n/a | **EDITOR role has full access** |
| Audit log | none | none | none | n/a | **Missing** |

## Security / data-integrity risks

- RBAC stored but not enforced (P0).
- Destructive deletes (product/category/page/footer group/bank) have no confirmation (P1 UX/safety).
- Product list loads unbounded products (P2 perf).
- `updateImageMetaAction` validates `imageId` + `productId` pairing via `updateMany where {id, productId}` — OK, no IDOR there.
- `setCoverImageAction` uses `imageActionSchema` (productId + imageId) but does NOT verify the image belongs to that product in the update itself; it sets `isCover` on `imageId` directly. **Cross-product cover IDOR confirmed** (P0).
- `deleteImageAction` DOES verify `image.productId === parsed.data.productId` before delete — OK.
- Physical media deletion is absent (orphan files possible) but local-disk provider; not blocking for V1.

## Hardcoded storefront content

- Default nav links in `header.tsx` (fallback only, acceptable).
- Default hero/story text in `page.tsx` (fallback when CMS empty, acceptable).
- No other meaningful hardcoded content found; bank/contact/logo all CMS-driven.
