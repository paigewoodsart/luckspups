import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { getAnimals } from "@/lib/data/animals";

export default async function AdminAnimalsPage() {
  const { animals } = await getAnimals();

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Manage Animals" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Manage Animals" }]} />
        <p className="mb-6 text-brown-soft">
          Add a photo or write a story for any animal. These live only on the
          site &mdash; they&rsquo;re never overwritten by a data upload.
        </p>

        <ul className="divide-y divide-sky rounded-2xl border border-sky bg-cream-soft">
          {animals.map((animal) => (
            <li key={animal.id}>
              <Link
                href={`/admin/animals/${animal.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-sky-soft"
              >
                <div>
                  <p className="font-display uppercase tracking-wide text-brown">
                    {animal.name}
                  </p>
                  <p className="text-sm text-brown-soft">
                    {animal.species}
                    {animal.breed ? ` · ${animal.breed}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-brown-soft">
                  {animal.photoUrl && (
                    <span className="rounded-full bg-status-available px-2 py-0.5 text-xs font-semibold text-brown">
                      Has photo
                    </span>
                  )}
                  {animal.story && (
                    <span className="rounded-full bg-sky px-2 py-0.5 text-xs font-semibold text-brown">
                      Has story
                    </span>
                  )}
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
