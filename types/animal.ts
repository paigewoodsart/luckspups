export type AnimalStatus =
  | "Transport Approved"
  | "Status Pending"
  | "Available"
  | "Foster To Adopt"
  | "Socialization Hold";

export interface Animal {
  id: string;
  externalId: string;
  name: string;
  animalStatus: AnimalStatus | string;
  species: string;
  locationStatus: string | null;
  admissionType: string | null;
  intakeDate: string | null;
  groups: string | null;
  heartwormStatus: string | null;
  gender: string | null;
  altered: string | null;
  alteredBeforeArrival: string | null;
  alteredInCare: string | null;
  litterName: string | null;
  birthday: string | null;
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
  photos: AnimalPhoto[];
  story: string | null;
  priority: boolean;
}

export interface AnimalPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
}
