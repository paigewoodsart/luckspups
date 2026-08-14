import type { Animal } from "@/types/animal";
import { AnimalCard } from "./AnimalCard";

export function AnimalGrid({
  animals,
  selectedIds,
  onToggleSelect,
  clickable = true,
  showStatus = true,
}: {
  animals: Animal[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  clickable?: boolean;
  showStatus?: boolean;
}) {
  if (animals.length === 0) {
    return (
      <p className="py-16 text-center font-display text-3xl text-brown-soft">
        No pups (or kittens!) to show right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          selected={selectedIds?.has(animal.id) ?? false}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(animal.id) : undefined}
          clickable={clickable}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
}
