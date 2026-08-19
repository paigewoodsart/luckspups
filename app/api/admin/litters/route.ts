import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Litter name is required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: created, error } = await supabase
    .from("litters")
    .insert({ name })
    .select("id, name")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create litter" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, id: created.id, name: created.name });
}
