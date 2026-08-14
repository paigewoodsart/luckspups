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
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-sky-deep px-4 py-1.5 text-sm font-semibold text-sky-deep transition-colors hover:bg-cream-soft"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
