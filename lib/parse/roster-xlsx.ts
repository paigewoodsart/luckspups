import * as XLSX from "xlsx";

// Maps an "Animals in Care" export column header to our field name.
// Matched case-insensitively so minor header variations don't break the
// upload. Works with either Shelterluv's or AnimalsFirst's export, since
// both produce the same column layout for this report. An optional "Photo
// URL" column is included in anticipation of a future API-based export
// that includes photo links -- present-day exports simply won't have it,
// and rows parse the same either way.
const COLUMN_MAP: Record<string, string> = {
  id: "externalId",
  name: "name",
  "animal status": "animalStatus",
  species: "species",
  "location status": "locationStatus",
  admission: "admissionType",
  "intake date": "intakeDate",
  groups: "groups",
  "heartworm status": "heartwormStatus",
  gender: "gender",
  altered: "altered",
  "altered before arrival": "alteredBeforeArrival",
  "altered in care": "alteredInCare",
  "litter name": "litterName",
  birthday: "birthday",
  "estimated age": "estimatedAge",
  "age group": "ageGroup",
  "size group": "sizeGroup",
  breed: "breed",
  "secondary breed": "secondaryBreed",
  "eye color": "eyeColor",
  "coat type": "coatType",
  "intake note": "intakeNote",
  "partner type": "partnerType",
  tags: "tags",
  "photo url": "photoUrl",
};

export interface ParsedRow {
  externalId: string | null;
  name: string;
  animalStatus: string;
  species: string;
  locationStatus: string | null;
  admissionType: string | null;
  intakeDate: string | null; // ISO date
  groups: string | null;
  heartwormStatus: string | null;
  gender: string | null;
  altered: string | null;
  alteredBeforeArrival: string | null;
  alteredInCare: string | null;
  litterName: string | null;
  birthday: string | null; // ISO date
  estimatedAge: string | null;
  ageGroup: string | null;
  sizeGroup: string | null;
  breed: string | null;
  secondaryBreed: string | null;
  eyeColor: string | null;
  coatType: string | null;
  intakeNote: string | null;
  partnerType: string | null;
  tags: string | null;
  photoUrl: string | null;
}

function cleanValue(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s === "-" ? null : s;
}

function toIsoDate(v: string | null): string | null {
  if (!v) return null;
  // Both source systems export dates as MM/DD/YYYY.
  const match = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function parseRosterWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  return rows.map((row) => {
    const mapped: Record<string, string | null> = {};

    for (const [rawHeader, value] of Object.entries(row)) {
      const key = COLUMN_MAP[rawHeader.trim().toLowerCase()];
      if (key) mapped[key] = cleanValue(value);
    }

    return {
      externalId: mapped.externalId ?? null,
      name: mapped.name ?? "",
      animalStatus: mapped.animalStatus ?? "",
      species: mapped.species ?? "",
      locationStatus: mapped.locationStatus ?? null,
      admissionType: mapped.admissionType ?? null,
      intakeDate: toIsoDate(mapped.intakeDate ?? null),
      groups: mapped.groups ?? null,
      heartwormStatus: mapped.heartwormStatus ?? null,
      gender: mapped.gender ?? null,
      altered: mapped.altered ?? null,
      alteredBeforeArrival: mapped.alteredBeforeArrival ?? null,
      alteredInCare: mapped.alteredInCare ?? null,
      litterName: mapped.litterName ?? null,
      birthday: toIsoDate(mapped.birthday ?? null),
      estimatedAge: mapped.estimatedAge ?? null,
      ageGroup: mapped.ageGroup ?? null,
      sizeGroup: mapped.sizeGroup ?? null,
      breed: mapped.breed ?? null,
      secondaryBreed: mapped.secondaryBreed ?? null,
      eyeColor: mapped.eyeColor ?? null,
      coatType: mapped.coatType ?? null,
      intakeNote: mapped.intakeNote ?? null,
      partnerType: mapped.partnerType ?? null,
      tags: mapped.tags ?? null,
      photoUrl: mapped.photoUrl ?? null,
    };
  });
}
