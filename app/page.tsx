import Image from "next/image";
import Link from "next/link";
import { getAnimals } from "@/lib/data/animals";
import { AnimalBrowser } from "@/components/public/AnimalBrowser";
import { groupByLitter } from "@/lib/litters";
import { UNAVAILABLE_STATUS } from "@/lib/status";

function formatAsOf(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

export default async function Home() {
  const { animals, lastUpdated } = await getAnimals();
  const unavailable = animals.filter((a) => a.animalStatus === UNAVAILABLE_STATUS);
  const browsable = animals.filter((a) => a.animalStatus !== UNAVAILABLE_STATUS);
  const { litters, individual } = groupByLitter(browsable);
  const hasPriority = browsable.some((a) => a.priority);

  return (
    <div className="flex flex-1 flex-col">
      <header className="relative border-b border-sky bg-sky-deep px-6 py-10 text-center sm:px-10">
        <Link
          href="/help"
          aria-label="Help"
          title="Help"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-cream/40 text-sm text-cream/70 transition-colors hover:border-cream hover:text-cream sm:right-6 sm:top-6"
        >
          ?
        </Link>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Image
            src="/lucks-logo-white.png"
            alt=""
            width={558}
            height={500}
            priority
            className="h-9 w-auto shrink-0 sm:h-14 md:h-16"
          />
          <h1 className="font-display uppercase tracking-wide text-3xl text-white sm:text-5xl md:text-6xl">
            Luck&rsquo;s Pups
          </h1>
        </div>
        <p className="mx-auto mt-3 max-w-xl font-bold text-cream/90">
          Every animal currently in{" "}
          <a
            href="https://www.lucksrescue.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold"
          >
            Luck&rsquo;s Rescue
          </a>
          &rsquo;s care, kept up to date for our transport partners. Browse
          below, grouped by litter where it applies, then select the animals
          you&rsquo;d like to take and export your list to send to us.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm italic text-cream/70">
          This page is built to make transport coordination easier for our
          rescue and partner network. It isn&rsquo;t a public adoption
          listing, and we&rsquo;re unable to process individual adoption
          inquiries here.
        </p>
        {hasPriority && (
          <p className="mx-auto mt-3 flex max-w-lg items-center justify-center gap-1.5 text-sm font-semibold text-cream">
            <svg
              viewBox="0 0 24 32"
              aria-hidden="true"
              className="h-4 w-3 shrink-0 text-red-700"
              fill="currentColor"
            >
              <path d="M0 0h24v32l-12-9-12 9V0z" />
            </svg>
            Animals with a bookmark are Luck&rsquo;s first-choice picks &mdash;
            please consider them first for transport.
          </p>
        )}
        {lastUpdated && (
          <p className="mt-3 text-sm font-semibold text-cream">
            Last updated {formatAsOf(lastUpdated)}
          </p>
        )}
      </header>

      <AnimalBrowser litters={litters} individual={individual} unavailable={unavailable} />
    </div>
  );
}
