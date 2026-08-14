import type { Animal } from "@/types/animal";
import { AnimalCard } from "./AnimalCard";

export function AnimalGrid({
  animals,
  selectedIds,
  onToggleSelect,
}: {
  animals: Animal[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}) {
  if (animals.length === 0) {
    return (
      <p className="py-16 text-center font-display text-3xl text-brown-soft">
        No pups (or kittens!) to show right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          selected={selectedIds?.has(animal.id) ?? false}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(animal.id) : undefined}
        />
      ))}
    </div>
  );
}
