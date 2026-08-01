import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env.mjs";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.log("🔴 no database URL");
}

// Detect if URL is a Supabase pooler URL (recommended for serverless)
const isPooler = env.DATABASE_URL.includes("pooler.supabase.com");
const isTransactionPooler = env.DATABASE_URL.includes(":6543");

// Cache the client across invocations in the same Lambda container
// eslint-disable-next-line no-var
declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__pgClient ??
  postgres(env.DATABASE_URL, {
    // Serverless-friendly config
    max: isPooler ? 10 : 1, // pooler multiplexes, so more connections OK
    idle_timeout: 20, // close idle connections after 20s
    connect_timeout: 10, // 10s connection timeout
    prepare: !isTransactionPooler, // transaction pooler doesn't support prepared statements
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = client;
}

const db = drizzle(client, { schema });

/**
 * The underlying postgres.js client.
 *
 * Needed for jsonb writes. drizzle serialises a json/jsonb value with
 * JSON.stringify and hands postgres.js the resulting string; postgres.js then
 * serialises it a second time because the column type is jsonb, so the row
 * ends up holding a JSON *string* rather than a JSON *object*. Measured: every
 * drizzle path (json(), jsonb(), text(), and an explicit ::jsonb cast) stores
 * `jsonb_typeof = 'string'`, while `client.json(value)` stores 'object'.
 *
 * drizzle then parses that string back on read, so the damage is invisible to
 * drizzle-based code and only shows up in consumers that read the column as
 * real jsonb — PostgREST, and therefore the whole storefront.
 */
export const sqlClient = client;

export default db;
