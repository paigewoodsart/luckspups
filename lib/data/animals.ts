import { supabase } from "@/lib/supabase";
import type { Animal } from "@/types/animal";

interface AnimalRow {
  id: string;
  external_id: string;
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
  primary_photo_id: string | null;
  story: string | null;
  updated_at: string;
}

function toAnimal(row: AnimalRow, photoUrl: string | null): Animal {
  return {
    id: row.id,
    externalId: row.external_id,
    name: row.name,
    animalStatus: row.animal_status,
    species: row.species,
    locationStatus: row.location_status,
    admissionType: row.admission_type,
    intakeDate: row.intake_date,
    groups: row.groups,
    heartwormStatus: row.heartworm_status,
    gender: row.gender,
    altered: row.altered,
    alteredBeforeArrival: row.altered_before_arrival,
    alteredInCare: row.altered_in_care,
    litterName: row.litter_name,
    birthday: row.birthday,
    estimatedAge: row.estimated_age,
    ageGroup: row.age_group,
    sizeGroup: row.size_group,
    breed: row.breed,
    secondaryBreed: row.secondary_breed,
    eyeColor: row.eye_color,
    coatType: row.coat_type,
    intakeNote: row.intake_note,
    partnerType: row.partner_type,
    tags: row.tags,
    photoUrl,
    story: row.story,
  };
}

async function fetchPhotoMap(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabase.from("animal_photos").select("id, storage_path").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id as string, p.storage_path as string]));
}

function attachPhotos(rows: AnimalRow[], photoMap: Map<string, string>): Animal[] {
  return rows.map((row) =>
    toAnimal(row, row.primary_photo_id ? (photoMap.get(row.primary_photo_id) ?? null) : null)
  );
}

export async function getAnimals(): Promise<{
  animals: Animal[];
  lastUpdated: string | null;
}> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as AnimalRow[];
  const photoMap = await fetchPhotoMap(
    rows.map((r) => r.primary_photo_id).filter((id): id is string => !!id)
  );
  const lastUpdated = rows.reduce<string | null>((latest, row) => {
    return !latest || row.updated_at > latest ? row.updated_at : latest;
  }, null);

  return { animals: attachPhotos(rows, photoMap), lastUpdated };
}

export async function getAnimalsByIds(ids: string[]): Promise<Animal[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("animals").select("*").in("id", ids);
  if (error) throw error;

  const rows = (data ?? []) as AnimalRow[];
  const photoMap = await fetchPhotoMap(
    rows.map((r) => r.primary_photo_id).filter((id): id is string => !!id)
  );
  return attachPhotos(rows, photoMap);
}
