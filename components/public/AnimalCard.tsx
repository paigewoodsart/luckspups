"use client";

import { useState } from "react";
import type { Animal } from "@/types/animal";
import { statusVariant, statusBadgeClasses } from "@/lib/status";

function PhotoPlaceholder({ species }: { species: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-sky-soft">
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

export function AnimalCard({
  animal,
  selected = false,
  onToggleSelect,
}: {
  animal: Animal;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const variant = statusVariant(animal.animalStatus);
  const secondaryLine = [animal.breed, animal.secondaryBreed].filter(Boolean).join(" / ");
  const clamp = expanded ? "" : "truncate";

  return (
    <article
      onClick={() => setExpanded((e) => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      aria-expanded={expanded}
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
          <PhotoPlaceholder species={animal.species} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-4">
        <h3
          className={`font-display uppercase tracking-wide text-sm leading-tight sm:text-lg ${clamp}`}
        >
          {animal.name}
        </h3>

        <span
          className={`w-full rounded-lg px-1 py-0.5 text-center text-[9px] font-semibold text-brown sm:py-1 sm:text-xs ${
            expanded ? "whitespace-normal" : "whitespace-nowrap"
          } ${statusBadgeClasses[variant]}`}
        >
          {animal.animalStatus}
        </span>

        <p className={`text-xs capitalize text-brown-soft sm:text-sm ${clamp}`}>
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
  );
}
