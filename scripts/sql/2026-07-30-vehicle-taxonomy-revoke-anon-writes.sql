-- SECURITY FIX for 2026-07-30-vehicle-taxonomy.sql lines 66-68.
--
-- That migration granted INSERT/UPDATE/DELETE on the taxonomy tables to `anon`
-- and `authenticated` while RLS is OFF. The anon key is public (it ships in the
-- client bundle), so ANY visitor could vandalize or delete the storefront menu
-- through PostgREST. This was verified empirically: an anon-key client
-- successfully inserted a fake brand, renamed a real model, and deleted a
-- generation row.
--
-- Safe to revoke because the admin write path does NOT use PostgREST:
--   src/features/vehicle-taxonomy/actions.ts -> drizzle `db`
--   -> src/lib/supabase/db.ts -> postgres(DATABASE_URL)
-- which connects directly as the `postgres` role and is unaffected by these
-- grants. Only SELECT is needed by anon, for the public menu query in
-- src/features/vehicle-taxonomy/queries.ts (fetchNavTree, anon key).

BEGIN;

REVOKE INSERT, UPDATE, DELETE
  ON public.brands, public.models, public.generations
  FROM anon, authenticated;

-- Reads stay open: the public storefront menu is public data.
GRANT SELECT
  ON public.brands, public.models, public.generations
  TO anon, authenticated;

COMMIT;
