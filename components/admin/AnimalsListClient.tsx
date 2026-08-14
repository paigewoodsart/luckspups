"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Animal } from "@/types/animal";
import { Dropdown } from "@/components/Dropdown";

export function AnimalsListClient({ animals }: { animals: Animal[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const statusOptions = useMemo(() => {
    const set = new Set(animals.map((a) => a.animalStatus));
    return [...set].sort().map((s) => ({ value: s, label: s }));
  }, [animals]);

  function handleStatusChange(animal: Animal, newStatus: string) {
    setSaved(false);
    setPending((prev) => {
      const next = new Map(prev);
      if (newStatus === animal.animalStatus) next.delete(animal.id);
      else next.set(animal.id, newStatus);
      return next;
    });
  }

  async function handleSaveAll() {
    setSaving(true);
    const updates = [...pending.entries()].map(([id, status]) => ({ id, status }));

    const res = await fetch("/api/admin/animals/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving(false);
    if (res.ok) {
      setPending(new Map());
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="pb-20">
      <ul className="divide-y divide-sky rounded-2xl border border-sky bg-cream-soft">
        {animals.map((animal) => (
          <li
            key={animal.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <Link href={`/admin/animals/${animal.id}`} className="hover:underline">
              <p className="font-display uppercase tracking-wide text-brown">{animal.name}</p>
              <p className="text-sm text-brown-soft">
                {animal.species}
                {animal.breed ? ` · ${animal.breed}` : ""}
              </p>
            </Link>

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
              <Dropdown
                options={statusOptions}
                value={pending.get(animal.id) ?? animal.animalStatus}
                onChange={(value) => handleStatusChange(animal, value)}
                className="w-48"
              />
            </div>
          </li>
        ))}
      </ul>

      {pending.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brown bg-brown px-6 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.18)] sm:px-10">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className="text-sm font-semibold text-cream">
              {pending.size} status change{pending.size === 1 ? "" : "s"} pending
            </p>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="rounded-full bg-sky-deep px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {saved && (
        <p className="mt-4 text-center text-sm font-semibold text-brown-soft">
          Statuses updated.
        </p>
      )}
    </div>
  );
}
