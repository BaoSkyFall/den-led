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

export default db;
