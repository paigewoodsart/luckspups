import { AdminHeader } from "@/components/admin/AdminHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display uppercase tracking-wide text-2xl text-sky-deep">
        {title}
      </h2>
      <div className="space-y-3 text-brown">{children}</div>
    </section>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-sky bg-sky-soft px-4 py-3 text-sm text-brown-soft">
      {children}
    </p>
  );
}

export default function AdminHelpPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title="Admin Guide" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:px-10">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Help" }]} />
        <p className="mb-10 text-brown-soft">
          How to keep the roster current &mdash; from your shelter
          software&rsquo;s export to live site.
        </p>

        <Section title="1. Export the Report">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Log into <strong>Shelterluv</strong> or <strong>AnimalsFirst</strong>
              &nbsp;(whichever you&rsquo;re using) and find the{" "}
              <strong>Animals in Care</strong> report. If you&rsquo;ve exported
              this before, check for a saved version first &mdash; it&rsquo;s
              faster than rebuilding it from scratch.
            </li>
            <li>
              Export it as an <strong>.xlsx</strong> file specifically. This
              matters: the upload tool is built for this exact spreadsheet
              format, so a PDF or CSV export won&rsquo;t work.
            </li>
          </ol>
          <Tip>
            <strong className="text-brown">About photos:</strong> A standard
            export includes every animal&rsquo;s data but not photos &mdash;
            new animals will show a paw-print placeholder until a photo is
            added. Use <strong>Manage Animals</strong> (see below) to attach a
            photo directly on the site &mdash; no export needed for that part.
          </Tip>
        </Section>

        <Section title="2. Upload the File">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              From the admin dashboard, choose <strong>Upload new data</strong>.
            </li>
            <li>
              Select your <code>.xlsx</code> file and upload it.
            </li>
            <li>
              The system reads every row and checks it against animals already
              on the site &mdash; this takes a few seconds.
            </li>
          </ol>
        </Section>

        <Section title="3. Review & Resolve">
          <p>
            You&rsquo;ll land on a review screen with every animal from the file
            sorted into three groups:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>New animals</strong> &mdash; not currently on the site,
              will be added fresh.
            </li>
            <li>
              <strong>Updates to existing animals</strong> &mdash; matched by
              their ID in the source system, their info will simply refresh.
            </li>
            <li>
              <strong>Possible duplicates</strong> &mdash; flagged because a
              name and species matches an existing animal but other details
              differ. For each one, choose &ldquo;This is a new animal&rdquo; or
              &ldquo;Update existing.&rdquo;
            </li>
          </ul>
          <p>
            Nothing changes on the public site until you publish &mdash; take
            your time here.
          </p>
        </Section>

        <Section title="4. Publish">
          <p>
            Click <strong>Publish</strong>. Every change goes live on the public
            roster immediately, and the site&rsquo;s &ldquo;Last updated&rdquo;
            date updates automatically &mdash; no extra step needed.
          </p>
        </Section>

        <Section title="Adding Photos & Stories">
          <p>
            Neither system&rsquo;s standard export includes photos, so
            that&rsquo;s handled separately: go to{" "}
            <strong>Manage Animals</strong> from the dashboard, pick an animal,
            and upload a photo or write a short story for them. These live only
            on the site &mdash; re-uploading a new export never overwrites or
            removes them.
          </p>
        </Section>

        <Section title="Good Habits">
          <Tip>
            Upload on a regular schedule &mdash; weekly works well &mdash; so
            partners can trust the roster is current.
          </Tip>
          <Tip>
            Re-uploading the same file is completely safe. Matching happens by
            each animal&rsquo;s ID, so anything already listed just gets
            refreshed, never duplicated.
          </Tip>
          <Tip>
            Data fields (status, breed, intake info, etc.) get corrected by
            re-exporting and re-uploading. Photos and stories are edited
            directly in <strong>Manage Animals</strong> instead.
          </Tip>
        </Section>

        <Section title="Troubleshooting">
          <p>
            <strong>Upload rejected</strong> &mdash; Confirm the file is a real{" "}
            <code>.xlsx</code> export of the Animals in Care report, not a PDF,
            CSV, or renamed file.
          </p>
          <p>
            <strong>Wrong info live</strong> &mdash; Re-export a fresh file and
            upload again &mdash; the correction overwrites automatically via ID
            matching.
          </p>
          <p>
            <strong>Anything else</strong> &mdash; Contact Paige Woods.
          </p>
        </Section>
      </main>
    </div>
  );
}
