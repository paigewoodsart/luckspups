"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-sky-soft px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-sky bg-cream-soft p-8 shadow-sm"
      >
        <h1 className="font-display uppercase tracking-wide text-3xl text-sky-deep">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-brown-soft">
          Luck&rsquo;s Pups roster management.
        </p>

        <label className="mt-6 block text-sm font-semibold text-brown">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky bg-cream px-3 py-2 text-brown focus:border-sky-deep focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-brown">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky bg-cream px-3 py-2 text-brown focus:border-sky-deep focus:outline-none"
          />
        </label>

        {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-sky-deep px-4 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
