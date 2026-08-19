"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="font-display uppercase tracking-wide text-3xl text-sky-deep">
        Something went wrong
      </h1>
      <p className="max-w-sm text-brown-soft">
        Give it another try, or come back in a bit if the problem sticks around.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-sky-deep px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
