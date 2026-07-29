# Deep Interview Spec: Product Sections (Blog-style, block-based)

## Metadata
- Interview ID: di-product-sections-001
- Rounds: 5 (Round 0 topology + 5 Q&A)
- Final Ambiguity Score: 12%
- Type: brownfield (Next.js 14 + Supabase + Drizzle + Tiptap)
- Threshold: 0.20
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.95 | 0.35 | 0.333 |
| Constraint Clarity | 0.85 | 0.25 | 0.213 |
| Success Criteria | 0.85 | 0.25 | 0.213 |
| Context Clarity | 0.82 | 0.15 | 0.123 |
| **Total Clarity** | | | **0.881** |
| **Ambiguity** | | | **0.119 (12%)** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Data model & schema | active | Drizzle tables for sections + blocks, JSONB block data | Migration plan defined; drop `products.description` |
| Admin section builder | active | Admin UI to CRUD sections, add/reorder blocks, upload images, embed YouTube, preview live | 11 block editor forms + drag-drop reorder + live preview panel |
| Store renderer | active | shop/[slug] renders `sections` in order, each block via typed renderer | 11 block renderers + section title/description scaffolding |

## Goal
Replace the current single-field HTML product description with a **blog-style, 2-tier, block-based content system**. Each product owns an ordered list of **Sections**; each Section has a title + description + ordered list of **Blocks**. Blocks are one of 11 typed variants (rich content, media, structured data). Admin can build, reorder, and preview the entire structure inside `/admin/products/[id]`; the storefront renders it as an editorial product page comparable to auto365.vn/x-light-f30-ultra.

## Constraints
- Existing `products.description: text` column is **dropped** (clean break). The 3 seeded products (`sh-2026`, `air-blade-2026`, `vario-2026`) will be re-authored manually by admin — no auto-migration script needed.
- Admin is a single user (`harrykill.007@gmail.com`); no editorial workflow, no per-user permissions beyond existing `isAdmin` guard.
- Images reuse the existing Supabase Storage `products` bucket + `/api/medias` upload endpoint + `MultiImageDialog`.
- YouTube embeds are stored as full URL; render extracts video ID and emits an `<iframe>` inside a 16:9 aspect wrapper.
- No draft/publish state — every Save is live. Preview happens **inside the admin editor** via a right-hand preview panel that reuses the store renderer components.
- Must work with existing stack (Next.js 14 App Router, `use client` on interactive parts, Drizzle on admin writes, Supabase JS SDK on public reads, force-dynamic API routes).
- Vietnamese content, must respect the Tailwind fontSize/line-height fix already in place for Vietnamese diacritics.

## Non-Goals
- Multiple admin users, per-section permissions, or approval workflow.
- Version history / undo across sessions.
- SEO metadata per section (e.g., separate meta tags per block).
- Multi-language section content.
- Auto-import from URL (scrape auto365-style pages).
- Public API for external CMS.
- Inline commenting or collaboration.

## Acceptance Criteria
- [ ] New Drizzle tables `product_sections` (id, product_id, title, description, order) and `section_blocks` (id, section_id, type, order, data JSONB) added via migration.
- [ ] `products.description` column dropped via the same migration.
- [ ] TypeScript enum / discriminated union covers 11 block types: `heading`, `paragraph`, `image`, `youtube`, `list`, `quote`, `divider`, `spec_table`, `feature_grid`, `image_comparison`, `faq`.
- [ ] Admin route `/admin/products/[id]` shows a `ProductSectionsEditor` component that lists sections with up/down reorder + delete, and lets admin add a new section.
- [ ] For each section, admin can edit title + description (short text), and manage its ordered blocks (add block via type picker, reorder up/down, delete).
- [ ] Each block type has a dedicated inline form: text inputs for Heading, Tiptap editor for Paragraph, `MultiImageDialog` for Image, URL input + validation for YouTube, dynamic rows for List/Spec Table/Feature Grid/FAQ, dual image picker for Image Comparison.
- [ ] Right-hand live preview panel in admin renders the current section list using the same components used on the storefront.
- [ ] Save button (single click) persists the full section+block tree via one `PUT /api/products/[id]/sections` call (replace-all semantics).
- [ ] Storefront `shop/[slug]` fetches sections via `GET /api/products/[slug]/sections` (or embeds in the existing product endpoint) and renders each section with its blocks in order.
- [ ] Renderer covers all 11 block types with responsive layouts that don't clip Vietnamese diacritics.
- [ ] YouTube renderer produces a valid, responsive 16:9 `<iframe>` from any accepted URL format (`youtu.be/*`, `youtube.com/watch?v=*`, `youtube.com/embed/*`).
- [ ] Image blocks reuse the existing Supabase Storage bucket; no new upload pipeline.
- [ ] `npm run build` passes; `npx tsc --noEmit` clean; ESLint clean.
- [ ] Old `dangerouslySetInnerHTML={{ __html: product.description }}` usage in `shop/[slug]/page.tsx` is removed.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Section" is a fuzzy word | Round 1: fixed catalog vs generic vs block-based vs hybrid? | Block-based (Notion style) |
| Block-based means flat block list | Round 2: does "section title/description" mean 2-tier? | 2-tier: Section → [Blocks] |
| A few blocks are enough | Round 3: minimal 4 vs standard 7 vs rich 10+? | Rich 11-block catalog (incl. Spec Table, Feature Grid, Image Comparison, FAQ) |
| Existing HTML descriptions need auto-migration | Round 4 (contrarian): what happens to sh-2026/ab-2026/vario-2026? | Clean break — drop `description`, admin re-inputs |
| Draft/publish is standard practice | Round 5 (simplifier): does a single admin need it? | No draft flag — Save is live; preview lives inside the admin editor |

## Technical Context
- **Framework:** Next.js 14 App Router, `(admin)` and `(store)` route groups, mixed server/client components.
- **DB / ORM:** Supabase Postgres via Drizzle on writes, Supabase JS SDK on public reads (avoids IPv6 issues on Vercel serverless).
- **Storage:** Supabase Storage bucket `products/public/*`, existing `/api/medias` POST returns `{id, key, alt}[]`; `MultiImageDialog` allows both library-pick and upload.
- **Rich text:** Tiptap is already installed (`RichTextEditor.tsx`) — reuse for the `paragraph` block; other blocks are structured JSON, not HTML.
- **Existing schema:** `products.description text` (to be dropped), `product_medias` (unchanged, still used for hero gallery), `medias` (unchanged).
- **Existing renderer:** `src/app/(store)/shop/[slug]/page.tsx` currently does `dangerouslySetInnerHTML={{ __html: product.description }}` inside a "Mô tả sản phẩm" block — replace with `<ProductSections sections={product.sections}/>`.
- **Existing admin form:** `src/features/products/components/admin/ProductForm.tsx` uses `RichTextEditor` for description — replace that field group with `<ProductSectionsEditor productId={id}/>`.

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Product | core (existing) | id, name, slug, price, imageKey, badge | has many Sections |
| Section | core (new) | id, product_id, title, description (short text), order | belongs to Product; has many Blocks |
| Block | core (new) | id, section_id, type (enum), order, data (JSONB) | belongs to Section |
| Block.Heading | variant | text, level (h2/h3) | — |
| Block.Paragraph | variant | html (Tiptap output) | — |
| Block.Image | variant | mediaId, caption | references Media |
| Block.YouTube | variant | url, caption | — |
| Block.List | variant | items[] (bullet or numbered), style | — |
| Block.Quote | variant | text, cite | — |
| Block.Divider | variant | (none) | — |
| Block.SpecTable | variant | rows[] {label, value} | — |
| Block.FeatureGrid | variant | features[] {icon, title, description} | — |
| Block.ImageComparison | variant | leftMediaId, leftLabel, rightMediaId, rightLabel | references Media |
| Block.FAQ | variant | items[] {question, answer} | — |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 0 | 2 (Product, Section-tbd) | 2 | - | - | N/A |
| 1 | 3 (+ Block generic) | 1 | 1 | 1 | 66% |
| 2 | 3 (Section→Blocks confirmed) | 0 | 0 | 3 | 100% |
| 3 | 14 (+ 11 Block variants) | 11 | 0 | 3 | 21% new-heavy |
| 4 | 14 (migration = drop, no new entity) | 0 | 0 | 14 | 100% |
| 5 | 14 (preview = UI concern, no entity) | 0 | 0 | 14 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (5 rounds + Round 0 topology gate)</summary>

### Round 0 — Topology Confirmation
**Q:** 3 top-level components — Data model & schema, Admin section builder, Store renderer. Correct?
**A:** Looks right — proceed with all 3.

### Round 1 — Goal Clarity (Section model)
**Q:** Fixed catalog vs generic vs block-based vs hybrid?
**A:** Block-based (Notion style).
**Ambiguity:** 48%.

### Round 2 — Goal Clarity (Hierarchy)
**Q:** 2-tier Section→Blocks, flat blocks only, or 2-tier without subtitle?
**A:** 2-tier: Section → Blocks (title + description per section).
**Ambiguity:** 40%.

### Round 3 — Constraints (Block catalog)
**Q:** Minimal 4 / Standard 7 / Rich 10+ / propose?
**A:** Rich 10+ (Heading, Paragraph, Image, YouTube, List, Quote, Divider, Spec Table, Feature Grid, Image Comparison, FAQ).
**Ambiguity:** 29%.

### Round 4 — Constraints (Migration, Contrarian mode)
**Q:** Auto-migrate / keep both / clean break / auto-then-drop?
**A:** Clean break — drop `description`, admin re-inputs manually.
**Ambiguity:** 23%.

### Round 5 — Criteria (Publish flow, Simplifier mode)
**Q:** Live edit + external preview / preview-in-admin / full draft-publish?
**A:** Preview-in-admin panel; Save is live; no draft flag.
**Ambiguity:** 12% (threshold met).
</details>
