"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Animal } from "@/types/animal";
import { Dropdown } from "@/components/Dropdown";
import { statusLabel, sortStatusesByLabel } from "@/lib/status";

export function AnimalsListClient({ animals }: { animals: Animal[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busyPriorityId, setBusyPriorityId] = useState<string | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);

  const statusOptions = useMemo(() => {
    const set = new Set(animals.map((a) => a.animalStatus));
    return sortStatusesByLabel([...set]).map((s) => ({ value: s, label: statusLabel(s) }));
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

  async function handleTogglePriority(animal: Animal) {
    setBusyPriorityId(animal.id);
    await fetch(`/api/admin/animals/${animal.id}/priority`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: !animal.priority }),
    });
    setBusyPriorityId(null);
    router.refresh();
  }

  async function handleDelete(animal: Animal) {
    if (!window.confirm(`Permanently delete ${animal.name}? This can't be undone.`)) return;
    setBusyDeleteId(animal.id);
    await fetch(`/api/admin/animals/${animal.id}`, { method: "DELETE" });
    setBusyDeleteId(null);
    router.refresh();
  }

  return (
    <div className="pb-20">
      <ul className="divide-y divide-sky rounded-2xl border border-sky bg-cream-soft">
        {animals.map((animal) => (
          <li
            key={animal.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTogglePriority(animal)}
                disabled={busyPriorityId === animal.id}
                aria-pressed={animal.priority}
                aria-label={
                  animal.priority ? `Unmark ${animal.name} as priority` : `Mark ${animal.name} as priority`
                }
                title={animal.priority ? "Priority — click to unmark" : "Mark as priority"}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
                  animal.priority
                    ? "bg-sky-deep text-cream"
                    : "border border-sky text-brown-soft hover:border-sky-deep"
                }`}
              >
                {animal.priority ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                    <path d="M12 2.5l2.9 6.26 6.9.9-5 4.87 1.28 6.97L12 17.9l-6.08 3.6L7.2 14.53l-5-4.87 6.9-.9L12 2.5z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2.5l2.9 6.26 6.9.9-5 4.87 1.28 6.97L12 17.9l-6.08 3.6L7.2 14.53l-5-4.87 6.9-.9L12 2.5z" />
                  </svg>
                )}
              </button>
              <Link href={`/admin/animals/${animal.id}`} className="hover:underline">
                <p className="font-display uppercase tracking-wide text-brown">{animal.name}</p>
                <p className="text-sm text-brown-soft">
                  {animal.species}
                  {animal.breed ? ` · ${animal.breed}` : ""}
                </p>
              </Link>
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
              <Dropdown
                options={statusOptions}
                value={pending.get(animal.id) ?? animal.animalStatus}
                onChange={(value) => handleStatusChange(animal, value)}
                className="w-48"
              />
              <button
                type="button"
                onClick={() => handleDelete(animal)}
                disabled={busyDeleteId === animal.id}
                aria-label={`Delete ${animal.name}`}
                title={`Delete ${animal.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-700 transition-colors hover:bg-cream disabled:opacity-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16" />
                  <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                  <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
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
