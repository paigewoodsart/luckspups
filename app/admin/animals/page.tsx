import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { AnimalsListClient } from "@/components/admin/AnimalsListClient";
import { getAnimals } from "@/lib/data/animals";
import { getLitters } from "@/lib/data/litters";

export default async function AdminAnimalsPage() {
  const [{ animals }, litters] = await Promise.all([getAnimals(), getLitters()]);

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Manage Animals" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Manage Animals" }]} />
        <p className="mb-6 text-brown-soft">
          Add a photo or write a story for any animal, or change a status right
          here and save. Photos/stories live only on the site &mdash; they&rsquo;re
          never overwritten by a data upload.
        </p>

        <AnimalsListClient animals={animals} litters={litters} />
      </main>
    </div>
  );
}
