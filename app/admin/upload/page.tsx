"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Upload failed");
      setUploading(false);
      return;
    }

    router.push(`/admin/review/${body.uploadId}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Upload new data" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Upload New Data" }]} />
        <p className="text-brown-soft">
          Upload an &ldquo;Animals in Care&rdquo; export (.xlsx) from Shelterluv or
          AnimalsFirst. Each row gets checked against existing animals before
          anything goes live &mdash; you&rsquo;ll review and confirm on the next
          screen.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="file"
            accept=".xlsx"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-sky bg-cream-soft px-3 py-2 text-brown file:mr-4 file:rounded-full file:border-0 file:bg-sky-deep file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
          />

          {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={!file || uploading}
            className="rounded-full bg-sky-deep px-5 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? "Processing…" : "Upload and screen for duplicates"}
          </button>
        </form>
      </main>
    </div>
  );
}
