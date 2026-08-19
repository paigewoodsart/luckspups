import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { AnimalEditForm } from "@/components/admin/AnimalEditForm";
import { getAnimalsByIds } from "@/lib/data/animals";
import { getLitters } from "@/lib/data/litters";

export default async function AdminAnimalEditPage({
  params,
}: PageProps<"/admin/animals/[id]">) {
  const { id } = await params;
  const [[animal], litters] = await Promise.all([getAnimalsByIds([id]), getLitters()]);

  if (!animal) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title={`Edit: ${animal.name}`} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Manage Animals", href: "/admin/animals" },
            { label: animal.name },
          ]}
        />
        <p className="mb-8 text-brown-soft">
          {animal.species}
          {animal.breed ? ` · ${animal.breed}` : ""} &middot; {animal.animalStatus}
        </p>
        <AnimalEditForm animal={animal} litters={litters} />
      </main>
    </div>
  );
}
