export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/lib/supabase/db";
import { variantGroups, variantOptions } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  const groups = await db
    .select()
    .from(variantGroups)
    .where(eq(variantGroups.productId, params.productId))
    .orderBy(variantGroups.displayOrder);

  const groupsWithOptions = await Promise.all(
    groups.map(async (group) => {
      const options = await db
        .select()
        .from(variantOptions)
        .where(eq(variantOptions.groupId, group.id))
        .orderBy(variantOptions.displayOrder);
      return { ...group, options };
    }),
  );

  return NextResponse.json(groupsWithOptions);
}
