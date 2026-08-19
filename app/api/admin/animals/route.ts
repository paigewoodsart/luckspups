import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidateAnimalPages } from "@/lib/revalidate";
import { saveStoryAndPhotos } from "@/lib/animal-story-photos";

function field(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = field(formData, "name");
  const species = field(formData, "species");
  const animalStatus = field(formData, "animalStatus");

  if (!name || !species || !animalStatus) {
    return NextResponse.json(
      { error: "Name, species, and status are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data: created, error } = await supabase
    .from("animals")
    .insert({
      external_id: field(formData, "externalId") ?? `manual-${crypto.randomUUID()}`,
      name,
      species,
      animal_status: animalStatus,
      location_status: field(formData, "locationStatus"),
      admission_type: field(formData, "admissionType"),
      intake_date: field(formData, "intakeDate"),
      groups: field(formData, "groups"),
      heartworm_status: field(formData, "heartwormStatus"),
      gender: field(formData, "gender"),
      altered: field(formData, "altered"),
      altered_before_arrival: field(formData, "alteredBeforeArrival"),
      altered_in_care: field(formData, "alteredInCare"),
      litter_name: field(formData, "litterName"),
      litter_id: field(formData, "litterId"),
      birthday: field(formData, "birthday"),
      estimated_age: field(formData, "estimatedAge"),
      age_group: field(formData, "ageGroup"),
      size_group: field(formData, "sizeGroup"),
      breed: field(formData, "breed"),
      secondary_breed: field(formData, "secondaryBreed"),
      eye_color: field(formData, "eyeColor"),
      coat_type: field(formData, "coatType"),
      intake_note: field(formData, "intakeNote"),
      partner_type: field(formData, "partnerType"),
      tags: field(formData, "tags"),
      priority: formData.get("priority") === "true",
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create animal" },
      { status: 500 }
    );
  }

  const { error: storyPhotoError } = await saveStoryAndPhotos(supabase, created.id, formData);
  if (storyPhotoError) {
    return NextResponse.json({ error: storyPhotoError }, { status: 500 });
  }

  revalidateAnimalPages(created.id);
  return NextResponse.json({ success: true, id: created.id });
}
