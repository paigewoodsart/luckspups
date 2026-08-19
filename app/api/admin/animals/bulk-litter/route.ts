import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    animalIds?: string[];
    litterId?: string;
  } | null;

  const animalIds = body?.animalIds ?? [];
  const litterId = body?.litterId;
  if (!litterId || animalIds.length === 0) {
    return NextResponse.json({ error: "animalIds and litterId are required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("animals")
    .update({ litter_id: litterId, updated_at: new Date().toISOString() })
    .in("id", animalIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const id of animalIds) revalidateAnimalPages(id);

  return NextResponse.json({ success: true });
}
