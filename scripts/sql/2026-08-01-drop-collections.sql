-- Removes the Collections feature at the database level.
--
-- Backup was taken first and lives in 2026-08-01-backup-collections.sql — it
-- holds the collection rows plus the products.collection_id mapping, so the
-- feature can be reconstructed if it is ever wanted back.
--
-- Order matters: the FK on products has to go before the table it points at.

BEGIN;

SELECT 'before' AS phase,
       (SELECT count(*) FROM collections) AS collections,
       (SELECT count(*) FROM products WHERE collection_id IS NOT NULL) AS linked_products;

ALTER TABLE products DROP COLUMN IF EXISTS collection_id;

DROP TABLE IF EXISTS collections;

SELECT 'after' AS phase,
       (SELECT count(*) FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'collections') AS collections_table,
       (SELECT count(*) FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'products'
          AND column_name = 'collection_id') AS collection_id_column;

COMMIT;
