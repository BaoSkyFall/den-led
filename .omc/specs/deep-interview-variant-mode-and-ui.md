# Deep Interview Spec: Variant Selection Mode + Compact UI

## Metadata
- Interview ID: di-variant-mode-001
- Rounds: 3 (Round 0 topology + 3 Q&A)
- Final Ambiguity Score: 10%
- Type: brownfield
- Threshold: 0.20 (source: default)
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Goal | 0.95 | 0.35 | 0.333 |
| Constraints | 0.85 | 0.25 | 0.213 |
| Criteria | 0.90 | 0.25 | 0.225 |
| Context | 0.90 | 0.15 | 0.135 |
| **Ambiguity** | | | **10%** |

## Topology
| Component | Status | Description | Coverage |
|---|---|---|---|
| Variant selection mode | active | Per-option `selection_mode` = `select \| quantity`; qty 0–10; free-mix within a group; total = Σ(price × qty) | schema + admin + storefront + pricing |
| UI redesign | active | Dense row list per group + typography swap (group title bigger, option name smaller) | shop/[slug] `VariantSelector` |

## Goal
Cho phép admin gán mỗi variant option 1 trong 2 chế độ chọn (`select` hoặc `quantity`); storefront hiển thị đúng control tương ứng và cộng vào tổng giá theo quantity thực tế. Đồng thời redesign danh sách options thành dense row list gọn gàng để xử lý 15–20 options mà vẫn dễ đọc, đồng thời swap size chữ để tên group nổi bật hơn tên option.

## Constraints
- Schema: thêm `variant_options.selection_mode text` mặc định `'select'` (backfill toàn bộ rows hiện có = `'select'`).
- Qty range: min 0, max 10, default 0 (chưa chọn). Click `+` lần đầu → qty = 1.
- Free-mix trong 1 group: các option độc lập; không mutex; select ~ qty 0/1, quantity ~ qty 0–10.
- Total = `Σ (option.price × qty)` cho tất cả optionId có qty > 0.
- UI dense row: mỗi row ~44–48px cao, checkbox (select-mode) hoặc stepper (quantity-mode) ở lề trái, name + price cùng hàng, features ẩn dưới (chỉ show khi qty > 0 hoặc hover md+).
- Typography swap: group title `text-sm font-black uppercase text-white tracking-wide` (to hơn); option name `text-xs font-medium text-white` (nhỏ hơn hiện tại `text-sm font-bold`).
- Không đổi bảng `variant_groups`; không đổi API `/api/products/[slug]` shape ngoài field `selectionMode`.

## Non-Goals
- Group-level mode override.
- Product-level default mode.
- Qty > 10 (đủ dùng, giới hạn tránh UI xấu).
- Bulk-quantity discount.
- Persist selection cross-session.
- Admin bulk-set mode cho tất cả option trong group (v2).

## Acceptance Criteria
- [ ] Migration: `ALTER TABLE variant_options ADD COLUMN selection_mode text NOT NULL DEFAULT 'select'`; existing rows backfilled to `'select'`.
- [ ] Drizzle schema mirror `selectionMode: text("selection_mode").notNull().default("select")`.
- [ ] Public API `/api/products/[slug]` returns each option with `selectionMode`.
- [ ] Admin `VariantManager` UI thêm toggle/select "Kiểu chọn" (Select / Quantity) cho mỗi option.
- [ ] Storefront selection state: `Record<optionId, number>` (qty; 0 = unselected).
- [ ] Select-mode option renders as **row với checkbox** ở trái, click toggle 0 ↔ 1.
- [ ] Quantity-mode option renders as **row với stepper `−  N  +`** ở trái, min 0, max 10; click `+` khi qty=0 set qty=1; click `−` khi qty=1 set qty=0.
- [ ] Total price = `Σ (Number(opt.price) × qty)`; hiển thị "Tổng cộng" khi có ≥ 1 option qty > 0.
- [ ] Group title font `text-sm font-black uppercase text-white tracking-wide` (bigger than option name).
- [ ] Option name font `text-xs font-medium text-white` (nhỏ hơn hiện tại).
- [ ] Features (nếu có) chỉ hiển thị inline dưới name khi option được chọn (qty > 0) hoặc hover trên md+ — không load-visible-by-default để list gọn.
- [ ] Row hover state, selected state (qty > 0) có background amber-500/10 để nhìn nhanh.
- [ ] `npm run build` pass, tsc clean.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|---|---|---|
| Mode ở group-level | Round 1: linh hoạt hơn nếu per-option | Per-option `selection_mode` |
| Mutex trong group (như radio) | Round 2 | Free-mix, options độc lập |
| Qty không giới hạn | Round 2 | Cap 10 (đủ dùng, UI đẹp) |
| Chip grid hay accordion | Round 3 | Dense row list — nhanh scan, không extra clicks |

## Technical Context
- **Schema:** `src/lib/supabase/schema.ts` — bảng `variant_options` (uuid id, groupId, name, price decimal(12,0), images, features text[], displayOrder). Thêm `selectionMode`.
- **API public:** `src/app/api/products/[slug]/route.ts` — hiện trả variantGroups[].options[] với id/name/price/features/images/displayOrder. Thêm `selectionMode`.
- **Admin manager:** `src/features/products/components/admin/VariantManager.tsx` — hiện có input name + price + delete. Thêm select dropdown "Kiểu".
- **Storefront selector:** `src/app/(store)/shop/[slug]/page.tsx` — `VariantSelector` currently multi-select với state `Record<groupId, VariantOption[]>`. Rewrite state → `Record<optionId, number>`, dispatch dense row với checkbox/stepper theo mode.

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|---|---|---|---|
| VariantOption | core (existing +field) | id, groupId, name, price, features, selectionMode (new) | belongs to VariantGroup |
| SelectionMode | enum | `select` \| `quantity` | on VariantOption |
| SelectionState | client-only | Map<optionId, number> (qty; 0 = unselected) | VariantSelector state |

## Interview Transcript
<details>
<summary>Q&A (Round 0 + 3 rounds)</summary>

### Round 0 — Topology
**Q:** 2 top-level components (Selection mode + UI redesign)?
**A:** Đúng.

### Round 1 — Selection mode / Goal
**Q:** `selectionMode` field ở group, option, hay product?
**A:** Per-OPTION.
**Ambiguity:** 41%.

### Round 2 — Selection mode / Constraints
**Q:** Mutex? Qty range? Default?
**A:** Free-mix, độc lập, qty 0–10, default 0, click `+` lần đầu → 1.
**Ambiguity:** 23%.

### Round 3 — UI redesign / Criteria
**Q:** Shape cho 15–20 options?
**A:** Dense row list (checkbox/stepper trái, name giữa, price phải).
**Ambiguity:** 10% → PASSED.
</details>
