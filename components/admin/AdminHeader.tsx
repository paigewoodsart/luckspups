"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function AdminHeader({ title }: { title: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-sky bg-sky-soft px-6 py-6 sm:px-10">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="font-display uppercase tracking-wide text-2xl text-sky-deep"
          >
            Luck&rsquo;s Pups Admin
          </Link>
          <p className="text-sm text-brown-soft">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/help"
            aria-label="Help"
            title="Help"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-deep/50 text-sm text-sky-deep/70 transition-colors hover:border-sky-deep hover:text-sky-deep"
          >
            ?
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-sky-deep px-4 py-1.5 text-sm font-semibold text-sky-deep transition-colors hover:bg-cream-soft"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
