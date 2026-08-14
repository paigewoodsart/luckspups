import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/animals/[id]">) {
  const { id: animalId } = await ctx.params;
  const formData = await request.formData();
  const story = formData.get("story");
  const photos = formData
    .getAll("photos")
    .filter((p): p is File => p instanceof File && p.size > 0);

  const supabase = createServerClient();

  if (typeof story === "string") {
    const { error } = await supabase
      .from("animals")
      .update({ story: story.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", animalId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (photos.length > 0) {
    const { count } = await supabase
      .from("animal_photos")
      .select("id", { count: "exact", head: true })
      .eq("animal_id", animalId);
    const hadExistingPhotos = (count ?? 0) > 0;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const ext = (photo.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const path = `${animalId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("animal-photos")
        .upload(path, photo, { contentType: photo.type });
      if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

      const {
        data: { publicUrl },
      } = supabase.storage.from("animal-photos").getPublicUrl(path);

      // The very first photo an animal ever gets becomes primary
      // automatically; later additions just join the gallery until the
      // admin explicitly picks a different one as primary.
      const isPrimary = !hadExistingPhotos && i === 0;
      const { error: insertError } = await supabase
        .from("animal_photos")
        .insert({ animal_id: animalId, storage_path: publicUrl, is_primary: isPrimary });
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  revalidateAnimalPages(animalId);
  return NextResponse.json({ success: true });
}
