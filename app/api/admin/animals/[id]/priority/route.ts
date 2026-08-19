import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/animals/[id]/priority">
) {
  const { id: animalId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { priority?: boolean };

  if (typeof body.priority !== "boolean") {
    return NextResponse.json({ error: "priority must be a boolean" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("animals")
    .update({ priority: body.priority, updated_at: new Date().toISOString() })
    .eq("id", animalId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}
