export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { env } from "@/env.mjs";
import db from "@/lib/supabase/db";
import { sepayTransactions } from "@/lib/supabase/schema";

// Replay window: reject requests whose timestamp is more than 5 minutes off.
const REPLAY_WINDOW_SECONDS = 300;

// Payment code embedded in the transfer content, e.g. "DH123456".
const PAYMENT_CODE_RE = /[dD]H(\d{6,8})/;

type SePayPayload = {
  id: number;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string;
  code?: string | null;
  content?: string;
  transferType?: string;
  description?: string;
  transferAmount?: number;
  referenceCode?: string;
  accumulated?: number;
};

function fail(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

function verifySignature(
  secret: string,
  timestamp: string,
  rawBody: string,
  signatureHeader: string,
): boolean {
  // SePay signs "{timestamp}.{rawBody}" with HMAC-SHA256 and sends the header
  // as "sha256=<hex>". Compare in constant time.
  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = env.SEPAY_WEBHOOK_SECRET;
  // Fail closed: never accept unverified webhooks when the secret is unset.
  if (!secret) {
    console.error("[sepay] SEPAY_WEBHOOK_SECRET is not configured");
    return fail(500, "Webhook secret not configured");
  }

  const signature = request.headers.get("x-sepay-signature");
  const timestamp = request.headers.get("x-sepay-timestamp");
  if (!signature || !timestamp) {
    return fail(401, "Missing signature or timestamp");
  }

  // Replay guard.
  const ts = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > REPLAY_WINDOW_SECONDS) {
    return fail(401, "Timestamp outside allowed window");
  }

  // Raw body is required — HMAC is computed over the exact received bytes.
  const rawBody = await request.text();

  if (!verifySignature(secret, timestamp, rawBody, signature)) {
    return fail(401, "Invalid signature");
  }

  let payload: SePayPayload;
  try {
    payload = JSON.parse(rawBody) as SePayPayload;
  } catch {
    return fail(400, "Invalid JSON body");
  }

  if (payload?.id == null) {
    return fail(400, "Missing transaction id");
  }

  const paymentCode = (() => {
    const m = (payload.content ?? "").match(PAYMENT_CODE_RE);
    return m ? `DH${m[1]}` : null;
  })();

  try {
    await db
      .insert(sepayTransactions)
      .values({
        sepayId: payload.id,
        gateway: payload.gateway ?? null,
        transactionDate: payload.transactionDate ?? null,
        accountNumber: payload.accountNumber ?? null,
        subAccount: payload.subAccount ?? null,
        code: payload.code ?? null,
        content: payload.content ?? null,
        transferType: payload.transferType ?? null,
        description: payload.description ?? null,
        transferAmount:
          payload.transferAmount != null
            ? String(payload.transferAmount)
            : null,
        referenceCode: payload.referenceCode ?? null,
        accumulated:
          payload.accumulated != null ? String(payload.accumulated) : null,
        paymentCode,
        raw: payload as unknown as Record<string, unknown>,
      })
      // Idempotent: a re-delivered webhook (same SePay id) is a no-op but we
      // still acknowledge with 200 so SePay stops retrying.
      .onConflictDoNothing({ target: sepayTransactions.sepayId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[sepay] insert error:", err);
    // 500 → SePay retries later.
    return fail(500, "Internal error");
  }
}
