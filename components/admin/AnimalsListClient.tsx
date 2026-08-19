"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Animal } from "@/types/animal";
import { Dropdown } from "@/components/Dropdown";
import { CreateLitterModal } from "@/components/admin/CreateLitterModal";
import type { LitterOption } from "@/lib/data/litters";
import { statusLabel, sortStatusesByLabel } from "@/lib/status";

const CREATE_LITTER_VALUE = "__create__";
const ADD_TO_LITTER_PLACEHOLDER = "";

export function AnimalsListClient({
  animals,
  litters,
}: {
  animals: Animal[];
  litters: LitterOption[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busyPriorityId, setBusyPriorityId] = useState<string | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [litterOptions, setLitterOptions] = useState<LitterOption[]>(litters);
  const [createLitterOpen, setCreateLitterOpen] = useState(false);
  const [busyBatchLitter, setBusyBatchLitter] = useState(false);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function assignSelectedToLitter(litterId: string) {
    if (selectedIds.size === 0) return;
    setBusyBatchLitter(true);
    await fetch("/api/admin/animals/bulk-litter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animalIds: [...selectedIds], litterId }),
    });
    setBusyBatchLitter(false);
    setSelectedIds(new Set());
    router.refresh();
  }

  function handleBatchLitterChange(value: string) {
    if (value === CREATE_LITTER_VALUE) {
      setCreateLitterOpen(true);
      return;
    }
    if (value) assignSelectedToLitter(value);
  }

  function handleLitterCreated(litter: LitterOption) {
    setLitterOptions((prev) => [...prev, litter]);
    setCreateLitterOpen(false);
    if (selectedIds.size > 0) assignSelectedToLitter(litter.id);
  }

  async function handleDeleteLitter(litterId: string) {
    const litter = litterOptions.find((l) => l.id === litterId);
    if (!litter) return;
    if (
      !window.confirm(
        `Delete litter "${litter.name}"? Its animals won't be deleted, just unlinked from the litter.`
      )
    ) {
      return;
    }

    await fetch(`/api/admin/litters/${litterId}`, { method: "DELETE" });
    setLitterOptions((prev) => prev.filter((l) => l.id !== litterId));
    router.refresh();
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/animals/new"
          className="rounded-full bg-sky-deep px-5 py-2.5 text-center text-sm font-semibold text-cream transition-opacity hover:opacity-90"
        >
          + Add Animal
        </Link>
        <button
          type="button"
          onClick={() => setCreateLitterOpen(true)}
          className="rounded-full border border-sky-deep px-5 py-2.5 text-center text-sm font-semibold text-sky-deep transition-colors hover:bg-sky-soft"
        >
          + Create Litter
        </button>
      </div>

      <ul className="divide-y divide-sky rounded-2xl border border-sky bg-cream-soft">
        {animals.map((animal) => (
          <li
            key={animal.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center" title={`Select ${animal.name}`}>
                <span className="sr-only">Select {animal.name}</span>
                <input
                  type="checkbox"
                  checked={selectedIds.has(animal.id)}
                  onChange={() => toggleSelect(animal.id)}
                  className="h-4 w-4 accent-sky-deep"
                />
              </label>
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
                  {animal.litter ? ` · ${animal.litter.name}` : ""}
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

      {(selectedIds.size > 0 || pending.size > 0) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brown bg-brown px-6 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.18)] sm:px-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-cream">
                  {selectedIds.size} animal{selectedIds.size === 1 ? "" : "s"} selected
                </p>
                <div className="flex items-center gap-3">
                  <Dropdown
                    options={[
                      { value: ADD_TO_LITTER_PLACEHOLDER, label: "Add to Litter" },
                      ...litterOptions.map((l) => ({ value: l.id, label: l.name, deletable: true })),
                      { value: CREATE_LITTER_VALUE, label: "+ Create new litter…" },
                    ]}
                    value={ADD_TO_LITTER_PLACEHOLDER}
                    onChange={handleBatchLitterChange}
                    onDeleteOption={handleDeleteLitter}
                    className={`w-48 ${busyBatchLitter ? "opacity-60" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm font-semibold text-cream underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {pending.size > 0 && (
              <div className="flex items-center justify-between gap-4">
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
            )}
          </div>
        </div>
      )}

      {saved && (
        <p className="mt-4 text-center text-sm font-semibold text-brown-soft">
          Statuses updated.
        </p>
      )}

      <CreateLitterModal
        open={createLitterOpen}
        onClose={() => setCreateLitterOpen(false)}
        onCreated={handleLitterCreated}
      />
    </div>
  );
}
