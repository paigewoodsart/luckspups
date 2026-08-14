import type { Animal } from "@/types/animal";
import { RESCUE_CONTACT_EMAIL } from "@/lib/config";
import { buildAnimalFields } from "@/lib/export/animal-fields";

export function buildEmailListText(animals: Animal[]): string {
  const lines: string[] = [];
  lines.push(
    `Luck's Pups - Transport Request (${animals.length} animal${animals.length === 1 ? "" : "s"})`
  );
  lines.push(`Send to: ${RESCUE_CONTACT_EMAIL}`);
  lines.push("");

  animals.forEach((animal, i) => {
    const breedLine = [animal.breed, animal.secondaryBreed].filter(Boolean).join(" / ");
    lines.push(`${i + 1}. ${animal.name} - ${animal.species}${breedLine ? `, ${breedLine}` : ""}`);

    buildAnimalFields(animal).forEach(({ label, value }) => {
      if (value) lines.push(`   ${label}: ${value}`);
    });

    lines.push("");
  });

  return lines.join("\n").trimEnd();
}
