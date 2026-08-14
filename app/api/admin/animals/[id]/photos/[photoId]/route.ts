import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";

function storageKeyFromUrl(url: string): string | null {
  const marker = "/animal-photos/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/animals/[id]/photos/[photoId]">
) {
  const { id: animalId, photoId } = await ctx.params;
  const supabase = createServerClient();

  const { data: photo, error: fetchError } = await supabase
    .from("animal_photos")
    .select("id, storage_path, is_primary")
    .eq("id", photoId)
    .single();
  if (fetchError || !photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("animal_photos").delete().eq("id", photoId);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const key = storageKeyFromUrl(photo.storage_path);
  if (key) await supabase.storage.from("animal-photos").remove([key]);

  if (photo.is_primary) {
    const { data: remaining } = await supabase
      .from("animal_photos")
      .select("id")
      .eq("animal_id", animalId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (remaining) {
      await supabase.from("animal_photos").update({ is_primary: true }).eq("id", remaining.id);
    }
  }

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/animals/[id]/photos/[photoId]">
) {
  const { id: animalId, photoId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action !== "set-primary") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error: clearError } = await supabase
    .from("animal_photos")
    .update({ is_primary: false })
    .eq("animal_id", animalId);
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 500 });

  const { error: setError } = await supabase
    .from("animal_photos")
    .update({ is_primary: true })
    .eq("id", photoId);
  if (setError) return NextResponse.json({ error: setError.message }, { status: 500 });

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}
