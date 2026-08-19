"use client";

import { useState } from "react";

export function CreateLitterModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (litter: { id: string; name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/litters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      name?: string;
      error?: string;
    };

    setSaving(false);
    if (!res.ok || !body.id || !body.name) {
      setError(body.error ?? "Failed to create litter");
      return;
    }

    setName("");
    onCreated({ id: body.id, name: body.name });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-cream-soft p-6 shadow-xl"
      >
        <h2 className="mb-4 font-display uppercase tracking-wide text-xl text-sky-deep">
          Create Litter
        </h2>
        <label className="block text-sm font-semibold text-brown">
          Litter name
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            className="mt-1 w-full rounded-lg border border-sky bg-cream px-3 py-2 text-brown focus:border-sky-deep focus:outline-none"
          />
        </label>

        {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-brown-soft hover:text-brown"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="rounded-full bg-sky-deep px-5 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
