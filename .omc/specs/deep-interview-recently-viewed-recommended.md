# Deep Interview Spec: Recently-Viewed + Recommended (shop/[slug])

## Metadata
- Interview ID: di-recently-viewed-001
- Rounds: 4 (Round 0 topology + 4 Q&A)
- Final Ambiguity Score: 8%
- Type: brownfield
- Threshold: 0.20 (source: default)
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Goal | 0.95 | 0.35 | 0.333 |
| Constraints | 0.92 | 0.25 | 0.230 |
| Criteria | 0.88 | 0.25 | 0.220 |
| Context | 0.90 | 0.15 | 0.135 |
| **Ambiguity** | | | **8%** |

## Topology
| Component | Status | Description | Coverage |
|---|---|---|---|
| Recently-Viewed tracking | active | Track product visits in localStorage, expose via hook | max 20 entries, TTL 30d, newest-first, exclude current |
| Recommendation logic | active | Fetch same-`vehicle_family` products, top-up with newest of other families | 4 slots desktop/tablet, 3 mobile, exclude current |
| Storefront UI | active | Two sections at bottom of shop/[slug]: "Sản Phẩm Đã Xem" + "Sản Phẩm Đề Xuất" | Reuse existing store card styling |

## Goal
Trên trang chi tiết sản phẩm (`shop/[slug]`) thêm 2 section giúp người mua khám phá tiếp:
1. **Sản Phẩm Đã Xem** — hiển thị sản phẩm khách đã ghé thăm trước đó (client-side lịch sử).
2. **Sản Phẩm Đề Xuất** — ưu tiên cùng dòng xe với sản phẩm đang xem (`vehicle_family`), thiếu thì bổ sung sản phẩm mới nhất của dòng xe khác.

## Constraints
- Thêm column mới `vehicle_family` (text nullable) trên `products` để đánh dấu dòng xe (SH, Air Blade, Vario, Winner, Lead, Vision, Future, Future, khác).
- Admin phải nhập `vehicle_family` khi tạo/sửa sản phẩm (dropdown/select).
- Recently-viewed lưu localStorage duy nhất, key `dev-recently-viewed-v1`, max 20 entries, TTL 30 ngày, không sync cross-device.
- Cả 2 section: 4 slot ở desktop/tablet, 3 slot ở mobile (grid responsive).
- Cả 2 section luôn loại trừ sản phẩm đang xem.
- Recommendation query công khai (không cần auth) — reuse existing `/api/products/list` hoặc endpoint mới.
- Không thay đổi schema `products` ngoài việc thêm 1 column.

## Non-Goals
- Cross-device sync recently-viewed (không lưu DB).
- Cookie-based storage.
- Admin curation / manual pin.
- ML-based collaborative filtering.
- Recently-viewed cho user chưa đăng nhập vs đã đăng nhập khác nhau (dùng chung localStorage).
- Analytics/tracking on section interaction.

## Acceptance Criteria
- [ ] Migration: `ALTER TABLE products ADD COLUMN vehicle_family text`.
- [ ] Drizzle schema mirror `vehicle_family: text("vehicle_family")`.
- [ ] `ProductForm` admin có dropdown "Loại xe" (SH / Air Blade / Vario / Winner / Lead / Vision / Future / Khác) bind vào `vehicle_family`.
- [ ] 3 sản phẩm seed hiện tại được set `vehicle_family` đúng qua migration (`sh-2026 → sh`, `air-blade-2026 → air-blade`, `vario-2026 → vario`).
- [ ] Hook `useRecentlyViewed()` (client): trả về array items từ localStorage, có method `track(product)` để append/upsert (move-to-front, giữ max 20), tự expire entry > 30d ở lần read tiếp theo.
- [ ] `shop/[slug]` gọi `track()` với payload `{slug, name, imageKey, vehicleFamily}` khi product data load xong.
- [ ] Endpoint `GET /api/products/recommended?family=sh&exclude=sh-2026&limit=4`: trả `[Product]` gồm same-family first, top-up newest other-family khi thiếu, exclude slug.
- [ ] `RecommendedSection` component fetch endpoint và render 4/3 responsive grid.
- [ ] `RecentlyViewedSection` component đọc từ hook, exclude current slug, render 4/3 responsive grid (max 4 items shown, những item còn lại chỉ nằm trong localStorage).
- [ ] Cả 2 section không render nếu list rỗng (recently-viewed lần đầu vào, hoặc recommendation không tìm ra product nào khác).
- [ ] TypeScript sạch, `npm run build` pass.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|---|---|---|
| Family suy ra từ tags/name | Round 1: tags generic, name có nhưng parse rủi ro | New column `vehicle_family` |
| Recently-viewed cần DB | Round 2: chỉ 1 admin, user đa số guest | localStorage đủ |
| Cần fallback random | Round 3 | Fallback = newest other-family, predictable |
| Recently-viewed cần config riêng | Round 4 (Contrarian) | Dùng chung 4/3 slot layout với recommendation |

## Technical Context
- **Product data model:** `src/lib/supabase/schema.ts` products table đã có `name`, `slug`, `tags`, `collectionId`, `featuredImageId`. Thêm `vehicle_family text` nullable.
- **Public products API:** `/api/products/list` (Supabase JS, HTTPS) trả về Product cho storefront. Cần endpoint mới `/api/products/recommended` (same pattern, Supabase JS).
- **Shop detail:** `src/app/(store)/shop/[slug]/page.tsx` là client component fetch `/api/products/${slug}`. API cần trả thêm `vehicleFamily` trong response.
- **ProductForm admin:** `src/features/products/components/admin/ProductForm.tsx` — thêm SelectField `vehicle_family` sau section "Phân Loại".
- **Existing ProductCard on shop list:** `src/app/(store)/shop/page.tsx` có helper `resolveImageSrc` + `formatVND` + card layout. Copy pattern cho recommended/recently-viewed card (thu nhỏ).

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|---|---|---|---|
| Product | core (existing) | id, name, slug, badge, price, imageKey, vehicleFamily (new) | — |
| VehicleFamily | supporting enum-like | value ∈ {sh, air-blade, vario, winner, lead, vision, future, other} | Product.vehicle_family references this |
| RecentlyViewedEntry | client-only | slug, name, imageKey, vehicleFamily, viewedAt(number) | localStorage list |

## Interview Transcript
<details>
<summary>Full Q&A (Round 0 + 4 rounds)</summary>

### Round 0 — Topology
**Q:** 3 top-level components (Recently-Viewed tracking / Recommendation logic / UI) đúng chưa?
**A:** Đúng — proceed all 3.

### Round 1 — Recommendation Goal
**Q:** "Cùng loại xe" derived từ đâu?
**A:** Thêm column mới `vehicle_family`.
**Ambiguity:** 41%.

### Round 2 — Recently-Viewed Constraints
**Q:** Storage?
**A:** localStorage.
**Ambiguity:** 28%.

### Round 3 — Recommendation Constraints (slot+fallback)
**Q:** Slot count & fallback strategy?
**A:** 4 slots desktop/tablet, 3 mobile (fallback = newest other-family, implicit).
**Ambiguity:** 20%.

### Round 4 — Contrarian (Recently-Viewed sizing/TTL)
**Q:** Reuse 4/3 slots, max 20, exclude current, sort newest first?
**A:** OK + TTL 30 ngày.
**Ambiguity:** 8% → PASSED.
</details>
