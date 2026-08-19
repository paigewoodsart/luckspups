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
              Log into <strong>AnimalsFirst</strong> and find the{" "}
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
          <p>
            Publishing also checks for litters: any group of animals sharing a
            Group/Litter Name that also share a birthday and breed gets turned
            into a real litter automatically, so it&rsquo;s available to pick
            from in the Litter dropdown &mdash; see{" "}
            <strong>Grouping Animals into Litters</strong> below.
          </p>
        </Section>

        <Section title="Adding Photos & Stories">
          <p>
            Neither system&rsquo;s standard export includes photos, so
            that&rsquo;s handled separately: go to{" "}
            <strong>Manage Animals</strong> from the dashboard, pick an animal,
            and upload one or more photos or write a short story for them. Pick
            which photo is primary or delete any of them right there. These
            live only on the site &mdash; re-uploading a new export never
            overwrites or removes them.
          </p>
        </Section>

        <Section title="Adding an Animal by Hand">
          <p>
            Not every animal comes through an upload &mdash; for one from a
            different partner rescue, or anything else you need to enter
            yourself, use <strong>+ Add Animal</strong> at the top of{" "}
            <strong>Manage Animals</strong>.
          </p>
          <p>
            The form covers everything a normal upload would (breed, intake
            info, health details, and so on), plus you can write a story and
            add photos right there &mdash; no need to visit the animal&rsquo;s
            page afterward. Only name, species, and status are required;
            leave anything else blank if you don&rsquo;t have it.
          </p>
        </Section>

        <Section title="Changing an Animal's Status">
          <p>
            You don&rsquo;t need a new export just to change a status. On{" "}
            <strong>Manage Animals</strong>, every animal has a status dropdown
            right in the list. Change as many as you like, then hit the{" "}
            <strong>Save changes</strong> bar that appears at the bottom &mdash;
            nothing is saved until you do.
          </p>
        </Section>

        <Section title="Marking a Priority Animal">
          <p>
            Use the star button next to an animal&rsquo;s name on{" "}
            <strong>Manage Animals</strong> to flag it as a priority &mdash; a
            first-choice pick for transport partners. It saves the moment you
            click it, no need to hit Save.
          </p>
          <p>
            Priority animals show a star badge on their public tile and are
            listed first on the roster, ahead of everyone else. Flag one
            animal in a litter and the whole litter moves up together.
          </p>
        </Section>

        <Section title="Removing an Animal">
          <p>
            Once an animal has left on transport (or otherwise needs to come
            off the site), click the trash icon on its row in{" "}
            <strong>Manage Animals</strong> and confirm.
          </p>
          <Tip>
            This is permanent &mdash; it deletes the animal&rsquo;s record and
            every photo along with it. There&rsquo;s no undo, so double-check
            you have the right animal before confirming.
          </Tip>
        </Section>

        <Section title="Grouping Animals into Litters">
          <p>
            Litters usually form on their own: when a publish finds animals
            sharing a Group/Litter Name who also share a birthday and breed,
            they&rsquo;re grouped automatically (see{" "}
            <strong>4. Publish</strong> above). If a real littermate gets left
            out &mdash; usually because its birthday or breed doesn&rsquo;t
            quite match &mdash; you can add it in by hand.
          </p>
          <p>
            On <strong>Manage Animals</strong>, use{" "}
            <strong>+ Create Litter</strong> to start a new one, or check off
            several animals and use the <strong>Add to Litter</strong> dropdown
            that appears at the bottom to group them in one action. To adjust
            just one animal, use the Litter dropdown on its own profile page
            instead.
          </p>
          <Tip>
            Every Litter dropdown lets you create a new litter inline, and
            shows a trash icon next to each existing one to delete it &mdash;
            deleting a litter only unlinks its animals, it doesn&rsquo;t
            delete them.
          </Tip>
        </Section>

        <Section title="What Each Status Means on the Site">
          <p>
            The public roster relabels statuses for partners &mdash; the
            underlying value you set is what matters, here&rsquo;s what each
            one actually does:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Status Pending</strong> &mdash; shows as &ldquo;Available.&rdquo;
              Fully browsable and selectable for transport.
            </li>
            <li>
              <strong>Available</strong> &mdash; shows as &ldquo;Up for Local
              Adoption.&rdquo; Still visible and clickable, but the transport
              select checkbox is hidden &mdash; use this when an animal is up
              for adoption locally, not transport.
            </li>
            <li>
              <strong>Foster To Adopt</strong> and <strong>Socialization Hold</strong>{" "}
              &mdash; shown as-is, fully browsable and selectable.
            </li>
            <li>
              <strong>Transport Approved</strong> &mdash; shows as &ldquo;Transport
              Pending/Unavailable.&rdquo; Pulled out of its litter/individual
              listing entirely, made unclickable, and shown in its own section
              at the very bottom of the page. Use this for animals not
              currently open to transport requests.
            </li>
          </ul>
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
            Data fields like breed or intake info get corrected by
            re-exporting and re-uploading. Status can be changed either that
            way or directly in <strong>Manage Animals</strong> &mdash; whichever&rsquo;s
            faster. Photos and stories are only ever edited in{" "}
            <strong>Manage Animals</strong>.
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
