/**
 * Normalise a `section_blocks.data` value into a plain object.
 *
 * Rows written before the jsonb double-encoding fix hold a JSON *string*
 * instead of a JSON *object* (`jsonb_typeof = 'string'`). drizzle parses that
 * back transparently, so the admin never saw a problem — but PostgREST returns
 * it verbatim, so the storefront received a string, `data.url` was undefined,
 * and blocks silently rendered as nothing.
 *
 * Reads go through here so both shapes work without a migration. New writes
 * store proper objects, so this is a no-op for anything saved from now on.
 */
export function parseBlockData(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      // A doubly-encoded value can nest more than once.
      return parseBlockData(parsed);
    } catch {
      return {};
    }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}
