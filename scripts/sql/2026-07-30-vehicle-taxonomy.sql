-- =========================================================================
-- Vehicle taxonomy: brands -> models -> generations, + products.generation_id
-- Idempotent. Safe to re-run.
-- =========================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.brands (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label         varchar(255) NOT NULL,
  slug          varchar(255) NOT NULL,
  display_order integer      NOT NULL DEFAULT 0,
  created_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS brands_slug_key ON public.brands (slug);

CREATE TABLE IF NOT EXISTS public.models (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand_id      text         NOT NULL,
  label         varchar(255) NOT NULL,
  slug          varchar(255) NOT NULL,
  display_order integer      NOT NULL DEFAULT 0,
  is_active     boolean      NOT NULL DEFAULT true,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT models_to_brand FOREIGN KEY (brand_id)
    REFERENCES public.brands (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS models_brand_slug_key ON public.models (brand_id, slug);
CREATE INDEX IF NOT EXISTS models_brand_id_idx   ON public.models (brand_id);
CREATE INDEX IF NOT EXISTS models_menu_order_idx ON public.models (is_active, display_order);

CREATE TABLE IF NOT EXISTS public.generations (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  model_id      text         NOT NULL,
  label         varchar(255) NOT NULL,
  slug          varchar(255) NOT NULL,
  display_order integer      NOT NULL DEFAULT 0,
  is_active     boolean      NOT NULL DEFAULT true,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT generations_to_model FOREIGN KEY (model_id)
    REFERENCES public.models (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS generations_model_slug_key ON public.generations (model_id, slug);
CREATE INDEX IF NOT EXISTS generations_model_id_idx   ON public.generations (model_id);
CREATE INDEX IF NOT EXISTS generations_menu_order_idx ON public.generations (is_active, display_order);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS generation_id text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_to_generation') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_to_generation FOREIGN KEY (generation_id)
      REFERENCES public.generations (id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_status_check') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_status_check CHECK (status IN ('active','inactive'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS products_generation_id_idx ON public.products (generation_id);
CREATE INDEX IF NOT EXISTS products_status_idx        ON public.products (status);

-- SECURITY: anon/authenticated get READ ONLY. The anon key is public (it ships
-- in the client bundle) and RLS is OFF here, so granting them write access would
-- let any visitor vandalize the storefront menu via PostgREST — this was
-- verified exploitable before being fixed. Admin writes do not need these
-- grants: they go through drizzle (postgres(DATABASE_URL)), which bypasses
-- PostgREST entirely. See 2026-07-30-vehicle-taxonomy-revoke-anon-writes.sql.
GRANT SELECT
  ON public.brands, public.models, public.generations
  TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.brands, public.models, public.generations
  TO service_role;

-- RLS intentionally left DISABLED, matching public.collections / public.products.

COMMIT;
