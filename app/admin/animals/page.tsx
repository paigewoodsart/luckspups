import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { AnimalsListClient } from "@/components/admin/AnimalsListClient";
import { getAnimals } from "@/lib/data/animals";

export default async function AdminAnimalsPage() {
  const { animals } = await getAnimals();

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Manage Animals" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Manage Animals" }]} />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-brown-soft">
            Add a photo or write a story for any animal, or change a status right
            here and save. Photos/stories live only on the site &mdash; they&rsquo;re
            never overwritten by a data upload.
          </p>
          <Link
            href="/admin/animals/new"
            className="shrink-0 rounded-full bg-sky-deep px-5 py-2.5 text-center text-sm font-semibold text-cream transition-opacity hover:opacity-90"
          >
            + Add Animal
          </Link>
        </div>

        <AnimalsListClient animals={animals} />
      </main>
    </div>
  );
}
