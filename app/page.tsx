import Image from "next/image";
import { getAnimals } from "@/lib/data/animals";
import { AnimalBrowser } from "@/components/public/AnimalBrowser";
import { groupByLitter } from "@/lib/litters";

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
  const { litters, individual } = groupByLitter(animals);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-sky bg-sky-deep px-6 py-10 text-center sm:px-10">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/lucks-logo-white.png"
            alt=""
            width={558}
            height={500}
            priority
            className="h-14 w-auto sm:h-16"
          />
          <h1 className="font-display uppercase tracking-wide text-5xl text-white sm:text-6xl">
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
        {lastUpdated && (
          <p className="mt-3 text-sm font-semibold text-cream">
            Last updated {formatAsOf(lastUpdated)}
          </p>
        )}
      </header>

      <AnimalBrowser litters={litters} individual={individual} />
    </div>
  );
}
