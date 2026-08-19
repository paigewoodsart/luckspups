import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/animals/[id]/litter">
) {
  const { id: animalId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { litterId?: string | null };

  if (body.litterId !== null && typeof body.litterId !== "string") {
    return NextResponse.json({ error: "litterId must be a string or null" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("animals")
    .update({ litter_id: body.litterId, updated_at: new Date().toISOString() })
    .eq("id", animalId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}
