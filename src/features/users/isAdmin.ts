import type { User } from "@supabase/supabase-js";

/**
 * Whether a Supabase user carries the admin flag.
 *
 * Lives here rather than in `actions.ts` because that module carries
 * `"use server"`, and Next wraps every export of such a module as a server
 * action — which makes it async. A guard written as `if (!isAdmin(user))` then
 * tests `!Promise`, which is always `false`, so the check silently never fires.
 *
 * The failure is invisible to `next build` and to jest (which imports the raw
 * module without Next's transform), so the only reliable fix is to keep a
 * synchronous predicate out of a `"use server"` file entirely.
 */
export const isAdmin = (currentUser: User | null) =>
  Boolean(currentUser?.app_metadata?.isAdmin);
