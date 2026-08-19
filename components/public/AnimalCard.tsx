"use client";

import { useEffect, useState } from "react";
import type { Animal } from "@/types/animal";
import { statusVariant, statusBadgeClasses, statusLabel } from "@/lib/status";
import { formatDate } from "@/lib/format";

function cap(value: string | null): string | null {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : null;
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
  clickable = true,
  showStatus = true,
}: {
  animal: Animal;
  selected?: boolean;
  onToggleSelect?: () => void;
  clickable?: boolean;
  showStatus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const variant = statusVariant(animal.animalStatus);
  const secondaryLine = [animal.breed, animal.secondaryBreed].filter(Boolean).join(" / ");
  const activePhoto = animal.photos[photoIndex] ?? null;

  function openLightbox() {
    if (!clickable) return;
    setPhotoIndex(0);
    setOpen(true);
  }

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
        onClick={clickable ? openLightbox : undefined}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openLightbox();
                }
              }
            : undefined
        }
        className={`flex flex-col overflow-hidden rounded-2xl border bg-cream-soft shadow-sm transition-shadow ${
          clickable ? "cursor-pointer hover:shadow-md" : "opacity-70"
        } ${selected ? "border-sky-deep ring-2 ring-sky-deep" : "border-sky"}`}
      >
        {/* pt-[100%] rather than aspect-square: as a flex-col child here, an
            aspect-ratio height can get squeezed by the text block below it,
            letting the img fall back to its own natural aspect ratio.
            Padding-percentage always resolves against width, so this stays
            square no matter what the flex layout does around it. */}
        <div className="relative w-full pt-[100%]">
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
          {animal.priority && (
            <div
              aria-label="Priority animal"
              title="Priority — first choice for transport"
              className="absolute right-3 top-0 z-10 h-9 w-7 text-red-700 drop-shadow"
            >
              <svg viewBox="0 0 24 32" aria-hidden="true" className="h-full w-full" fill="currentColor">
                <path d="M0 0h24v32l-12-9-12 9V0z" />
              </svg>
            </div>
          )}
          {animal.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={animal.photoUrl}
              alt={animal.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <PhotoPlaceholder species={animal.species} className="absolute inset-0" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-4">
          <h3 className="truncate font-display uppercase tracking-wide text-sm leading-tight sm:text-lg">
            {animal.name}
          </h3>

          {showStatus && (
            <span
              className={`w-full whitespace-nowrap rounded-lg px-1 py-0.5 text-center text-[9px] font-semibold text-brown sm:py-1 sm:text-xs ${statusBadgeClasses[variant]}`}
            >
              {statusLabel(animal.animalStatus)}
            </span>
          )}

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
              {activePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePhoto.url}
                  alt={animal.name}
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <PhotoPlaceholder species={animal.species} className="aspect-square w-full" />
              )}
            </div>

            {animal.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-5 pt-4">
                {animal.photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setPhotoIndex(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === photoIndex ? "border-sky-deep" : "border-sky"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-5">
              <h2 className="font-display uppercase tracking-wide text-3xl text-brown">
                {animal.name}
              </h2>
              <span
                className={`mt-2 inline-block rounded-lg px-3 py-1 text-sm font-semibold text-brown ${statusBadgeClasses[variant]}`}
              >
                {statusLabel(animal.animalStatus)}
              </span>

              {animal.story && (
                <p className="mt-4 whitespace-pre-line text-brown">{animal.story}</p>
              )}

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
