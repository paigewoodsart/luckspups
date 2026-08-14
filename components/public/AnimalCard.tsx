"use client";

import { useEffect, useState } from "react";
import type { Animal } from "@/types/animal";
import { statusVariant, statusBadgeClasses } from "@/lib/status";

function cap(value: string | null): string | null {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : null;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function PhotoPlaceholder({ species, className }: { species: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-sky-soft ${className ?? ""}`}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-12 w-12 text-sky-deep/60"
        fill="currentColor"
      >
        {species === "cat" ? (
          <path d="M4 10c0-1 .5-3.5 2-5l1 3 2-1.5V4l2 2 2-2v2.5L15 5l1-3c1.5 1.5 2 4 2 5 2 0 3 2 3 4v6a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-6c0-2 1-4 3-4Zm3 6.5c0 1 .9 1.5 2 1.5s2-.5 2-1.5-2-2.5-2-2.5-2 1.5-2 2.5Zm6 0c0 1 .9 1.5 2 1.5s2-.5 2-1.5-2-2.5-2-2.5-2 1.5-2 2.5Z" />
        ) : (
          <path d="M6.5 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm11 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM9 6.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM12 12c-3 0-6.5 2.3-6.5 5.2 0 1.5 1.3 2.3 3 1.8 1.2-.4 2.2-1 3.5-1s2.3.6 3.5 1c1.7.5 3-.3 3-1.8C18.5 14.3 15 12 12 12Z" />
        )}
      </svg>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 border-b border-sky/60 py-1.5 text-sm">
      <dt className="text-brown-soft">{label}</dt>
      <dd className="text-right font-medium text-brown">{value}</dd>
    </div>
  );
}

export function AnimalCard({
  animal,
  selected = false,
  onToggleSelect,
}: {
  animal: Animal;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const variant = statusVariant(animal.animalStatus);
  const secondaryLine = [animal.breed, animal.secondaryBreed].filter(Boolean).join(" / ");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-cream-soft shadow-sm transition-shadow hover:shadow-md ${
          selected ? "border-sky-deep ring-2 ring-sky-deep" : "border-sky"
        }`}
      >
        <div className="relative aspect-square w-full">
          {onToggleSelect && (
            <label
              onClick={(e) => e.stopPropagation()}
              className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-cream-soft/90 shadow"
              title={`Select ${animal.name}`}
            >
              <span className="sr-only">Select {animal.name} for transport</span>
              <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 accent-sky-deep"
              />
            </label>
          )}
          {animal.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={animal.photoUrl}
              alt={animal.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <PhotoPlaceholder species={animal.species} className="h-full w-full" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-4">
          <h3 className="truncate font-display uppercase tracking-wide text-sm leading-tight sm:text-lg">
            {animal.name}
          </h3>

          <span
            className={`w-full whitespace-nowrap rounded-lg px-1 py-0.5 text-center text-[9px] font-semibold text-brown sm:py-1 sm:text-xs ${statusBadgeClasses[variant]}`}
          >
            {animal.animalStatus}
          </span>

          <p className="truncate text-xs capitalize text-brown-soft sm:text-sm">
            {animal.species}
            {secondaryLine ? ` · ${secondaryLine}` : ""}
          </p>

          <p className="text-xs text-brown-soft sm:text-sm">
            {[animal.gender, animal.estimatedAge, animal.locationStatus]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </article>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-cream-soft shadow-xl"
          >
            <div className="relative w-full bg-sky-soft">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream-soft/90 text-lg text-brown shadow"
              >
                &times;
              </button>
              {animal.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={animal.photoUrl}
                  alt={animal.name}
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <PhotoPlaceholder species={animal.species} className="aspect-square w-full" />
              )}
            </div>

            <div className="p-5">
              <h2 className="font-display uppercase tracking-wide text-3xl text-brown">
                {animal.name}
              </h2>
              <span
                className={`mt-2 inline-block rounded-lg px-3 py-1 text-sm font-semibold text-brown ${statusBadgeClasses[variant]}`}
              >
                {animal.animalStatus}
              </span>

              <dl className="mt-4">
                <DetailRow
                  label="Species"
                  value={[cap(animal.species), secondaryLine].filter(Boolean).join(" · ")}
                />
                <DetailRow label="Gender" value={animal.gender} />
                <DetailRow label="Age" value={animal.estimatedAge} />
                <DetailRow label="Size" value={animal.sizeGroup} />
                <DetailRow label="Location" value={animal.locationStatus} />
                <DetailRow label="Admission" value={animal.admissionType} />
                <DetailRow label="Intake date" value={formatDate(animal.intakeDate)} />
                <DetailRow label="Heartworm status" value={animal.heartwormStatus} />
                <DetailRow label="Altered" value={animal.altered} />
                <DetailRow label="Tags" value={animal.tags} />
                <DetailRow label="Notes" value={animal.intakeNote} />
              </dl>

              {onToggleSelect && (
                <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-sky-deep px-5 py-2.5 text-sm font-semibold text-sky-deep transition-colors hover:bg-sky-soft">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggleSelect}
                    className="h-4 w-4 accent-sky-deep"
                  />
                  {selected ? "Selected for transport" : "Select for transport"}
                </label>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
