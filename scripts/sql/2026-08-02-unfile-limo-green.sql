-- Take "Limo Green" out of the Bi Cầu bracket range.
--
-- It is a Vinfast bike, but its generation pointed at "SH2026" under the model
-- "Pat Inox" (brand "Phụ Kiện Bi Cầu"), so the new category menu would have
-- listed a motorbike under Linh Kiện.
--
-- Vinfast is not being sold yet, so it is unfiled rather than moved: clearing
-- the generation leaves it off the menu while keeping it visible on /shop,
-- which is exactly how "Cột D VinFast VF3" already behaves.
--
-- To undo: set generation_id back to 'xh50o1cmufl1ykbixshy4w3u'.

-- Matched by id, not slug: the slug is `led-can-limo-green`, and a first pass
-- guessing `limo-green` reported success while updating nothing.
update products
   set generation_id = null
 where id = 'uyn467mb1mq0kvazokqsxzwv'
   and generation_id = 'xh50o1cmufl1ykbixshy4w3u';
