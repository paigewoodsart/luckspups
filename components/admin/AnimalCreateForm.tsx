"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/Dropdown";
import { statusLabel, sortStatusesByLabel } from "@/lib/status";
import { CreateLitterModal } from "@/components/admin/CreateLitterModal";
import type { LitterOption } from "@/lib/data/litters";

const CREATE_LITTER_VALUE = "__create__";

const KNOWN_STATUSES = [
  "Transport Approved",
  "Status Pending",
  "Available",
  "Foster To Adopt",
  "Socialization Hold",
];

const STATUS_OPTIONS = sortStatusesByLabel(KNOWN_STATUSES).map((s) => ({
  value: s,
  label: statusLabel(s),
}));

const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "other", label: "Other" },
];

const YES_NO_OPTIONS = [
  { value: "", label: "Unknown" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Unknown" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const ADMISSION_OPTIONS = [
  { value: "Transfer In", label: "Transfer In" },
  { value: "Owner Surrender", label: "Owner Surrender" },
  { value: "Stray", label: "Stray" },
  { value: "Animal Control Admission", label: "Animal Control Admission" },
];

interface StagedFile {
  file: File;
  previewUrl: string;
}

interface FormState {
  externalId: string;
  name: string;
  species: string;
  speciesOther: string;
  animalStatus: string;
  groups: string;
  litterName: string;
  litterId: string;
  locationStatus: string;
  admissionType: string;
  intakeDate: string;
  intakeNote: string;
  partnerType: string;
  heartwormStatus: string;
  gender: string;
  altered: string;
  alteredBeforeArrival: string;
  alteredInCare: string;
  birthday: string;
  estimatedAge: string;
  ageGroup: string;
  sizeGroup: string;
  breed: string;
  secondaryBreed: string;
  eyeColor: string;
  coatType: string;
  tags: string;
  priority: boolean;
  story: string;
}

const initialState: FormState = {
  externalId: "",
  name: "",
  species: "dog",
  speciesOther: "",
  animalStatus: "Status Pending",
  groups: "",
  litterName: "",
  litterId: "",
  locationStatus: "",
  admissionType: "Transfer In",
  intakeDate: new Date().toISOString().slice(0, 10),
  intakeNote: "",
  partnerType: "",
  heartwormStatus: "",
  gender: "",
  altered: "",
  alteredBeforeArrival: "",
  alteredInCare: "",
  birthday: "",
  estimatedAge: "",
  ageGroup: "",
  sizeGroup: "",
  breed: "",
  secondaryBreed: "",
  eyeColor: "",
  coatType: "",
  tags: "",
  priority: false,
  story: "",
};

const textInputClass =
  "w-full rounded-lg border border-sky bg-cream px-3 py-2 text-brown focus:border-sky-deep focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-brown">
      {label}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}

export function AnimalCreateForm({ litters }: { litters: LitterOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [litterOptions, setLitterOptions] = useState<LitterOption[]>(litters);
  const [createLitterOpen, setCreateLitterOpen] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setStaged((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  }

  function removeStaged(index: number) {
    setStaged((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleLitterChange(value: string) {
    if (value === CREATE_LITTER_VALUE) {
      setCreateLitterOpen(true);
      return;
    }
    set("litterId", value);
  }

  function handleLitterCreated(litter: LitterOption) {
    setLitterOptions((prev) => [...prev, litter]);
    set("litterId", litter.id);
    setCreateLitterOpen(false);
  }

  async function handleDeleteLitter(litterId: string) {
    const litter = litterOptions.find((l) => l.id === litterId);
    if (!litter) return;
    if (
      !window.confirm(
        `Delete litter "${litter.name}"? Its animals won't be deleted, just unlinked from the litter.`
      )
    ) {
      return;
    }

    await fetch(`/api/admin/litters/${litterId}`, { method: "DELETE" });
    setLitterOptions((prev) => prev.filter((l) => l.id !== litterId));
    if (form.litterId === litterId) set("litterId", "");
    router.refresh();
  }

  const canSubmit =
    form.name.trim() !== "" && (form.species !== "other" || form.speciesOther.trim() !== "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);

    const species = form.species === "other" ? form.speciesOther.trim() : form.species;
    const data = new FormData();
    data.append("name", form.name);
    data.append("species", species);
    data.append("animalStatus", form.animalStatus);
    data.append("externalId", form.externalId);
    data.append("groups", form.groups);
    data.append("litterName", form.litterName);
    data.append("litterId", form.litterId);
    data.append("locationStatus", form.locationStatus);
    data.append("admissionType", form.admissionType);
    data.append("intakeDate", form.intakeDate);
    data.append("intakeNote", form.intakeNote);
    data.append("partnerType", form.partnerType);
    data.append("heartwormStatus", form.heartwormStatus);
    data.append("gender", form.gender);
    data.append("altered", form.altered);
    data.append("alteredBeforeArrival", form.alteredBeforeArrival);
    data.append("alteredInCare", form.alteredInCare);
    data.append("birthday", form.birthday);
    data.append("estimatedAge", form.estimatedAge);
    data.append("ageGroup", form.ageGroup);
    data.append("sizeGroup", form.sizeGroup);
    data.append("breed", form.breed);
    data.append("secondaryBreed", form.secondaryBreed);
    data.append("eyeColor", form.eyeColor);
    data.append("coatType", form.coatType);
    data.append("tags", form.tags);
    data.append("priority", String(form.priority));
    data.append("story", form.story);
    staged.forEach(({ file }) => data.append("photos", file));

    const res = await fetch("/api/admin/animals", { method: "POST", body: data });
    const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };

    if (!res.ok || !body.id) {
      setError(body.error ?? "Failed to create animal");
      setSaving(false);
      return;
    }

    staged.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    router.push(`/admin/animals/${body.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-4">
        <h2 className="font-display uppercase tracking-wide text-xl text-sky-deep">
          Identity &amp; Status
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="External ID">
            <input
              type="text"
              value={form.externalId}
              onChange={(e) => set("externalId", e.target.value)}
              placeholder="Leave blank to auto-generate"
              className={textInputClass}
            />
          </Field>
          <Field label="Species *">
            <Dropdown
              options={SPECIES_OPTIONS}
              value={form.species}
              onChange={(v) => set("species", v)}
            />
          </Field>
          {form.species === "other" && (
            <Field label="Species (other)">
              <input
                type="text"
                value={form.speciesOther}
                onChange={(e) => set("speciesOther", e.target.value)}
                className={textInputClass}
              />
            </Field>
          )}
          <Field label="Status *">
            <Dropdown
              options={STATUS_OPTIONS}
              value={form.animalStatus}
              onChange={(v) => set("animalStatus", v)}
            />
          </Field>
          <Field label="Groups">
            <input
              type="text"
              value={form.groups}
              onChange={(e) => set("groups", e.target.value)}
              placeholder="Litter/group name"
              className={textInputClass}
            />
          </Field>
          <Field label="Litter Name">
            <input
              type="text"
              value={form.litterName}
              onChange={(e) => set("litterName", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Litter">
            <Dropdown
              options={[
                { value: "", label: "— No litter —" },
                ...litterOptions.map((l) => ({ value: l.id, label: l.name, deletable: true })),
                { value: CREATE_LITTER_VALUE, label: "+ Create new litter…" },
              ]}
              value={form.litterId}
              onChange={handleLitterChange}
              onDeleteOption={handleDeleteLitter}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display uppercase tracking-wide text-xl text-sky-deep">Intake</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location Status">
            <input
              type="text"
              value={form.locationStatus}
              onChange={(e) => set("locationStatus", e.target.value)}
              placeholder="e.g. Shelter, HQ, Foster"
              className={textInputClass}
            />
          </Field>
          <Field label="Admission Type">
            <Dropdown
              options={ADMISSION_OPTIONS}
              value={form.admissionType}
              onChange={(v) => set("admissionType", v)}
            />
          </Field>
          <Field label="Intake Date">
            <input
              type="date"
              value={form.intakeDate}
              onChange={(e) => set("intakeDate", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Partner Type">
            <input
              type="text"
              value={form.partnerType}
              onChange={(e) => set("partnerType", e.target.value)}
              placeholder="e.g. name of the partner rescue"
              className={textInputClass}
            />
          </Field>
        </div>
        <Field label="Intake Note">
          <textarea
            value={form.intakeNote}
            onChange={(e) => set("intakeNote", e.target.value)}
            rows={3}
            className={textInputClass}
          />
        </Field>
      </div>

      <div className="space-y-4">
        <h2 className="font-display uppercase tracking-wide text-xl text-sky-deep">
          Health &amp; Physical Description
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heartworm Status">
            <input
              type="text"
              value={form.heartwormStatus}
              onChange={(e) => set("heartwormStatus", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Gender">
            <Dropdown
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={(v) => set("gender", v)}
            />
          </Field>
          <Field label="Altered">
            <Dropdown
              options={YES_NO_OPTIONS}
              value={form.altered}
              onChange={(v) => set("altered", v)}
            />
          </Field>
          <Field label="Altered Before Arrival">
            <Dropdown
              options={YES_NO_OPTIONS}
              value={form.alteredBeforeArrival}
              onChange={(v) => set("alteredBeforeArrival", v)}
            />
          </Field>
          <Field label="Altered In Care">
            <Dropdown
              options={YES_NO_OPTIONS}
              value={form.alteredInCare}
              onChange={(v) => set("alteredInCare", v)}
            />
          </Field>
          <Field label="Birthday">
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => set("birthday", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Estimated Age">
            <input
              type="text"
              value={form.estimatedAge}
              onChange={(e) => set("estimatedAge", e.target.value)}
              placeholder="e.g. 2y, 3m, 0d"
              className={textInputClass}
            />
          </Field>
          <Field label="Age Group">
            <input
              type="text"
              value={form.ageGroup}
              onChange={(e) => set("ageGroup", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Size Group">
            <input
              type="text"
              value={form.sizeGroup}
              onChange={(e) => set("sizeGroup", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Breed">
            <input
              type="text"
              value={form.breed}
              onChange={(e) => set("breed", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Secondary Breed">
            <input
              type="text"
              value={form.secondaryBreed}
              onChange={(e) => set("secondaryBreed", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Eye Color">
            <input
              type="text"
              value={form.eyeColor}
              onChange={(e) => set("eyeColor", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Coat Type">
            <input
              type="text"
              value={form.coatType}
              onChange={(e) => set("coatType", e.target.value)}
              className={textInputClass}
            />
          </Field>
          <Field label="Tags">
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={textInputClass}
            />
          </Field>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-brown">
        <input
          type="checkbox"
          checked={form.priority}
          onChange={(e) => set("priority", e.target.checked)}
          className="h-4 w-4 accent-sky-deep"
        />
        Mark as priority
      </label>

      <div className="space-y-4">
        <h2 className="font-display uppercase tracking-wide text-xl text-sky-deep">
          Story &amp; Photos
        </h2>
        <Field label="Story">
          <textarea
            value={form.story}
            onChange={(e) => set("story", e.target.value)}
            rows={6}
            placeholder="Tell partners a bit about this animal..."
            className={textInputClass}
          />
        </Field>

        {staged.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {staged.map((item, i) => (
              <div
                key={item.previewUrl}
                className="relative overflow-hidden rounded-xl border-2 border-dashed border-sky-deep bg-sky-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" className="aspect-square w-full object-cover" />
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
      </div>

      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving || !canSubmit}
        className="rounded-full bg-sky-deep px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Creating…" : "Create Animal"}
      </button>

      <CreateLitterModal
        open={createLitterOpen}
        onClose={() => setCreateLitterOpen(false)}
        onCreated={handleLitterCreated}
      />
    </form>
  );
}
