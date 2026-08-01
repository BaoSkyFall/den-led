import { customType } from "drizzle-orm/pg-core";

/**
 * A jsonb column that stores real JSON objects.
 *
 * drizzle's own `json()` / `jsonb()` types run `JSON.stringify` in
 * `mapToDriverValue`. postgres.js then stringifies a second time: drizzle
 * executes through `client.unsafe()`, which forces the describe-first path, so
 * the server reports the column's OID (3802) back and postgres.js applies its
 * jsonb serialiser — `JSON.stringify` again — to the string drizzle already
 * produced. The row ends up holding a JSON *string* rather than a JSON
 * *object*.
 *
 * drizzle parses that back on read, so the damage is invisible to
 * drizzle-based code. It only surfaces in consumers that read the column as
 * real jsonb: PostgREST (and therefore the whole storefront), `data->>'key'`
 * predicates, and Supabase Studio.
 *
 * Passing the value through untouched lets postgres.js do the single, correct
 * serialisation. Use this for every json/jsonb column rather than fixing
 * individual call sites — the failure is silent on the write side, so any
 * writer that forgets would reintroduce it.
 */
const passthrough = (sqlType: "json" | "jsonb") =>
  customType<{ data: unknown; driverData: unknown }>({
    dataType: () => sqlType,
    toDriver: (value) => value,
  });

/** For a column that is `json` in Postgres. */
export const jsonColumn = <TData>(name: string) =>
  passthrough("json")(name).$type<TData>();

/** For a column that is `jsonb` in Postgres. */
export const jsonbColumn = <TData>(name: string) =>
  passthrough("jsonb")(name).$type<TData>();
