-- Group accessory ranges so the storefront menu can offer product types.
--
-- The menu used to be a column per brand, which told a customer nothing about
-- what they were looking at: "Đồ Đúc" and "Phụ Kiện Bi Cầu" are supplier names,
-- not things anyone shops for. Grouping happens at the model level because the
-- accessory models already ARE product types — Pha Đèn, Xinhan, Đèn Hậu, Pat
-- Inox — so six rows carry the whole taxonomy instead of all 23 products.
--
-- Vehicle models stay null. "Dòng Xe" on the menu is the set of brands with
-- is_accessory = false, which needs no column of its own.

alter table models
  add column if not exists "group" text;

update models
   set "group" = 'den'
 where id in (
   's51i5qoz0t1cey0lxyqwxuw7',  -- Pha Đèn Trước Đúc Giả Zin
   'hmbnhlk9pnnythd9m97vsreh',  -- Xinhan Trước Đúc Giả Zin
   'l1q797asplxmcb7rcw5gdjia'   -- Đèn Hậu Đúc Giả Zin
 );

update models
   set "group" = 'linh-kien'
 where id in (
   'ro9jw3yxnh60yi00r8oz8xhz',  -- Pat Inox
   'g65qpdq9b36uwab55y9rcqnd',  -- Hộp In 3D
   'zqo5ftsx8nz5dt6b4qatbdp9'   -- Hộp Nhôm chống nước
 );
