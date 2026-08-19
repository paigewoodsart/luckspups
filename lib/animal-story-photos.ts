import { createServerClient } from "@/lib/supabase-server";

// Shared by the animal edit route and the create route -- saves a story
// and/or uploads staged photos for an animal that already has a row in
// the DB. The "first photo becomes primary" check below already does the
// right thing for a brand-new animal (zero existing photos), so this
// works unmodified for both callers.
export async function saveStoryAndPhotos(
  supabase: ReturnType<typeof createServerClient>,
  animalId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const story = formData.get("story");
  const photos = formData
    .getAll("photos")
    .filter((p): p is File => p instanceof File && p.size > 0);

  if (typeof story === "string") {
    const { error } = await supabase
      .from("animals")
      .update({ story: story.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", animalId);
    if (error) return { error: error.message };
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
      if (uploadError) return { error: uploadError.message };

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
      if (insertError) return { error: insertError.message };
    }
  }

  return {};
}
