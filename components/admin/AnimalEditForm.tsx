"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Animal } from "@/types/animal";

interface StagedFile {
  file: File;
  previewUrl: string;
}

export function AnimalEditForm({ animal }: { animal: Animal }) {
  const router = useRouter();
  const [story, setStory] = useState(animal.story ?? "");
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setStaged((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    setSaved(false);
    e.target.value = "";
  }

  function removeStaged(index: number) {
    setStaged((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const formData = new FormData();
    formData.append("story", story);
    staged.forEach(({ file }) => formData.append("photos", file));

    const res = await fetch(`/api/admin/animals/${animal.id}`, {
      method: "POST",
      body: formData,
    });

    setSaving(false);
    if (res.ok) {
      staged.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      setStaged([]);
      setSaved(true);
      router.refresh();
    }
  }

  async function handleSetPrimary(photoId: string) {
    setBusyPhotoId(photoId);
    await fetch(`/api/admin/animals/${animal.id}/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-primary" }),
    });
    setBusyPhotoId(null);
    router.refresh();
  }

  async function handleDelete(photoId: string) {
    setBusyPhotoId(photoId);
    await fetch(`/api/admin/animals/${animal.id}/photos/${photoId}`, { method: "DELETE" });
    setBusyPhotoId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 font-display uppercase tracking-wide text-xl text-sky-deep">
          Photos
        </h2>

        {(animal.photos.length > 0 || staged.length > 0) && (
          <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {animal.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-xl border border-sky bg-sky-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
                {photo.isPrimary && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-status-available px-2 py-0.5 text-[10px] font-semibold text-brown">
                    Primary
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-brown/70 p-1.5">
                  {!photo.isPrimary ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={busyPhotoId === photo.id}
                      className="rounded-full bg-cream px-2 py-1 text-[10px] font-semibold text-brown disabled:opacity-60"
                    >
                      Make primary
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={busyPhotoId === photo.id}
                    className="rounded-full bg-cream px-2 py-1 text-[10px] font-semibold text-red-700 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {staged.map((item, i) => (
              <div
                key={item.previewUrl}
                className="relative overflow-hidden rounded-xl border-2 border-dashed border-sky-deep bg-sky-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-sky-deep px-2 py-0.5 text-[10px] font-semibold text-cream">
                  New
                </span>
                <button
                  type="button"
                  onClick={() => removeStaged(i)}
                  aria-label="Remove"
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cream text-xs font-semibold text-brown"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="inline-block cursor-pointer rounded-full border border-sky-deep px-4 py-2 text-sm font-semibold text-sky-deep transition-colors hover:bg-sky-soft">
          Add photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
        </label>
        {staged.length > 0 && (
          <p className="mt-2 text-xs text-brown-soft">
            New photos upload when you hit Save below.
          </p>
        )}
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
