import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getAnimals } from "@/lib/data/animals";
import { parseRosterWorkbook } from "@/lib/parse/roster-xlsx";
import { matchAnimal } from "@/lib/dedup/match";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const rows = parseRosterWorkbook(buffer).filter((r) => r.name && r.species);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid animal rows found in that file" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const storagePath = `${Date.now()}-${file.name}`;
  const { error: storageError } = await supabase.storage
    .from("data-uploads")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
    });

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .insert({
      filename: file.name,
      storage_path: storagePath,
      status: "needs_review",
      page_count: rows.length,
    })
    .select()
    .single();

  if (uploadError || !upload) {
    return NextResponse.json(
      { error: uploadError?.message ?? "Failed to create upload record" },
      { status: 500 }
    );
  }

  const { animals: existingAnimals } = await getAnimals();

  const stagedRows = rows.map((row, index) => {
    const match = matchAnimal(
      {
        externalId: row.externalId,
        name: row.name,
        species: row.species,
        breed: row.breed,
        intakeDate: row.intakeDate,
      },
      existingAnimals
    );

    return {
      upload_id: upload.id,
      page_number: index + 1,
      raw_extracted_json: row,
      external_id: row.externalId,
      name: row.name,
      animal_status: row.animalStatus,
      species: row.species,
      location_status: row.locationStatus,
      admission_type: row.admissionType,
      intake_date: row.intakeDate,
      groups: row.groups,
      heartworm_status: row.heartwormStatus,
      gender: row.gender,
      altered: row.altered,
      altered_before_arrival: row.alteredBeforeArrival,
      altered_in_care: row.alteredInCare,
      litter_name: row.litterName,
      birthday: row.birthday,
      estimated_age: row.estimatedAge,
      age_group: row.ageGroup,
      size_group: row.sizeGroup,
      breed: row.breed,
      secondary_breed: row.secondaryBreed,
      eye_color: row.eyeColor,
      coat_type: row.coatType,
      intake_note: row.intakeNote,
      partner_type: row.partnerType,
      tags: row.tags,
      match_status: match.matchStatus,
      matched_animal_id: match.matchedAnimalId,
      match_confidence: match.matchConfidence,
      match_reasons: match.matchReasons,
    };
  });

  // Photo URLs (present once uploads come from an API-based export) get
  // stashed in staged_animal_photos for the review screen to pick up --
  // not downloaded yet, that happens at publish time.
  const { data: insertedStaged, error: stagedError } = await supabase
    .from("staged_animals")
    .insert(stagedRows)
    .select("id, raw_extracted_json");

  if (stagedError) {
    return NextResponse.json({ error: stagedError.message }, { status: 500 });
  }

  const photoRows = (insertedStaged ?? [])
    .filter((s) => (s.raw_extracted_json as { photoUrl?: string | null })?.photoUrl)
    .map((s) => ({
      staged_animal_id: s.id,
      storage_path: (s.raw_extracted_json as { photoUrl: string }).photoUrl,
      source: "source_url",
      association_confidence: "high",
    }));

  if (photoRows.length > 0) {
    await supabase.from("staged_animal_photos").insert(photoRows);
  }

  return NextResponse.json({ uploadId: upload.id });
}
