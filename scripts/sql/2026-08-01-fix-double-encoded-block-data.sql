-- section_blocks.data was written double-encoded for every block saved through
-- the admin editor: drizzle stringifies a jsonb value and postgres.js
-- stringifies it again, so the column held a JSON *string* rather than a JSON
-- *object* (jsonb_typeof = 'string').
--
-- drizzle parsed it back on read, so the admin looked correct. PostgREST does
-- not — it returns the string as-is, so the storefront saw data.url as
-- undefined and rendered those blocks as nothing. That is why editing a
-- product's blog in admin never showed up on /shop/<slug>.
--
-- The write path is fixed in api/product-sections/[productId]; this normalises
-- the rows written before that. `data #>> '{}'` extracts the inner text of a
-- json string scalar, which is the original JSON document.

-- products.tags and products.images are the same class of column written the
-- same way, so they are repaired here too. They are latent rather than broken
-- today: their only reader is the admin form through drizzle, which parses the
-- string back. They break the moment anything reads them as real jsonb.
--
-- The loops handle a value that was encoded more than twice: one pass of
-- `#>> '{}'` peels a single layer, so repeat until no string-shaped rows remain.

BEGIN;

SELECT 'section_blocks.data' AS col, jsonb_typeof(data) AS shape, count(*)
FROM section_blocks GROUP BY 1, 2;

DO $$
BEGIN
  LOOP
    UPDATE section_blocks SET data = (data #>> '{}')::jsonb
    WHERE jsonb_typeof(data) = 'string';
    EXIT WHEN NOT FOUND;
  END LOOP;

  LOOP
    UPDATE products SET tags = (tags #>> '{}')::json
    WHERE jsonb_typeof(tags::jsonb) = 'string';
    EXIT WHEN NOT FOUND;
  END LOOP;

  LOOP
    UPDATE products SET images = (images #>> '{}')::json
    WHERE jsonb_typeof(images::jsonb) = 'string';
    EXIT WHEN NOT FOUND;
  END LOOP;
END $$;

-- Expect 'object' for section_blocks.data and 'array' for tags/images.
SELECT 'section_blocks.data' AS col, jsonb_typeof(data) AS shape, count(*)
FROM section_blocks GROUP BY 1, 2
UNION ALL
SELECT 'products.tags', jsonb_typeof(tags::jsonb), count(*) FROM products GROUP BY 1, 2
UNION ALL
SELECT 'products.images', jsonb_typeof(images::jsonb), count(*) FROM products GROUP BY 1, 2;

COMMIT;
