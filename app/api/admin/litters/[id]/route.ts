import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/litters/[id]">) {
  const { id: litterId } = await ctx.params;
  const supabase = createServerClient();

  // litter_id is ON DELETE SET NULL, so this just unlinks the litter's
  // animals rather than deleting them.
  const { error } = await supabase.from("litters").delete().eq("id", litterId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/admin/animals");
  revalidatePath("/");
  revalidatePath("/selected");
  return NextResponse.json({ success: true });
}
