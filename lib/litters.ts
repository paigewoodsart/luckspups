import type { Animal } from "@/types/animal";

export interface LitterGroup {
  id: string;
  name: string;
  animals: Animal[];
}

export interface LitterGrouping {
  litters: LitterGroup[];
  individual: Animal[];
}

function birthdayTimestamp(birthday: string | null): number | null {
  const time = birthday ? new Date(birthday).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
}

// Older animals have earlier birthdays, so an earlier date sorts first.
// Animals with no recorded birthday can't be placed on the scale, so they
// sort to the end rather than being guessed as youngest or oldest.
function sortOldestToYoungest<T extends { birthday: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ta = birthdayTimestamp(a.birthday);
    const tb = birthdayTimestamp(b.birthday);
    if (ta === null) return tb === null ? 0 : 1;
    if (tb === null) return -1;
    return ta - tb;
  });
}

// Priority animals float to the front, but sort is stable so everyone's
// existing relative order (oldest-to-youngest) is preserved within each
// priority group.
function bringPriorityToFront<T>(items: T[], isPriority: (item: T) => boolean): T[] {
  return [...items].sort((a, b) => Number(isPriority(b)) - Number(isPriority(a)));
}

function mostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export interface LegacyLitterCandidate {
  key: string;
  matching: Animal[];
  mismatched: Animal[];
}

/**
 * The source system's "Groups"/"Litter Name" fields are filled in by hand and
 * occasionally rope in unrelated animals (e.g. strays found together and
 * given the same estimated birthdate, but not actually littermates). A real
 * litter shares both a birthday and a breed, so both are used as a
 * cross-check: within a named group, only animals matching the group's most
 * common birthday AND most common breed are kept together -- e.g. "Murphy
 * Crew" mixes a Cattle Dog and a Chihuahua under one shared estimated
 * birthdate, so despite the matching date it correctly falls apart into
 * individual animals rather than a false litter.
 *
 * Shared between the public render path (groupByLitter, below) and the
 * upload-publish sync (which turns a passing candidate into a real litters
 * row) -- both need the exact same matching behavior. Animals that already
 * have an explicit admin-assigned litter are skipped entirely; a deliberate
 * manual grouping doesn't need this heuristic second-guessing it.
 */
export function findLegacyLitterCandidates(animals: Animal[]): LegacyLitterCandidate[] {
  const buckets = new Map<string, Animal[]>();

  for (const animal of animals) {
    if (animal.litter) continue;
    const key = animal.groups || animal.litterName;
    if (!key) continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(animal);
  }

  const candidates: LegacyLitterCandidate[] = [];

  for (const [key, members] of buckets) {
    const modeBirthday = mostCommon(members.map((a) => a.birthday));
    const modeBreed = mostCommon(members.map((a) => a.breed));

    const matching = members.filter(
      (a) =>
        (!modeBirthday || a.birthday === modeBirthday) &&
        (!modeBreed || a.breed === modeBreed)
    );
    const mismatched = members.filter((a) => !matching.includes(a));

    candidates.push({ key, matching, mismatched });
  }

  return candidates;
}

/**
 * An animal with an explicit admin-assigned litter (animal.litter) is
 * grouped by its litter id unconditionally -- no birthday/breed check, and
 * it counts as a litter even with just one member so far. Everyone else
 * goes through findLegacyLitterCandidates above.
 */
export function groupByLitter(animals: Animal[]): LitterGrouping {
  const individual: Animal[] = [];
  const litterEntries: { group: LitterGroup; birthday: string | null }[] = [];

  const explicitBuckets = new Map<string, { name: string; animals: Animal[] }>();
  const legacyCandidates: Animal[] = [];

  for (const animal of animals) {
    if (animal.litter) {
      const bucket = explicitBuckets.get(animal.litter.id);
      if (bucket) bucket.animals.push(animal);
      else explicitBuckets.set(animal.litter.id, { name: animal.litter.name, animals: [animal] });
    } else {
      legacyCandidates.push(animal);
      if (!(animal.groups || animal.litterName)) individual.push(animal);
    }
  }

  for (const [id, { name, animals: members }] of explicitBuckets) {
    litterEntries.push({
      group: { id, name, animals: members },
      birthday: mostCommon(members.map((a) => a.birthday)),
    });
  }

  for (const { key, matching, mismatched } of findLegacyLitterCandidates(legacyCandidates)) {
    if (matching.length >= 2) {
      litterEntries.push({
        group: { id: key, name: key, animals: matching },
        birthday: mostCommon(matching.map((a) => a.birthday)),
      });
      individual.push(...mismatched);
    } else {
      individual.push(...matching, ...mismatched);
    }
  }

  const litters = bringPriorityToFront(
    sortOldestToYoungest(litterEntries).map((entry) => entry.group),
    (litter) => litter.animals.some((a) => a.priority)
  );
  const sortedIndividual = bringPriorityToFront(
    sortOldestToYoungest(individual),
    (a) => a.priority
  );
  return { litters, individual: sortedIndividual };
}
