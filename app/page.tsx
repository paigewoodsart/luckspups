import { getAnimals } from "@/lib/data/animals";
import { AnimalBrowser } from "@/components/public/AnimalBrowser";
import { groupByLitter } from "@/lib/litters";

function formatAsOf(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Home() {
  const { animals, lastUpdated } = await getAnimals();
  const { litters, individual } = groupByLitter(animals);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-sky bg-sky-soft px-6 py-10 text-center sm:px-10">
        <h1 className="font-display uppercase tracking-wide text-5xl text-sky-deep sm:text-6xl">
          Luck&rsquo;s Pups
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-brown-soft">
          Every animal currently in Luck&rsquo;s Rescue&rsquo;s care, kept up to date
          for our transport partners. Browse below, grouped by litter where
          it applies, then select the animals you&rsquo;d like to take and
          export your list to send to us.
        </p>
        {lastUpdated && (
          <p className="mt-2 text-sm font-semibold text-sky-deep">
            Last updated {formatAsOf(lastUpdated)}
          </p>
        )}
      </header>

      <AnimalBrowser litters={litters} individual={individual} />
    </div>
  );
}
