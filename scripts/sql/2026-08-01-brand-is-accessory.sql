-- Split `brands` into vehicle makes and accessory ranges.
--
-- Until now nothing in the schema told the two apart: "Đồ Đúc" and "Phụ Kiện
-- Bi Cầu" sat alongside Honda and Vinfast as peers, so the storefront menu had
-- no way to group them into a single "Phụ Kiện" column.
--
-- A flag rather than a merge: the two accessory brands stay separate rows, so
-- the admin keeps the distinction and can add a third accessory range later by
-- ticking a box instead of shipping code.

alter table brands
  add column if not exists is_accessory boolean not null default false;

update brands
   set is_accessory = true
 where id in (
   'rl649oxwp9tydcg55job0n06',  -- Phụ Kiện Bi Cầu
   'dsc12f8gklwj0pksf18awwjg'   -- Đồ Đúc
 );
