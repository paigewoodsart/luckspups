import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { AnimalCreateForm } from "@/components/admin/AnimalCreateForm";

export default function AdminAnimalCreatePage() {
  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Add Animal" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Manage Animals", href: "/admin/animals" },
            { label: "Add Animal" },
          ]}
        />
        <p className="mb-8 text-brown-soft">
          Hand-enter an animal that didn&rsquo;t come from a roster upload &mdash; e.g. one
          from a different partner rescue.
        </p>
        <AnimalCreateForm />
      </main>
    </div>
  );
}
