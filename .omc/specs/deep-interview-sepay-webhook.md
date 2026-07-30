# Deep Interview Spec: SePay Payment Webhook (backend)

## Metadata
- Interview ID: di-sepay-webhook-001
- Rounds: 2 (Round 0 topology + 2 Q&A)
- Final Ambiguity Score: 14%
- Type: brownfield
- Threshold: 0.20 (source: default)
- Status: PASSED
- Execution note: push to a NEW branch (main is NOT deployed yet).

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Goal | 0.92 | 0.35 | 0.322 |
| Constraints | 0.85 | 0.25 | 0.213 |
| Criteria | 0.75 | 0.25 | 0.188 |
| Context | 0.90 | 0.15 | 0.135 |
| **Ambiguity** | | | **14%** |

## Topology
| Component | Status | Description | Coverage / Deferral |
|---|---|---|---|
| Webhook endpoint + auth | active | `POST /api/hook-sepay-payment`: verify HMAC-SHA256, replay guard, parse body, store transaction idempotently | full |
| Order reconciliation | deferred | Match payment code → order, verify amount, mark paid | Deferred by user: chưa có flow tạo order; đối soát sau. We still EXTRACT + store the code so later matching is trivial. |
| Order payment code (DH) | deferred | Add DH transfer code to orders + generation | Deferred: no order-creation flow exists yet. |

## Goal
Xây backend webhook nhận biến động số dư từ SePay: `POST /api/hook-sepay-payment`. Endpoint xác thực chữ ký HMAC-SHA256, chống replay theo timestamp, parse payload SePay, và lưu mọi giao dịch vào bảng `sepay_transactions` một cách idempotent (bỏ qua trùng theo SePay `id`). Trích sẵn mã thanh toán dạng `DH/dH + 6–8 chữ số` từ `content` để phục vụ đối soát order sau này (đối soát chưa làm trong đợt này).

## Constraints
- Route: `src/app/api/hook-sepay-payment/route.ts`, `export const runtime = "nodejs"`, `export const dynamic = "force-dynamic"`.
- **Raw body**: đọc `await req.text()` TRƯỚC khi parse JSON — HMAC ký trên raw bytes, không được parse-rồi-stringify lại.
- **Auth HMAC-SHA256**: `expected = "sha256=" + hex(HMAC_SHA256(secret, timestamp + "." + rawBody))`; so sánh timing-safe (`crypto.timingSafeEqual`) với header `X-SePay-Signature`. Secret = env `SEPAY_WEBHOOK_SECRET`.
- **Replay guard**: reject nếu `|now - X-SePay-Timestamp| > 300s` (5 phút). Timestamp là Unix giây.
- **Idempotency**: cột `sepay_id` (từ payload `id`) UNIQUE. Nếu đã tồn tại → bỏ qua insert, vẫn trả 200 `{success:true}` (SePay không retry).
- **Response contract**:
  - Thành công (lưu mới hoặc trùng) → `200 {"success": true}`.
  - Sai/thiếu chữ ký hoặc timestamp → `401 {"success": false, "message": "..."}`.
  - Thiếu secret cấu hình / lỗi parse → `400`; lỗi DB bất ngờ → `500 {"success": false}` (để SePay retry).
- **Fail-closed nếu thiếu secret**: nếu `SEPAY_WEBHOOK_SECRET` chưa set → 500, KHÔNG lưu (không cho qua khi chưa cấu hình).
- DB: drizzle `db` từ `@/lib/supabase/db` (giống Stripe webhook).
- Env: thêm `SEPAY_WEBHOOK_SECRET: z.string().optional()` vào `src/env.mjs` (optional để build không vỡ khi chưa set, nhưng route fail-closed ở runtime).
- Chỉ nhận `transferType: "in"` là tiền vào; giao dịch `out` vẫn lưu nhưng đánh dấu (không cần match order).

## Non-Goals
- Đối soát/gắn transaction vào order (deferred).
- Sinh mã DH trên order / sửa bảng orders (deferred).
- Trang admin xem giao dịch (không chọn ở Round 0).
- Cập nhật `order_status`/`payment_status` (deferred — chưa có order để cập nhật).
- Hoàn tiền, đối soát 2 chiều, QR code render.
- OAuth2 / API-Key auth mode (chỉ làm HMAC-SHA256 như user chỉ định).

## Acceptance Criteria
- [ ] Migration: bảng `sepay_transactions` với các cột: `id` (text cuid PK nội bộ), `sepay_id` (bigint UNIQUE — payload `id`), `gateway`, `transaction_date`, `account_number`, `sub_account`, `code`, `content`, `transfer_type`, `description`, `transfer_amount` (numeric), `reference_code`, `accumulated` (numeric), `payment_code` (text nullable — mã DH trích được), `matched_order_id` (text nullable, cho đối soát sau), `raw` (jsonb — full payload), `created_at`.
- [ ] Drizzle schema mirror bảng `sepay_transactions` + export types.
- [ ] Route `POST /api/hook-sepay-payment` đọc raw body, verify HMAC-SHA256 (`sha256={ts}.{rawBody}`) timing-safe với `X-SePay-Signature`.
- [ ] Reject 401 khi chữ ký sai/thiếu; reject khi `|now - ts| > 300s`.
- [ ] Fail-closed 500 khi thiếu `SEPAY_WEBHOOK_SECRET`.
- [ ] Parse body, insert `sepay_transactions`; nếu `sepay_id` trùng → skip, vẫn trả `200 {success:true}`.
- [ ] Trích `payment_code` từ `content` bằng regex `/[dD]H(\d{6,8})/` (chuẩn hoá về `DH` + số); không match → null.
- [ ] `transfer_amount`, `accumulated` lưu số nguyên VND; `raw` lưu nguyên payload JSON.
- [ ] Trả `200 {"success": true}` cho mọi giao dịch hợp lệ (mới hoặc trùng).
- [ ] `SEPAY_WEBHOOK_SECRET` khai báo trong `src/env.mjs`.
- [ ] `npm run build` pass, tsc clean.
- [ ] Push lên branch mới (không phải main).

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|---|---|---|
| Order tồn tại trước khi thanh toán | Round 1 | Chưa có flow tạo order → chỉ build webhook + bảng giao dịch, đối soát sau |
| Match/cập nhật order ngay | Round 1 | Deferred; chỉ trích + lưu payment_code |
| Idempotency theo referenceCode | Round 2 | Dedupe theo SePay `id` (unique), trả success:true 200 |

## Technical Context
- SePay HMAC-SHA256 (docs xac-thuc): ký `"{timestamp}.{raw_body}"`, header `X-SePay-Signature: sha256=<hex>`, `X-SePay-Timestamp` Unix giây, replay window 5 phút. So sánh timing-safe.
- Payload mẫu: `{gateway, transactionDate, accountNumber, subAccount, code, content, transferType, description, transferAmount, referenceCode, accumulated, id}`.
- Repo: Stripe webhook `src/app/api/webhook/route.ts` là mẫu tham chiếu (drizzle `db`, verify chữ ký). Env qua `@t3-oss/env-nextjs` + Zod trong `src/env.mjs`. Orders id = CUID2 text.
- `crypto` Node built-in cho HMAC + `timingSafeEqual` (route runtime nodejs).

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|---|---|---|---|
| SePayTransaction | core (new) | id, sepayId (unique), gateway, transactionDate, accountNumber, subAccount, code, content, transferType, description, transferAmount, referenceCode, accumulated, paymentCode, matchedOrderId, raw, createdAt | matchedOrderId → orders (nullable, future) |
| WebhookAuth | process | secret (env), signature (header), timestamp (header), rawBody | verifies SePayTransaction ingestion |
| PaymentCode | derived | DH + 6–8 digits, extracted from content | future link to Order |

## Interview Transcript
<details>
<summary>Q&A (Round 0 + 2 rounds)</summary>

### Round 0 — Topology
**Q:** 3 components (webhook+auth / reconciliation / order code)?
**A:** Đúng cả 3.

### Round 1 — Goal (order origin)
**Q:** Order + mã DH ra đời thế nào?
**A:** Chưa có flow tạo order → chỉ build webhook + bảng giao dịch, đối soát sau. (Components 2 & 3 → deferred.)
**Ambiguity:** 26%.

### Round 2 — Constraints (idempotency + response)
**Q:** Idempotency + response cho SePay?
**A:** Dedupe theo SePay `id`, trả `{success:true}` 200.
**Ambiguity:** 14% → PASSED.
</details>
