import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { getAnimals } from "@/lib/data/animals";
import { findLegacyLitterCandidates } from "@/lib/litters";

interface StagedAnimalRow {
  id: string;
  upload_id: string;
  external_id: string | null;
  name: string;
  animal_status: string;
  species: string;
  location_status: string | null;
  admission_type: string | null;
  intake_date: string | null;
  groups: string | null;
  heartworm_status: string | null;
  gender: string | null;
  altered: string | null;
  altered_before_arrival: string | null;
  altered_in_care: string | null;
  litter_name: string | null;
  birthday: string | null;
  estimated_age: string | null;
  age_group: string | null;
  size_group: string | null;
  breed: string | null;
  secondary_breed: string | null;
  eye_color: string | null;
  coat_type: string | null;
  intake_note: string | null;
  partner_type: string | null;
  tags: string | null;
  match_status: string;
  matched_animal_id: string | null;
}

function animalFields(row: StagedAnimalRow) {
  return {
    external_id: row.external_id,
    name: row.name,
    animal_status: row.animal_status,
    species: row.species,
    location_status: row.location_status,
    admission_type: row.admission_type,
    intake_date: row.intake_date,
    groups: row.groups,
    heartworm_status: row.heartworm_status,
    gender: row.gender,
    altered: row.altered,
    altered_before_arrival: row.altered_before_arrival,
    altered_in_care: row.altered_in_care,
    litter_name: row.litter_name,
    birthday: row.birthday,
    estimated_age: row.estimated_age,
    age_group: row.age_group,
    size_group: row.size_group,
    breed: row.breed,
    secondary_breed: row.secondary_breed,
    eye_color: row.eye_color,
    coat_type: row.coat_type,
    intake_note: row.intake_note,
    partner_type: row.partner_type,
    tags: row.tags,
  };
}

async function attachPhoto(
  supabase: ReturnType<typeof createServerClient>,
  animalId: string,
  stagedAnimalId: string
) {
  const { data: stagedPhoto } = await supabase
    .from("staged_animal_photos")
    .select("storage_path")
    .eq("staged_animal_id", stagedAnimalId)
    .limit(1)
    .maybeSingle();

  if (!stagedPhoto?.storage_path) return;

  try {
    const res = await fetch(stagedPhoto.storage_path);
    if (!res.ok) return;
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] ?? "jpg";
    const path = `${animalId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("animal-photos")
      .upload(path, blob, { contentType: blob.type, upsert: true });
    if (uploadError) return;

    const {
      data: { publicUrl },
    } = supabase.storage.from("animal-photos").getPublicUrl(path);

    const { data: photoRow } = await supabase
      .from("animal_photos")
      .insert({
        animal_id: animalId,
        storage_path: publicUrl,
        is_primary: true,
      })
      .select("id")
      .single();

    if (photoRow) {
      await supabase.from("animals").update({ primary_photo_id: photoRow.id }).eq("id", animalId);
    }
  } catch {
    // Photo fetch/upload failures shouldn't block publishing the animal
    // record itself -- it can be retried or added manually later.
  }
}

// After publish, animals sharing a Groups/Litter Name value that also pass
// the usual birthday/breed matching (lib/litters.ts) get promoted from a
// text match into a real litters row -- so the litter shows up in the
// admin's litter picker, and a littermate the heuristic excluded (a
// mismatched birthday/breed) can be added to it there by hand. Matched by
// source_group_key rather than name, so this can never fold into an
// unrelated litter an admin happened to name the same thing.
async function syncLegacyLittersToTable(supabase: ReturnType<typeof createServerClient>) {
  const { animals } = await getAnimals();

  for (const { key, matching } of findLegacyLitterCandidates(animals)) {
    if (matching.length < 2) continue;

    const { data: existing } = await supabase
      .from("litters")
      .select("id")
      .eq("source_group_key", key)
      .maybeSingle();

    let litterId = existing?.id as string | undefined;

    if (!litterId) {
      const { data: created, error } = await supabase
        .from("litters")
        .insert({ name: key, source_group_key: key })
        .select("id")
        .single();
      if (error || !created) continue;
      litterId = created.id;
    }

    await supabase
      .from("animals")
      .update({ litter_id: litterId })
      .in(
        "id",
        matching.map((a) => a.id)
      );
  }
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/uploads/[id]/publish">
) {
  const { id: uploadId } = await ctx.params;
  const body = (await request.json()) as { resolutions: Record<string, "new" | "update"> };

  const supabase = createServerClient();

  const { data: staged, error: stagedError } = await supabase
    .from("staged_animals")
    .select("*")
    .eq("upload_id", uploadId);

  if (stagedError) {
    return NextResponse.json({ error: stagedError.message }, { status: 500 });
  }

  for (const row of (staged ?? []) as StagedAnimalRow[]) {
    const resolution = body.resolutions[row.id] ?? (row.match_status === "update" ? "update" : "new");

    if (resolution === "update" && row.matched_animal_id) {
      await supabase
        .from("animals")
        .update({
          ...animalFields(row),
          last_seen_upload_id: uploadId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.matched_animal_id);

      await supabase.from("animal_upload_history").insert({
        animal_id: row.matched_animal_id,
        upload_id: uploadId,
        action: "updated",
      });

      await attachPhoto(supabase, row.matched_animal_id, row.id);
    } else {
      const { data: created, error: createError } = await supabase
        .from("animals")
        .insert({ ...animalFields(row), last_seen_upload_id: uploadId })
        .select("id")
        .single();

      if (!createError && created) {
        await supabase.from("animal_upload_history").insert({
          animal_id: created.id,
          upload_id: uploadId,
          action: "created",
        });

        await attachPhoto(supabase, created.id, row.id);
      }
    }
  }

  await supabase.from("uploads").update({ status: "published" }).eq("id", uploadId);

  await syncLegacyLittersToTable(supabase);

  // Same cache-busting as the animal editor: without this, the public
  // roster and admin animals list can keep showing pre-publish data until
  // they'd naturally revalidate on their own.
  revalidatePath("/");
  revalidatePath("/selected");
  revalidatePath("/admin/animals");

  return NextResponse.json({ success: true });
}
