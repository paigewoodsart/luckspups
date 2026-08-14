import { revalidatePath } from "next/cache";

// Every place animal data (or its photos) can appear -- call this after any
// write so those pages drop their cached version instead of showing stale
// data until they'd naturally revalidate on their own.
export function revalidateAnimalPages(animalId: string) {
  revalidatePath("/admin/animals");
  revalidatePath(`/admin/animals/${animalId}`);
  revalidatePath("/");
  revalidatePath("/selected");
}
