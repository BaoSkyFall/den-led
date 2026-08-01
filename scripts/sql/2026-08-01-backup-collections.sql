-- Backup taken before dropping the collections feature.
-- Restore: recreate the table/column, then run these inserts and updates.
-- Taken from a live database; 1 collection row(s), 9 linked product(s).

-- collections columns: id, label, slug, title, description, order, featured_image_id

INSERT INTO collections ("id", "label", "slug", "title", "description", "order", "featured_image_id") VALUES ('col-honda-2026', 'Honda', 'honda', 'Xe máy Honda', 'Dòng xe máy Honda thế hệ 2026', '1', 'media-sh-2026');

UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'prod-sh-2026';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'w59x0s38m7o6fcymqcnv8qiq';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'cv7572sj6r0an3q7y4aatwhi';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'q2j7gmh44p43c6a32w6h0d84';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'prod-vario-2026';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'qmwegwxddh9sgn0wqufv2vkp';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'ctcywpltqr15wksil2lowpj2';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'bvr8v6qqgaueom50m12xp121';
UPDATE products SET collection_id = 'col-honda-2026' WHERE id = 'awsj6m45j5ebv8t7wbmn81c5';
