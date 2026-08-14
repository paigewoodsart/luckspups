"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StagedAnimal {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  match_status: "new" | "update" | "possible_duplicate";
  matched_animal_id: string | null;
  match_confidence: "high" | "medium" | "none";
  match_reasons: string;
}

export function ReviewClient({
  uploadId,
  stagedAnimals,
  existingNamesById,
}: {
  uploadId: string;
  stagedAnimals: StagedAnimal[];
  existingNamesById: Record<string, string>;
}) {
  const router = useRouter();
  const [resolutions, setResolutions] = useState<Record<string, "new" | "update">>(() => {
    const initial: Record<string, "new" | "update"> = {};
    for (const s of stagedAnimals) {
      if (s.match_status === "update") initial[s.id] = "update";
      else if (s.match_status === "possible_duplicate") {
        initial[s.id] = s.match_confidence === "high" ? "update" : "new";
      } else {
        initial[s.id] = "new";
      }
    }
    return initial;
  });
  const [publishing, setPublishing] = useState(false);

  const newRows = stagedAnimals.filter((s) => s.match_status === "new");
  const updateRows = stagedAnimals.filter((s) => s.match_status === "update");
  const dupeRows = stagedAnimals.filter((s) => s.match_status === "possible_duplicate");

  async function handlePublish() {
    setPublishing(true);
    await fetch(`/api/admin/uploads/${uploadId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutions }),
    });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {newRows.length > 0 && (
        <section>
          <h2 className="font-display uppercase tracking-wide text-2xl text-sky-deep">
            New animals ({newRows.length})
          </h2>
          <ul className="mt-2 divide-y divide-sky">
            {newRows.map((s) => (
              <li key={s.id} className="py-2 text-brown">
                {s.name}{" "}
                <span className="text-brown-soft">
                  · {s.species}
                  {s.breed ? `, ${s.breed}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {updateRows.length > 0 && (
        <section>
          <h2 className="font-display uppercase tracking-wide text-2xl text-sky-deep">
            Updates to existing animals ({updateRows.length})
          </h2>
          <ul className="mt-2 divide-y divide-sky">
            {updateRows.map((s) => (
              <li key={s.id} className="py-2 text-brown">
                {s.name} <span className="text-brown-soft">· updates existing record</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dupeRows.length > 0 && (
        <section>
          <h2 className="font-display uppercase tracking-wide text-2xl text-sky-deep">
            Possible duplicates ({dupeRows.length}) — please confirm
          </h2>
          <ul className="mt-2 divide-y divide-sky">
            {dupeRows.map((s) => (
              <li key={s.id} className="py-3">
                <p className="font-semibold text-brown">
                  {s.name}{" "}
                  <span className="font-normal text-brown-soft">
                    · {s.species}
                    {s.breed ? `, ${s.breed}` : ""}
                  </span>
                </p>
                <p className="mt-1 text-sm text-brown-soft">{s.match_reasons}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutions((r) => ({ ...r, [s.id]: "new" }))}
                    className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                      resolutions[s.id] === "new"
                        ? "border-sky-deep bg-sky-deep text-cream"
                        : "border-sky text-sky-deep hover:bg-sky-soft"
                    }`}
                  >
                    This is a new animal
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutions((r) => ({ ...r, [s.id]: "update" }))}
                    className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                      resolutions[s.id] === "update"
                        ? "border-sky-deep bg-sky-deep text-cream"
                        : "border-sky text-sky-deep hover:bg-sky-soft"
                    }`}
                  >
                    Update existing
                    {s.matched_animal_id && existingNamesById[s.matched_animal_id]
                      ? `: ${existingNamesById[s.matched_animal_id]}`
                      : ""}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={handlePublish}
        disabled={publishing}
        className="rounded-full bg-sky-deep px-6 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {publishing
          ? "Publishing…"
          : `Publish ${stagedAnimals.length} animal${stagedAnimals.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
