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

BEGIN;

SELECT jsonb_typeof(data) AS shape, count(*)
FROM section_blocks
GROUP BY 1;

UPDATE section_blocks
SET data = (data #>> '{}')::jsonb
WHERE jsonb_typeof(data) = 'string';

-- Expect a single row: object | <total>
SELECT jsonb_typeof(data) AS shape, count(*)
FROM section_blocks
GROUP BY 1;

COMMIT;
