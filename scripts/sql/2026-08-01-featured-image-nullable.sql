-- Duplicating a product no longer carries any image over, including the
-- featured image — so a product row has to be able to exist without one.
--
-- Safe for the storefront: every card already handles a missing image.
-- resolveImageSrc (SpecialsSection) and ProductRecCard both fall back to
-- /catalog.pdf/1.jpg when imageKey is null, and both API routes already type
-- imageKey as `string | null`.

BEGIN;

SELECT is_nullable AS before
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
  AND column_name = 'featured_image_id';

ALTER TABLE products ALTER COLUMN featured_image_id DROP NOT NULL;

SELECT is_nullable AS after
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
  AND column_name = 'featured_image_id';

COMMIT;
