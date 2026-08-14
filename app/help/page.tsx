import Link from "next/link";

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

export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-sky bg-sky-deep px-6 py-10 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-cream/80">
          For Transport &amp; Rescue Partners
        </p>
        <h1 className="mt-2 font-display uppercase tracking-wide text-4xl text-white sm:text-5xl">
          Luck&rsquo;s Pups for Luck&rsquo;s Rescue
        </h1>
        <p className="mt-2 text-lg text-cream/90">How to use our new interface</p>
        <p className="mx-auto mt-4 max-w-xl text-cream/90">
          A live, always-current look at who&rsquo;s in Luck&rsquo;s Rescue&rsquo;s
          care. This tool exists to make transport coordination faster for our
          partner network.
        </p>
        <p className="mt-4">
          <Link href="/" className="text-sm font-semibold text-cream underline">
            ← Back to the roster
          </Link>
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:px-10">
        <Section title="Where to Find It">
          <p>
            <strong>URL:</strong> luckspups.vercel.app
            <br />
            <strong>Login:</strong> None needed, open to view anytime
          </p>
          <p className="rounded-lg border border-sky bg-sky-soft px-4 py-3 text-sm text-brown-soft">
            <strong className="text-brown">Tip:</strong> Check the &ldquo;Last
            updated&rdquo; date at the top of the page to see how fresh the list
            is.
          </p>
        </Section>

        <Section title="1. Browsing the Roster">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Animals from the same litter are grouped together with a quick
              summary.
            </li>
            <li>Everyone else appears under Individual Animals.</li>
            <li>
              Tap any tile to open a full-size view, and more detailed vetting
              and intake information.
            </li>
          </ul>
        </Section>

        <Section title="2. Selecting Animals">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Tap the checkbox on any tile (or in the pop-up view) to add that
              animal to your list.
            </li>
            <li>
              Want a whole litter? Use the checkbox next to the litter&rsquo;s
              name to grab every animal in that group in one tap.
            </li>
            <li>
              A bar at the bottom of the screen keeps a running count of your
              selections.
            </li>
          </ul>
        </Section>

        <Section title="3. Reviewing & Exporting">
          <p>
            Tap &lsquo;View selected&rsquo; to see your full list on its own
            page. From there, two ways to export:
          </p>
          <p>
            <strong>Copy list / .txt</strong> &mdash; A clean text summary to
            send to Luck&rsquo;s Rescue, copy it straight into an email, or
            download it as a file to attach.
          </p>
          <p>
            <strong>PDF download</strong> &mdash; A detailed copy with photos
            and full details for your own records.
          </p>
          <p className="rounded-lg border border-sky bg-sky-soft px-4 py-3 text-sm text-brown-soft">
            <strong className="text-brown">Please note:</strong> We do our best
            to keep this roster up to date, but we can&rsquo;t guarantee every
            animal selected is still available, please confirm with us before
            finalizing transport plans.
          </p>
          <p className="rounded-lg border border-sky bg-sky-soft px-4 py-3 text-sm text-brown-soft">
            <strong className="text-brown">Selecting isn&rsquo;t booking:</strong>{" "}
            Choosing animals and exporting your list sends us a request &mdash;
            it doesn&rsquo;t reserve anything. The roster won&rsquo;t reflect a
            transport as confirmed until we&rsquo;ve reviewed and approved it
            on our end.
          </p>
        </Section>

        <p className="text-brown-soft">For questions please reach out to us directly.</p>
      </main>
    </div>
  );
}
