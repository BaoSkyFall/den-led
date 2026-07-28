# Deep Interview Spec: Den-Led — Variants, Product Detail Page, Font & Storage

## Metadata
- Interview ID: di-2026-07-28-den-led
- Rounds: 7
- Final Ambiguity Score: 18.1%
- Type: brownfield
- Generated: 2026-07-28
- Threshold: 0.20
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

---

## Clarity Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.87 | 0.35 | 0.305 |
| Constraint Clarity | 0.81 | 0.25 | 0.203 |
| Success Criteria | 0.81 | 0.25 | 0.203 |
| Context Clarity | 0.72 | 0.15 | 0.108 |
| **Total Clarity** | | | **0.819** |
| **Ambiguity** | | | **18.1%** |

---

## Topology

| Component | Status | Description | Coverage |
|-----------|--------|-------------|---------|
| Font Migration | active | Thay Helvetica Neue + Inter → Montserrat Vietnamese trên toàn site | Confirmed: Google Fonts Montserrat, root layout + page.tsx |
| Product Detail Page | active | Trang /shop/[slug] United Motors style, 2-column layout, variant selection | Confirmed: gallery left, info right, scroll description below |
| Variants System | active | 2 table mới (variant_groups, variant_options) + admin CRUD + frontend display | Confirmed: 2 independent groups, pick 1 option each, show total |
| Supabase Storage | active | Thay toàn bộ S3 bằng Supabase Storage, bắt đầu từ sạch | Confirmed: full replace, no migration needed |
| 3 Draft Pages | active | 3 real product pages: SH2020, Vario2026, AB2026 — seed từ catalog | Confirmed: real pages with catalog data + catalog images |

---

## Goal

Nâng cấp den-led thành một **showcase website** bán dịch vụ độ đèn xe máy với:
1. Font Montserrat Vietnamese trên toàn bộ site (thay Inter/Helvetica Neue)
2. Trang chi tiết sản phẩm `/shop/[slug]` theo United Motors dark design — 2 cột (gallery trái, info phải), description + ảnh chi tiết bên dưới
3. Hệ thống variants: mỗi sản phẩm có nhiều VariantGroup (gói dịch vụ), mỗi group có các VariantOption (mức giá/linh kiện). Khách chọn 1 option từ mỗi group → hiển thị tổng giá. Không có cart/payment — CTA là liên hệ/đặt lịch (Zalo/SĐT)
4. Admin CRUD đầy đủ cho variants
5. Supabase Storage thay thế hoàn toàn S3
6. 3 trang draft thật: SH2020 (`/shop/sh-2020`), Vario2026 (`/shop/vario-2026`), AB2026 (`/shop/ab-2026`) với data từ catalog

---

## Constraints

- **Font**: Dùng `next/font/google` với `Montserrat` + subset `latin,vietnamese`. Xóa `Inter`. Apply qua CSS variable trên `<html>` tag.
- **Product Detail Layout**: 2-column grid trên desktop (60/40 hoặc 50/50), full-width scroll trên mobile. United Motors dark theme (#111111 bg, amber-500 accent, square corners, uppercase headings).
- **Variants Schema**: 2 table mới `variant_groups` và `variant_options` — KHÔNG uncomment schema cũ (productSkus/options/optionValues/skuValues). Schema cũ có thể bị xóa hoặc giữ nguyên comment.
- **Variant Selection Logic**: Khách chọn 1 option trong mỗi group. Giá thấp nhất từ tất cả options trong group đầu tiên = giá hiển thị trên card listing. Tổng giá = sum của các options đã chọn.
- **CTA khi chọn xong**: Nút "Đặt Lịch" → mở Zalo hoặc gọi điện (không phải cart/Stripe). Giá tổng hiển thị trước CTA.
- **Supabase Storage**: Xóa S3Client, xóa PutObjectCommand logic. Upload ảnh trong admin dùng Supabase JS SDK (`supabase.storage.from('products').upload(...)`). Public bucket. URL = Supabase CDN URL. `medias.key` đổi thành lưu Supabase path.
- **3 Draft Pages**: Dùng ảnh từ `public/assets/den-led/` đã có + ảnh catalog từ `public/catalog.pdf/*.jpg`. Data variants seed vào Supabase (migration).
- **Không thay đổi**: Cart, Orders, Wishlist, Comments, Profiles, Stripe flow — không đụng vào.
- **Backward compat**: Sản phẩm không có variants vẫn hiển thị được (hiển thị giá từ `products.price` thay vì min variant price).

---

## Non-Goals

- Không migrate ảnh S3 cũ sang Supabase Storage
- Không thêm cart/checkout với variant selection
- Không thay đổi admin layout/navigation
- Không build Figma/mockup file — code trực tiếp
- Không thêm tính năng comments, wishlist, recommendations vào product detail page mới (giữ scope nhỏ)
- Không xử lý discount/coupon trên variants

---

## Acceptance Criteria

- [ ] Font Montserrat load đúng trên tất cả browsers, Vietnamese diacritics (ạ, ổ, ự, ề...) render sắc nét
- [ ] `/shop/sh-2020` trả về 200, hiển thị layout 2-column với gallery + info, không lỗi runtime
- [ ] `/shop/vario-2026` và `/shop/ab-2026` tương tự
- [ ] Trên product listing card, giá hiển thị là giá thấp nhất trong tất cả variant_options của sản phẩm (không phải `products.price`)
- [ ] Trang product detail hiển thị đúng các VariantGroup với radio/select để chọn VariantOption
- [ ] Khi thay đổi selection, tổng giá cập nhật real-time (client-side, không reload)
- [ ] Admin `/admin/products/[id]` có section quản lý variants: thêm/sửa/xóa VariantGroup và VariantOption
- [ ] Admin upload ảnh sản phẩm dùng Supabase Storage (không còn S3 code path)
- [ ] `npm run build` pass không có lỗi S3
- [ ] S3 imports không còn trong codebase (không import `@aws-sdk/client-s3` nữa nếu không dùng)
- [ ] Nút "Đặt Lịch" trên product detail page hoạt động (link Zalo hoặc tel:)
- [ ] RLS trên `variant_groups` và `variant_options`: public read, admin write

---

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Variant = SKU phức tạp kiểu Shopify | Shopify model quá phức tạp cho use case này | Dùng 2 table đơn giản: variant_groups + variant_options |
| E-commerce flow với cart | Website này bán dịch vụ không qua online payment | Chỉ showcase + liên hệ, không có cart flow |
| Cần migrate ảnh S3 cũ | Ảnh cũ có thể giữ nguyên | Full replace S3, bắt đầu sạch — ảnh cũ không cần migrate |
| Layout product detail giống trang shop cũ | United Motors redesign hoàn toàn khác | 2-column layout mới, United Motors dark theme |
| 3 drafts là 3 design variations | User muốn 3 trang thật | 3 real product pages với data từ catalog |

---

## Technical Context (Brownfield)

### Font
- `src/app/layout.tsx`: `Inter` từ `next/font/google` → đổi sang `Montserrat`
- `src/app/(store)/page.tsx`: inline `style={{ fontFamily: "'Helvetica Neue'..." }}` → xóa, dùng CSS var

### Product Detail Page
- Existing: `src/app/(store)/shop/[slug]/page.tsx` — dùng GraphQL, có ProductImageShowcase, AddProductToCartForm, BuyNowButton
- New: Redesign toàn bộ theo United Motors style, thay AddProductToCartForm bằng VariantSelector + CTA liên hệ
- `src/app/(store)/layout.tsx`: bare layout (no header/footer), header/footer live in page.tsx

### Variants Schema
- Existing commented tables: `productSkus`, `options`, `optionValues`, `skuValues` (lines 424–540 of schema.ts) — KHÔNG dùng
- New tables cần tạo:
  ```sql
  CREATE TABLE variant_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  
  CREATE TABLE variant_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES variant_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(12, 0) NOT NULL,
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```
  (price dùng DECIMAL(12,0) để chứa VND — max 999,999,999,999đ)

### Supabase Storage
- `src/lib/s3.ts`: xóa file hoặc thay bằng `src/lib/storage.ts` dùng Supabase JS SDK
- `src/lib/utils.ts`: `keytoUrl()` → đổi sang Supabase CDN URL pattern
- `src/features/medias/`: ImageDialog component cần update để upload lên Supabase Storage
- Bucket name đề xuất: `products` (public)
- URL pattern: `{SUPABASE_URL}/storage/v1/object/public/products/{path}`
- Env vars: không cần thêm gì mới — dùng `NEXT_PUBLIC_SUPABASE_URL` đã có

### 3 Draft Pages — Seed Data
- SH2020 → catalog 1.jpg: 2 VariantGroups
  - Group "Gia Công Demi Signal Trước": options: Led Audi A11 PRO, Led Audi A7, Led Audi A8X (price: ~999.000đ each)
  - Group "Gia Công Bi Cầu": options: Bi HD HD1 (1.5M), Bi S500PRO V2 (2.5M), Bi S600PRO V3 (3M), Bi S700PRO V2 (3.75M)
- Vario2026 → catalog 7.jpg: 2 VariantGroups  
  - Group "Gia Công": Bi Kenzo S500PRO V2 (2.5M), S600PRO V3 (3M), S700PRO V2 (3.75M)
  - Group "Audi Signal": Audi Signal Trước Led A11PRO (1.5M), Led A7, Led A8X
- AB2026 → catalog 12.jpg: 2 VariantGroups
  - Group "Full Cụm Chóa Đèn Trước": Bi HD HD1 (1.5M), Bi S500 (2.5M), Bi S600 (3M), Bi S700 (3.75M)
  - Group "Gia Công Audi Xinhan": A11PRO+Logo+A7+Băng Led+A8X combo (1.3M)

### Admin CRUD
- `src/features/products/components/admin/ProductForm.tsx`: thêm section VariantGroups
- `src/_actions/products.ts`: thêm createVariantGroup, updateVariantGroup, deleteVariantGroup, createVariantOption, updateVariantOption, deleteVariantOption
- GraphQL codegen sẽ tự generate types sau khi migration chạy

---

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Product | core domain | id, name, slug, description, price (fallback), collectionId | has many VariantGroups, has many Medias |
| VariantGroup | core domain | id, product_id, name, description, display_order | belongs to Product, has many VariantOptions |
| VariantOption | core domain | id, group_id, name, price, images[], features[], display_order | belongs to VariantGroup |
| Media | supporting | id, key (Supabase path), alt, url | belongs to Product (junction) |
| Collection | supporting | id, label, slug, title | has many Products |

---

## Interview Transcript

<details>
<summary>Full Q&A (7 rounds)</summary>

### Round 0
**Q:** Topology: 5 components (Font, Product Detail, Variants, Supabase Storage, 3 Drafts) — đúng không?
**A:** Đúng hết 5 component

### Round 1
**Q:** Variant là gói dịch vụ đơn giản, gói lớn + sub-options, hay list bảng giá?
**A:** Gói lớn + sub-options, cho phép chọn 2 gói 1 lúc, sau khi chọn xong hiển thị giá tổng
**Ambiguity:** ~57%

### Round 2
**Q:** "Chọn 2 gói 1 lúc" — cụ thể là chọn 2 gói độc lập, chọn 1 gói + add-on, hay chỉ 1 gói?
**A:** Chọn 2 gói độc lập
**Ambiguity:** ~44%

### Round 3
**Q:** 3 draft là 3 trang thật cho 3 xe, 3 design variation, hay seed + 1 template?
**A:** 3 trang thật cho 3 xe
**Ambiguity:** ~40%

### Round 4
**Q:** Layout trang chi tiết: gallery trái + info phải, hero fullwidth, hay full-scroll dọc?
**A:** Gallery trái + info phải
**Ambiguity:** ~29%

### Round 5
**Q:** Supabase Storage migration scope: chỉ new uploads, full replace S3, hay defer?
**A:** Full replace S3
**Ambiguity:** ~23%

### Round 6
**Q:** Schema variants: thiết kế mới đơn giản (variant_groups + variant_options) hay dùng lại schema cũ?
**A:** Thiết kế mới đơn giản
**Ambiguity:** ~21%

### Round 7
**Q:** Sau khi chọn variants, khách làm gì: liên hệ/đặt lịch hay thêm vào giỏ hàng?
**A:** Chỉ liên hệ / đặt lịch
**Ambiguity:** **18.1%** ✅

</details>
