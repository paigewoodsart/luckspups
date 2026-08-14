"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Animal } from "@/types/animal";
import type { LitterGroup } from "@/lib/litters";
import { useSelection } from "@/lib/useSelection";
import { AnimalGrid } from "./AnimalGrid";

function StatusFilterDropdown({
  statuses,
  value,
  onChange,
}: {
  statuses: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = ["all", ...statuses];
  const label = value === "all" ? "All statuses" : value;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-sky bg-cream-soft px-4 py-2 text-sm font-semibold text-brown transition-colors hover:border-sky-deep"
      >
        {label}
        <svg
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
          className={`h-2.5 w-2.5 text-sky-deep transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-lg border border-sky bg-cream-soft shadow-lg"
        >
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-sky-soft ${
                  value === opt ? "bg-sky-soft text-sky-deep" : "text-brown"
                }`}
              >
                {opt === "all" ? "All statuses" : opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SelectLitterCheckbox({
  litterAnimals,
  selectedIds,
  onToggleLitter,
}: {
  litterAnimals: Animal[];
  selectedIds: Set<string>;
  onToggleLitter: (animals: Animal[], select: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const selectedCount = litterAnimals.filter((a) => selectedIds.has(a.id)).length;
  const allSelected = selectedCount === litterAnimals.length;
  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <label className="flex cursor-pointer items-center" title="Select whole litter">
      <span className="sr-only">Select whole litter</span>
      <input
        ref={ref}
        type="checkbox"
        checked={allSelected}
        onChange={() => onToggleLitter(litterAnimals, !allSelected)}
        className="h-7 w-7 accent-sky-deep"
      />
    </label>
  );
}

export function AnimalBrowser({
  litters,
  individual,
}: {
  litters: LitterGroup[];
  individual: Animal[];
}) {
  const { selectedIds, toggle, toggleMany, clear } = useSelection();
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = useMemo(() => {
    const set = new Set<string>();
    litters.forEach((l) => l.animals.forEach((a) => set.add(a.animalStatus)));
    individual.forEach((a) => set.add(a.animalStatus));
    return [...set].sort();
  }, [litters, individual]);

  const filteredLitters = useMemo(() => {
    if (statusFilter === "all") return litters;
    return litters
      .map((l) => ({
        ...l,
        animals: l.animals.filter((a) => a.animalStatus === statusFilter),
      }))
      .filter((l) => l.animals.length > 0);
  }, [litters, statusFilter]);

  const filteredIndividual = useMemo(() => {
    if (statusFilter === "all") return individual;
    return individual.filter((a) => a.animalStatus === statusFilter);
  }, [individual, statusFilter]);

  const nothingMatches = filteredLitters.length === 0 && filteredIndividual.length === 0;

  function toggleLitter(animals: Animal[], select: boolean) {
    toggleMany(
      animals.map((a) => a.id),
      select
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-6 py-8 pb-36 sm:px-10">
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm font-semibold text-sky-deep">
            Click any pup for detailed information
          </p>
          <div className="flex items-center gap-2 text-sm text-brown-soft">
            Status:
            <StatusFilterDropdown
              statuses={statuses}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {nothingMatches && (
          <p className="py-16 text-center font-display text-3xl text-brown-soft">
            No animals with this status right now.
          </p>
        )}

        {filteredLitters.map((litter) => {
          const sample = litter.animals[0];
          const details = [
            `Litter of ${litter.animals.length}`,
            sample.breed,
            sample.estimatedAge,
          ].filter(Boolean);

          return (
            <section key={litter.key}>
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <SelectLitterCheckbox
                  litterAnimals={litter.animals}
                  selectedIds={selectedIds}
                  onToggleLitter={toggleLitter}
                />
                <h2 className="font-display uppercase tracking-wide text-3xl text-sky-deep">
                  {litter.key}
                </h2>
                <span className="text-sm text-brown-soft">{details.join(" · ")}</span>
              </div>
              <AnimalGrid
                animals={litter.animals}
                selectedIds={selectedIds}
                onToggleSelect={toggle}
              />
            </section>
          );
        })}

        {filteredIndividual.length > 0 && (
          <section>
            {filteredLitters.length > 0 && (
              <h2 className="mb-4 font-display uppercase tracking-wide text-3xl text-sky-deep">
                Individual Animals
              </h2>
            )}
            <AnimalGrid
              animals={filteredIndividual}
              selectedIds={selectedIds}
              onToggleSelect={toggle}
            />
          </section>
        )}
      </main>

      {selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brown bg-brown px-6 py-5 shadow-[0_-4px_16px_rgba(0,0,0,0.18)] sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-lg font-semibold text-cream">
              {selectedIds.size} animal{selectedIds.size === 1 ? "" : "s"} selected
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={clear}
                className="w-36 rounded-full border-2 border-cream py-2.5 text-center text-base font-semibold text-cream transition-colors hover:bg-cream/10"
              >
                Clear
              </button>
              <Link
                href="/selected"
                className="w-36 rounded-full bg-sky-deep py-2.5 text-center text-base font-semibold text-cream transition-opacity hover:opacity-90"
              >
                View selected
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
