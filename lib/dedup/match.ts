import type { Animal } from "@/types/animal";

export interface ParsedAnimalRow {
  externalId: string | null;
  name: string;
  species: string;
  breed: string | null;
  intakeDate: string | null; // ISO date (YYYY-MM-DD)
}

export type MatchStatus = "new" | "update" | "possible_duplicate";
export type MatchConfidence = "high" | "medium" | "none";

export interface MatchResult {
  matchStatus: MatchStatus;
  matchedAnimalId: string | null;
  matchConfidence: MatchConfidence;
  matchReasons: string;
}

function daysBetween(a: string, b: string): number {
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff / (1000 * 60 * 60 * 24);
}

/**
 * external_id match -> update (Shelterluv's own ID is reliable and always
 * present in practice). Otherwise fuzzy match on name+species, using
 * breed + intake-date proximity to grade confidence -- never auto-merged,
 * always surfaced for the admin to confirm on the review screen.
 */
export function matchAnimal(row: ParsedAnimalRow, existing: Animal[]): MatchResult {
  if (row.externalId) {
    const exact = existing.find((a) => a.externalId === row.externalId);
    if (exact) {
      return {
        matchStatus: "update",
        matchedAnimalId: exact.id,
        matchConfidence: "high",
        matchReasons: `Matched existing animal ID ${row.externalId}`,
      };
    }
  }

  const nameSpeciesMatch = existing.find(
    (a) =>
      a.species.toLowerCase() === row.species.toLowerCase() &&
      a.name.trim().toLowerCase() === row.name.trim().toLowerCase()
  );

  if (nameSpeciesMatch) {
    const sameBreed =
      !!row.breed &&
      !!nameSpeciesMatch.breed &&
      row.breed.toLowerCase() === nameSpeciesMatch.breed.toLowerCase();
    const closeIntake =
      !!row.intakeDate &&
      !!nameSpeciesMatch.intakeDate &&
      daysBetween(row.intakeDate, nameSpeciesMatch.intakeDate) <= 3;

    return {
      matchStatus: "possible_duplicate",
      matchedAnimalId: nameSpeciesMatch.id,
      matchConfidence: sameBreed && closeIntake ? "high" : "medium",
      matchReasons:
        sameBreed && closeIntake
          ? `Name+species+breed match, intake date within 3 days of existing "${nameSpeciesMatch.name}"`
          : `Name+species match with existing "${nameSpeciesMatch.name}" -- breed/intake date differ, please confirm`,
    };
  }

  return {
    matchStatus: "new",
    matchedAnimalId: null,
    matchConfidence: "none",
    matchReasons: "No matching external ID or name+species found",
  };
}
