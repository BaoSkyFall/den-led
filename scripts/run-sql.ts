import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

dotenv.config();

const file = process.argv[2];
if (!file) throw new Error("usage: tsx scripts/run-sql.ts <path-to.sql>");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

const sqlText = readFileSync(resolve(process.cwd(), file), "utf-8");

// Transaction pooler (:6543) does not support prepared statements.
// Passing no params keeps postgres-js in simple protocol, which allows
// multiple statements in one round-trip.
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

(async () => {
  try {
    await sql.unsafe(sqlText);
    console.log("applied " + file);
  } catch (e) {
    console.error("failed " + file + ": " + (e as Error).message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();
