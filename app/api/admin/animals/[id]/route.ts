import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/animals/[id]">) {
  const { id: animalId } = await ctx.params;
  const formData = await request.formData();
  const story = formData.get("story");
  const photo = formData.get("photo");

  const supabase = createServerClient();

  if (typeof story === "string") {
    const { error } = await supabase
      .from("animals")
      .update({ story: story.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", animalId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (photo instanceof File && photo.size > 0) {
    const ext = (photo.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const path = `${animalId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("animal-photos")
      .upload(path, photo, { contentType: photo.type, upsert: true });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const {
      data: { publicUrl },
    } = supabase.storage.from("animal-photos").getPublicUrl(path);

    const { data: photoRow, error: photoError } = await supabase
      .from("animal_photos")
      .insert({ animal_id: animalId, storage_path: publicUrl, is_primary: true })
      .select("id")
      .single();
    if (photoError) return NextResponse.json({ error: photoError.message }, { status: 500 });

    const { error: linkError } = await supabase
      .from("animals")
      .update({ primary_photo_id: photoRow.id })
      .eq("id", animalId);
    if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  // Saving here only refreshes the edit page itself by default -- explicitly
  // bust the cache for every other place this animal's data appears, so the
  // list, the public roster, and detail views pick up the change right away
  // instead of showing a stale cached version until they'd naturally revalidate.
  revalidatePath("/admin/animals");
  revalidatePath(`/admin/animals/${animalId}`);
  revalidatePath("/");
  revalidatePath("/selected");

  return NextResponse.json({ success: true });
}
