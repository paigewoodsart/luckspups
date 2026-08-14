"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Animal } from "@/types/animal";

export function AnimalEditForm({ animal }: { animal: Animal }) {
  const router = useRouter();
  const [story, setStory] = useState(animal.story ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(animal.photoUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setSaved(false);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const formData = new FormData();
    formData.append("story", story);
    if (photoFile) formData.append("photo", photoFile);

    const res = await fetch(`/api/admin/animals/${animal.id}`, {
      method: "POST",
      body: formData,
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 font-display uppercase tracking-wide text-xl text-sky-deep">
          Photo
        </h2>
        <div className="flex items-center gap-5">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-sky bg-sky-soft">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-sky-deep/60">
                No photo
              </div>
            )}
          </div>
          <label className="rounded-full border border-sky-deep px-4 py-2 text-sm font-semibold text-sky-deep transition-colors hover:bg-sky-soft cursor-pointer">
            {photoFile ? "Change file" : "Upload photo"}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display uppercase tracking-wide text-xl text-sky-deep">
          Story
        </h2>
        <textarea
          value={story}
          onChange={(e) => {
            setStory(e.target.value);
            setSaved(false);
          }}
          rows={6}
          placeholder={`Tell partners a bit about ${animal.name}...`}
          className="w-full rounded-lg border border-sky bg-cream px-3 py-2 text-brown focus:border-sky-deep focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-sky-deep px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-sm font-semibold text-brown-soft">Saved!</span>}
      </div>
    </div>
  );
}
