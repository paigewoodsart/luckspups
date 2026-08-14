import type { Animal } from "@/types/animal";
import { RESCUE_CONTACT_EMAIL } from "@/lib/config";

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

    const details = [animal.gender, animal.estimatedAge, animal.sizeGroup]
      .filter(Boolean)
      .join(" · ");
    if (details) lines.push(`   ${details}`);

    lines.push(`   Status: ${animal.animalStatus}`);
    if (animal.intakeNote) lines.push(`   Note: ${animal.intakeNote}`);
    if (animal.tags) lines.push(`   Tags: ${animal.tags}`);
    lines.push("");
  });

  return lines.join("\n").trimEnd();
}
