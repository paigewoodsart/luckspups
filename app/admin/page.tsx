import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminDashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Dashboard" />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-6 py-10 sm:px-10">
        <Link
          href="/admin/upload"
          className="block rounded-2xl border border-sky bg-cream-soft p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="font-display uppercase tracking-wide text-2xl text-sky-deep">
            Upload new data
          </h2>
          <p className="mt-2 text-brown-soft">
            Upload an Animals in Care export (.xlsx) from AnimalsFirst to add
            or update animals. New uploads are screened for duplicates before
            anything goes live.
          </p>
        </Link>

        <Link
          href="/admin/animals"
          className="block rounded-2xl border border-sky bg-cream-soft p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="font-display uppercase tracking-wide text-2xl text-sky-deep">
            Manage animals
          </h2>
          <p className="mt-2 text-brown-soft">
            Add a photo or write a story for any animal &mdash; these live only
            on the site and are never overwritten by a data upload.
          </p>
        </Link>
      </main>
    </div>
  );
}
