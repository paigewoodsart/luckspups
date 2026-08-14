"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Animal } from "@/types/animal";
import type { LitterGroup } from "@/lib/litters";
import { useSelection } from "@/lib/useSelection";
import { AnimalGrid } from "./AnimalGrid";

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

  function toggleLitter(animals: Animal[], select: boolean) {
    toggleMany(
      animals.map((a) => a.id),
      select
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-6 py-8 pb-36 sm:px-10">
        {litters.map((litter) => {
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

        {individual.length > 0 && (
          <section>
            {litters.length > 0 && (
              <h2 className="mb-4 font-display uppercase tracking-wide text-3xl text-sky-deep">
                Individual Animals
              </h2>
            )}
            <AnimalGrid
              animals={individual}
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
