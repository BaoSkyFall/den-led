import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { brands, generations, models } from "@/lib/supabase/schema";

// `label` and `slug` are `notNull` but NOT length-constrained in Postgres, so
// drizzle-zod alone happily accepts "". These schemas are shared by the admin
// forms (resolver) and the server actions (parse) so an empty name can never be
// persisted from either side.
const nonEmpty = (message: string) => () => z.string().trim().min(1, message);

export const brandInsertSchema = createInsertSchema(brands, {
  label: nonEmpty("Vui lòng nhập tên hãng."),
  slug: nonEmpty("Vui lòng nhập slug."),
});

export const modelInsertSchema = createInsertSchema(models, {
  label: nonEmpty("Vui lòng nhập tên dòng xe."),
  slug: nonEmpty("Vui lòng nhập slug."),
});

export const generationInsertSchema = createInsertSchema(generations, {
  label: nonEmpty("Vui lòng nhập tên đời xe."),
  slug: nonEmpty("Vui lòng nhập slug."),
});
