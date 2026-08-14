export function Footer() {
  return (
    <footer className="border-t border-sky bg-cream-soft px-6 py-6 text-center text-sm text-brown-soft sm:px-10">
      <p>
        More info about us here &mdash;{" "}
        <a
          href="https://www.lucksrescue.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sky-deep"
        >
          Luck&rsquo;s Rescue
        </a>
      </p>
      <p className="mt-1">
        &copy; {new Date().getFullYear()} Site by{" "}
        <a
          href="https://paigewoods.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sky-deep underline hover:no-underline"
        >
          Paige Woods
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
