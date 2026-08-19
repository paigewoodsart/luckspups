"use client";

import { useEffect } from "react";

// Catches crashes in the root layout itself, which app/error.tsx can't --
// it replaces the whole <html>/<body>, so it can't assume globals.css or
// the Tailwind build are available and styles inline instead.
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#FAF3E9",
          color: "#3B2A1E",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: "24rem", color: "#6B5847" }}>
          Give it another try, or come back in a bit if the problem sticks around.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            borderRadius: "999px",
            backgroundColor: "#3D7C90",
            color: "#FDF9F3",
            border: "none",
            padding: "0.625rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
