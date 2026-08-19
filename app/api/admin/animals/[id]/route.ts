import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";
import { saveStoryAndPhotos } from "@/lib/animal-story-photos";
import { storageKeyFromUrl } from "@/lib/storage-keys";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/animals/[id]">) {
  const { id: animalId } = await ctx.params;
  const formData = await request.formData();
  const supabase = createServerClient();

  const { error } = await saveStoryAndPhotos(supabase, animalId, formData);
  if (error) return NextResponse.json({ error }, { status: 500 });

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/animals/[id]">) {
  const { id: animalId } = await ctx.params;
  const supabase = createServerClient();

  const { data: animal, error: fetchError } = await supabase
    .from("animals")
    .select("id")
    .eq("id", animalId)
    .single();
  if (fetchError || !animal) {
    return NextResponse.json({ error: "Animal not found" }, { status: 404 });
  }

  const { data: photos } = await supabase
    .from("animal_photos")
    .select("storage_path")
    .eq("animal_id", animalId);

  const { error: deleteError } = await supabase.from("animals").delete().eq("id", animalId);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const keys = (photos ?? [])
    .map((p) => storageKeyFromUrl(p.storage_path))
    .filter((k): k is string => k !== null);
  if (keys.length > 0) await supabase.storage.from("animal-photos").remove(keys);

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}
