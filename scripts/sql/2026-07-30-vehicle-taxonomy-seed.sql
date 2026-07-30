-- =========================================================================
-- Vehicle taxonomy seed: Honda brand + models + generations,
-- plus backfill of the 3 existing products via exact slug match.
-- Idempotent. Safe to re-run.
-- =========================================================================
BEGIN;

INSERT INTO public.brands (id, label, slug, display_order)
VALUES ('brand-honda', 'Honda', 'honda', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.models (id, brand_id, label, slug, display_order, is_active) VALUES
  ('model-sh',        'brand-honda', 'SH',        'sh',        1, true),
  ('model-air-blade', 'brand-honda', 'Air Blade', 'air-blade', 2, true),
  ('model-vario',     'brand-honda', 'Vario',     'vario',     3, true),
  ('model-lead',      'brand-honda', 'Lead',      'lead',      4, true),
  ('model-winner',    'brand-honda', 'Winner',    'winner',    5, true),
  ('model-vision',    'brand-honda', 'Vision',    'vision',    6, true),
  ('model-future',    'brand-honda', 'Future',    'future',    7, true)
ON CONFLICT (brand_id, slug) DO NOTHING;

INSERT INTO public.generations (id, model_id, label, slug, display_order, is_active) VALUES
  ('gen-sh-2026',     'model-sh',        'SH 2026',        'sh-2026',        1, true),
  ('gen-sh-2020',     'model-sh',        'SH 2020',        'sh-2020',        2, true),
  ('gen-ab-2026',     'model-air-blade', 'Air Blade 2026', 'air-blade-2026', 1, true),
  ('gen-ab-2013',     'model-air-blade', 'Air Blade 2013', 'air-blade-2013', 2, true),
  ('gen-vario-2026',  'model-vario',     'Vario 2026',     'vario-2026',     1, true),
  ('gen-vario-2020',  'model-vario',     'Vario 2020',     'vario-2020',     2, true),
  ('gen-vario-160',   'model-vario',     'Vario 160',      'vario-160',      3, true),
  ('gen-lead-2025',   'model-lead',      'Lead 2025',      'lead-2025',      1, true),
  ('gen-lead-2018',   'model-lead',      'Lead 2018',      'lead-2018',      2, true),
  ('gen-winner-base', 'model-winner',    'Winner',         'winner',         1, true),
  ('gen-vision-base', 'model-vision',    'Vision',         'vision',         1, true),
  ('gen-future-base', 'model-future',    'Future',         'future',         1, true)
ON CONFLICT (model_id, slug) DO NOTHING;

-- Backfill the 3 existing products by exact slug match (product slug == generation slug).
UPDATE public.products p
SET generation_id = g.id
FROM public.generations g
WHERE p.generation_id IS NULL
  AND p.slug = g.slug;

COMMIT;
