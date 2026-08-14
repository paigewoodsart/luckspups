import type { Animal } from "@/types/animal";
import { statusLabel } from "@/lib/status";
import { formatDate } from "@/lib/format";

export interface AnimalField {
  label: string;
  value: string | null;
}

export function buildAnimalFields(animal: Animal): AnimalField[] {
  return [
    { label: "Status", value: statusLabel(animal.animalStatus) },
    { label: "Gender", value: animal.gender },
    { label: "Age", value: animal.estimatedAge },
    { label: "Age Group", value: animal.ageGroup },
    { label: "Birthday", value: formatDate(animal.birthday) },
    { label: "Size", value: animal.sizeGroup },
    { label: "Location", value: animal.locationStatus },
    { label: "Admission", value: animal.admissionType },
    { label: "Intake date", value: formatDate(animal.intakeDate) },
    { label: "Groups", value: animal.groups },
    { label: "Litter name", value: animal.litterName },
    { label: "Heartworm status", value: animal.heartwormStatus },
    { label: "Altered", value: animal.altered },
    { label: "Altered before arrival", value: animal.alteredBeforeArrival },
    { label: "Altered in care", value: animal.alteredInCare },
    { label: "Eye color", value: animal.eyeColor },
    { label: "Coat type", value: animal.coatType },
    { label: "Partner type", value: animal.partnerType },
    { label: "Tags", value: animal.tags },
    { label: "Shelter ID", value: animal.externalId || null },
    { label: "Notes", value: animal.intakeNote },
    { label: "Story", value: animal.story },
  ];
}
