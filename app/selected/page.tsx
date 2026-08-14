"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Animal } from "@/types/animal";
import { getAnimalsByIds } from "@/lib/data/animals";
import { useSelection } from "@/lib/useSelection";
import { AnimalGrid } from "@/components/public/AnimalGrid";
import { buildEmailListText } from "@/lib/export/text-list";
import { buildRecordsPdf } from "@/lib/export/photo-pdf";
import { RESCUE_CONTACT_EMAIL } from "@/lib/config";

export default function SelectedPage() {
  const { selectedIds, toggle, clear, hydrated } = useSelection();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "generating">("idle");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await getAnimalsByIds([...selectedIds]);
      if (!cancelled) {
        setAnimals(result);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [hydrated, selectedIds]);

  async function handleCopy() {
    await navigator.clipboard.writeText(buildEmailListText(animals));
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 2000);
  }

  function handleDownloadText() {
    const blob = new Blob([buildEmailListText(animals)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lucks-pups-transport-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPdf() {
    setPdfStatus("generating");
    try {
      const doc = await buildRecordsPdf(animals);
      doc.save("lucks-pups-transport-list.pdf");
    } finally {
      setPdfStatus("idle");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-sky bg-sky-soft px-6 py-10 text-center sm:px-10">
        <h1 className="font-display uppercase tracking-wide text-5xl text-sky-deep sm:text-6xl">
          Your Transport List
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-brown-soft">
          Review your selected animals below, then export a list to send us or
          download a copy with photos for your own records.
        </p>
        <p className="mt-3">
          <Link href="/" className="text-sm font-semibold text-sky-deep underline">
            ← Back to full roster
          </Link>
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-10">
        {loading ? (
          <p className="py-16 text-center text-brown-soft">Loading your selection…</p>
        ) : animals.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-3xl text-brown-soft">Nothing selected yet</p>
            <p className="mt-3 text-brown-soft">
              Head back to the roster and check off the animals you&rsquo;d like to
              take.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-sky bg-cream-soft p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-brown">
                  {animals.length} animal{animals.length === 1 ? "" : "s"} selected
                </p>
                <p className="text-sm text-brown-soft">
                  Send the email list to{" "}
                  <span className="font-semibold text-sky-deep">
                    {RESCUE_CONTACT_EMAIL}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full bg-sky-deep px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
                >
                  {copyStatus === "copied" ? "Copied!" : "Copy list for email"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="rounded-full border border-sky-deep px-4 py-2 text-sm font-semibold text-sky-deep transition-colors hover:bg-sky-soft"
                >
                  Download .txt
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={pdfStatus === "generating"}
                  className="rounded-full border border-sky-deep px-4 py-2 text-sm font-semibold text-sky-deep transition-colors hover:bg-sky-soft disabled:opacity-60"
                >
                  {pdfStatus === "generating"
                    ? "Generating…"
                    : "Download for your records (PDF)"}
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-brown-soft underline"
                >
                  Clear all
                </button>
              </div>
            </div>

            <AnimalGrid animals={animals} selectedIds={selectedIds} onToggleSelect={toggle} />
          </>
        )}
      </main>
    </div>
  );
}
