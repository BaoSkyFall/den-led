-- SECURITY FIX: privilege escalation via an attacker-writable admin signal.
--
-- The two variant write policies trusted `public.profiles.is_admin`:
--     USING (EXISTS (SELECT 1 FROM profiles
--                    WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
-- but `public.profiles` has RLS OFF and grants UPDATE to anon/authenticated, so
-- the policy's own source of truth was writable by the attacker it was meant to
-- stop. Verified live: public signup is ENABLED (POST /auth/v1/signup with the
-- public anon key returns a password-strength error, not `signup_disabled`), so
-- the full chain was: self-register -> PATCH profiles SET is_admin = true ->
-- policy satisfied -> rewrite every variant price.
--
-- This codebase has two admin signals and only one is safe:
--   * app_metadata.isAdmin  - a JWT claim, writable only with the service-role
--                             key. Already what the app itself trusts
--                             (src/features/users/actions.ts:29-30 isAdmin()).
--   * profiles.is_admin     - a plain table column, anon-writable. Broken.
-- These policies now use the JWT claim.
--
-- Safe for the admin UI: variant writes go through drizzle
-- (src/_actions/variants.ts -> src/lib/supabase/db.ts -> postgres(DATABASE_URL)),
-- which connects as the table owner and bypasses RLS, so it never depended on
-- these policies. That same bypass is why those server actions must carry
-- assertAdmin() in application code - added in the same commit as this file.
--
-- Verified before running: both existing users already have
-- app_metadata.isAdmin = true, so nobody loses access.

BEGIN;

DROP POLICY IF EXISTS variant_options_admin_write ON public.variant_options;
DROP POLICY IF EXISTS variant_groups_admin_write  ON public.variant_groups;

-- coalesce(...) = 'true' rather than a ::boolean cast: a missing or malformed
-- claim must fail closed, never raise a cast error inside the policy.
CREATE POLICY variant_options_admin_write ON public.variant_options
  FOR ALL TO authenticated
  USING      (coalesce((auth.jwt() -> 'app_metadata') ->> 'isAdmin', 'false') = 'true')
  WITH CHECK (coalesce((auth.jwt() -> 'app_metadata') ->> 'isAdmin', 'false') = 'true');

CREATE POLICY variant_groups_admin_write ON public.variant_groups
  FOR ALL TO authenticated
  USING      (coalesce((auth.jwt() -> 'app_metadata') ->> 'isAdmin', 'false') = 'true')
  WITH CHECK (coalesce((auth.jwt() -> 'app_metadata') ->> 'isAdmin', 'false') = 'true');

COMMIT;

-- NOT fixed here, still open (pre-existing, needs its own per-table policy
-- design because carts/wishlist are written client-side with the public key):
-- 11 tables have RLS OFF *and* anon INSERT/UPDATE/DELETE - address, carts,
-- collections, comments, medias, order_lines, orders, product_medias, products,
-- profiles, wishlist. `orders`/`address` are empty today, which is the only
-- reason this is not already a live PII/payment-data breach.
