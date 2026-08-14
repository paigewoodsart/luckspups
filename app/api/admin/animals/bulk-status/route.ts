import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    updates?: { id: string; status: string }[];
  } | null;

  const updates = body?.updates ?? [];
  if (updates.length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const supabase = createServerClient();

  for (const { id, status } of updates) {
    const { error } = await supabase
      .from("animals")
      .update({ animal_status: status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const { id } of updates) revalidateAnimalPages(id);

  return NextResponse.json({ success: true });
}
