import { env } from "@/env.mjs";
import Stripe from "stripe";

// Lazy singleton — never instantiate Stripe at module load time. When
// STRIPE_SECRET_KEY is missing (common on Vercel until Stripe is wired up),
// `new Stripe(undefined, ...)` internally builds a `new URL(undefined)` that
// throws `ERR_INVALID_URL` during Next's "collect page data" build step,
// killing the entire build for every route that transitively imports this.
let _stripe: Stripe | null = null;

function getStripeServer(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Set it before calling Stripe.",
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      appInfo: { name: "HiyoRi", version: "0.1.0" },
    });
  }
  return _stripe;
}

// Proxy keeps the existing `stripe.checkout.sessions.create(...)` call sites
// working — property access triggers lazy init on first real use.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeServer();
    const value = (client as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === "function"
      ? (value as (...a: unknown[]) => unknown).bind(client)
      : value;
  },
});
