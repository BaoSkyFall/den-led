export const dynamic = "force-dynamic";
// `dynamic` alone does not opt the handler's fetches out of the Next Data
// Cache — see `lib/supabase/rest.ts`.
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { liveJson, PUBLIC_ERROR } from "@/lib/liveJson";
import { createLiveRestClient } from "@/lib/supabase/rest";

/** Suggestions shown under the header search box. */
const LIMIT = 8;

/**
 * Type-ahead for the header search.
 *
 * Deliberately narrow: id, name, slug and the brand, which is all a suggestion
 * row draws. The full result set lives on /shop, and the box sends anyone
 * pressing Enter straight there, so this never needs to paginate.
 *
 * Matches vehicles and accessories alike — they are all rows in `products`,
 * and a customer typing "pat inox" should find it as readily as "SH 2026".
 */
export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q")?.trim();
  if (!term) return liveJson([]);

  try {
    const supabase = createLiveRestClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id, name, slug,
        generations:generation_id(models:model_id(brands:brand_id(label, is_accessory)))
      `,
      )
      .eq("status", "active")
      // Escape the LIKE wildcards so a customer typing "%" searches for "%".
      .ilike("name", `%${term.replace(/[%_]/g, "\\$&")}%`)
      .order("created_at", { ascending: false })
      .limit(LIMIT);

    if (error) {
      console.error("[/api/products/search] Supabase error:", error);
      return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
    }

    return liveJson(
      (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brandLabel: p.generations?.models?.brands?.label ?? null,
        isAccessory: Boolean(p.generations?.models?.brands?.is_accessory),
      })),
    );
  } catch (err) {
    console.error("[/api/products/search] Unexpected error:", err);
    return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
  }
}
