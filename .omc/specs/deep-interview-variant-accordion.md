# Deep Interview Spec: Variant List — Accordion Collapse

## Metadata
- Interview ID: di-variant-accordion-001
- Rounds: 2 (Round 0 topology + 2 Q&A)
- Final Ambiguity Score: 14%
- Type: brownfield
- Threshold: 0.20 (source: default)
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Goal | 0.92 | 0.35 | 0.322 |
| Constraints | 0.85 | 0.25 | 0.213 |
| Criteria | 0.78 | 0.25 | 0.195 |
| Context | 0.90 | 0.15 | 0.135 |
| **Ambiguity** | | | **14%** |

## Topology
| Component | Status | Description | Coverage |
|---|---|---|---|
| Variant list density | active | Wrap each variant group in a collapsible accordion so 15–20 options don't render as one long wall | header + collapse state + selected badge |

## Goal
Bọc mỗi variant group vào 1 accordion collapse trên `shop/[slug]`. Group đầu tiên mở sẵn, các group còn lại đóng; click header để mở/đóng (nhiều group mở cùng lúc được — không mutex). Header khi đóng hiển thị đủ ngữ cảnh để khách quyết định có mở hay không, mà không phải render toàn bộ dense-row list.

## Constraints
- Accordion state: `Record<groupId, boolean>` (open?), init = group đầu tiên (index 0) mở, còn lại đóng.
- Non-mutex: mở group này không đóng group khác.
- Header (mọi trạng thái) hiển thị: **tên group** (giữ typography lớn hiện tại — `text-sm font-black uppercase`) + **"N gói"** (số option) + **khoảng giá** min–max (`formatVND(min) – formatVND(max)`) + chevron xoay.
- Khi group ĐÓNG mà có ≥1 option đã chọn trong đó → hiện badge amber "N đã chọn" ở header để khách không quên.
- Body (khi mở) = dense-row list hiện tại y nguyên (checkbox/stepper, name, price, stepper-next-to-price) — KHÔNG đổi row layout, chỉ bọc collapse.
- Giữ nguyên: total price Σ(price×qty), CTA, price summary, select/quantity mode.
- Group description (nếu có) hiện bên trong body khi mở, không nhồi vào header.
- Mượt: chevron rotate + body expand; dùng CSS/conditional render đơn giản, không cần thư viện animation.
- **Global toggle** ở đầu danh sách variant: 1 nút chuyển giữa "Mở tất cả" ↔ "Thu gọn tất cả" — set tất cả `open[groupId]` = true/false cùng lúc. Label đổi theo trạng thái: nếu còn ≥1 group đóng → "Mở tất cả"; nếu tất cả đang mở → "Thu gọn tất cả".

## Non-Goals
- Search/filter trong options (đã cân nhắc, defer).
- Sub-group / phân nhóm nhỏ trong 1 group.
- Max-height scroll, 2-column, show-more (các phương án khác đã loại ở Round 1).
- Mutex accordion (chỉ 1 group mở tại 1 thời điểm) — cho phép nhiều mở.
- Persist trạng thái mở/đóng cross-session.

## Acceptance Criteria
- [ ] `VariantSelector` thêm state `open: Record<groupId, boolean>`, init group[0] = true.
- [ ] Mỗi group render 1 header button: tên + "N gói" + khoảng giá min–max + chevron (rotate khi mở).
- [ ] Click header toggle open/close group đó, không ảnh hưởng group khác.
- [ ] Group đóng + có option đã chọn (qty>0) → badge amber "N đã chọn" ở header.
- [ ] Group mở → render dense-row body hiện tại KHÔNG đổi (checkbox/stepper, name, price + stepper cụm phải, spacer align).
- [ ] Group mở → nếu có `group.description`, hiện ở đầu body.
- [ ] Khoảng giá header = min & max của `option.price` trong group; nếu chỉ 1 mức giá → hiện 1 giá.
- [ ] Nút global "Mở tất cả / Thu gọn tất cả" ở đầu list: click set toàn bộ group open=true / open=false; label đổi theo trạng thái (còn group đóng → "Mở tất cả", tất cả mở → "Thu gọn tất cả").
- [ ] Total price, price summary, CTA giữ nguyên hành vi.
- [ ] `npm run build` pass, tsc clean.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|---|---|---|
| Cần scroll/show-more/2-col | Round 1: 4 phương án + preview | Accordion collapse |
| Tất cả đóng hoặc tất cả mở | Round 2 | Group đầu mở, còn lại đóng, non-mutex |
| Header chỉ tên group | derived | Tên + số gói + khoảng giá + badge đã chọn |

## Technical Context
- File: `src/app/(store)/shop/[slug]/page.tsx`, `VariantSelector` component.
- Hiện: `groups.map` render mỗi group = title block + `divide-y` dense rows. Cần bọc rows vào conditional `{open[g.id] && (...)}` và biến title block thành clickable header.
- State qty: `Record<optionId, number>` (giữ nguyên). Thêm `open` state riêng.
- `formatVND` đã có sẵn trong component.
- Selected-count per group = số option trong group có `qtys[opt.id] > 0`.

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|---|---|---|---|
| VariantGroup | core (existing) | id, name, description, options[] | has many VariantOption |
| AccordionState | client-only | Record<groupId, boolean> | 1 per VariantSelector |
| GroupHeaderMeta | derived | optionCount, minPrice, maxPrice, selectedCount | computed from group + qtys |

## Interview Transcript
<details>
<summary>Q&A (Round 0 + 2 rounds)</summary>

### Round 0 — Topology
**Q:** 1 component (variant list density)?
**A:** Chưa chắc — đề xuất giúp.

### Round 1 — Criteria (cơ chế)
**Q:** Show-more / scroll khung / accordion / 2-cột?
**A:** Accordion — group thu gọn sẵn, click mở.
**Ambiguity:** 27%.

### Round 2 — Constraints (default state)
**Q:** Mặc định mở/đóng thế nào?
**A:** Group đầu tiên mở, còn lại đóng (non-mutex).
**Ambiguity:** 14% → PASSED.
</details>
