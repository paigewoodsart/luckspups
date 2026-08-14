import type { Animal } from "@/types/animal";

export interface LitterGroup {
  key: string;
  animals: Animal[];
}

export interface LitterGrouping {
  litters: LitterGroup[];
  individual: Animal[];
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

/**
 * Shelterluv's "Groups"/"Litter Name" fields are filled in by hand and
 * occasionally rope in unrelated animals (e.g. strays found together and
 * given the same estimated birthdate, but not actually littermates). A real
 * litter shares both a birthday and a breed, so both are used as a
 * cross-check: within a named group, only animals matching the group's most
 * common birthday AND most common breed are kept together -- e.g. "Murphy
 * Crew" mixes a Cattle Dog and a Chihuahua under one shared estimated
 * birthdate, so despite the matching date it correctly falls apart into
 * individual animals rather than a false litter.
 */
export function groupByLitter(animals: Animal[]): LitterGrouping {
  const buckets = new Map<string, Animal[]>();
  const individual: Animal[] = [];

  for (const animal of animals) {
    const key = animal.groups || animal.litterName;
    if (!key) {
      individual.push(animal);
      continue;
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(animal);
  }

  const litters: LitterGroup[] = [];

  for (const [key, members] of buckets) {
    const modeBirthday = mostCommon(members.map((a) => a.birthday));
    const modeBreed = mostCommon(members.map((a) => a.breed));

    const matching = members.filter(
      (a) =>
        (!modeBirthday || a.birthday === modeBirthday) &&
        (!modeBreed || a.breed === modeBreed)
    );
    const mismatched = members.filter((a) => !matching.includes(a));

    if (matching.length >= 2) {
      litters.push({ key, animals: matching });
      individual.push(...mismatched);
    } else {
      individual.push(...members);
    }
  }

  litters.sort((a, b) => b.animals.length - a.animals.length);
  return { litters, individual };
}
