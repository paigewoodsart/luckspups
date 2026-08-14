import { AdminHeader } from "@/components/admin/AdminHeader";

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
        <p className="mb-10 text-brown-soft">
          How to keep the roster current &mdash; from Shelterluv export to live
          site.
        </p>

        <Section title="1. Export the Report from Shelterluv">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Log into Shelterluv.</li>
            <li>
              Go to <strong>Reports</strong>, and find the{" "}
              <strong>Animals in Care</strong> report. Depending on your account
              this may sit under <em>Quick Reports</em> or{" "}
              <em>External Reports</em> &mdash; the exact label can vary a
              little.
            </li>
            <li>
              Export it as an <strong>.xlsx</strong> file specifically. This
              matters: the upload tool is built for Shelterluv&rsquo;s
              spreadsheet format, so a PDF or CSV export won&rsquo;t work.
            </li>
          </ol>
          <Tip>
            <strong className="text-brown">About photos:</strong> Today&rsquo;s
            standard export includes every animal&rsquo;s data but not photos
            &mdash; new animals will show a paw-print placeholder until a photo
            is added another way. Once Luck&rsquo;s Rescue has access to
            Shelterluv&rsquo;s API (a future upgrade), photo links will start
            coming through in this same file automatically. Nothing about this
            process will need to change when that happens.
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
              Shelterluv&rsquo;s own ID, their info will simply refresh.
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

        <Section title="Good Habits">
          <Tip>
            Upload on a regular schedule &mdash; weekly works well &mdash; so
            partners can trust the roster is current.
          </Tip>
          <Tip>
            Re-uploading the same file is completely safe. Shelterluv&rsquo;s
            animal IDs mean anything already listed just gets refreshed, never
            duplicated.
          </Tip>
          <Tip>
            Right now, corrections happen by re-exporting and re-uploading
            &mdash; there isn&rsquo;t a separate single-animal edit screen yet.
          </Tip>
        </Section>

        <Section title="Troubleshooting">
          <p>
            <strong>Upload rejected</strong> &mdash; Confirm the file is a real{" "}
            <code>.xlsx</code> export of Shelterluv&rsquo;s Animals in Care
            report, not a PDF, CSV, or renamed file.
          </p>
          <p>
            <strong>Wrong info live</strong> &mdash; Re-export a fresh file from
            Shelterluv and upload again &mdash; the correction overwrites
            automatically via ID matching.
          </p>
          <p>
            <strong>Anything else</strong> &mdash; Contact Paige Woods.
          </p>
        </Section>
      </main>
    </div>
  );
}
