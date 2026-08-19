# Luck's Pups

A live, public roster of animals in Luck's Rescue's care, built for transport
and rescue partners to browse, select, and export a transport list. Includes
an admin panel for uploading AnimalsFirst "Animals in Care" exports
(screened for duplicates before publishing) and for attaching photos and
stories per animal.

**Live site:** https://luckspups.vercel.app

## Stack

- Next.js 16 (App Router, TypeScript) + Tailwind CSS v4
- Supabase (Postgres, Storage, Auth)
- Deployed on Vercel

## Local setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project's URL and keys.
3. Run the files in `supabase/migrations/` (in order) against your Supabase
   project via its SQL Editor.
4. Optionally run `supabase/seed.sql` to load sample data.
5. `npm run dev`

## Structure

- `app/` — public roster (`/`), transport selection (`/selected`), help
  (`/help`), and the admin section (`/admin/*`, gated by `proxy.ts`)
- `lib/parse/roster-xlsx.ts` — parses an AnimalsFirst "Animals in Care" .xlsx
  export
- `lib/dedup/match.ts` — matches uploaded rows against existing animals
  before publishing
- `lib/litters.ts` — groups animals into litters, cross-checked by birthday
  and breed so unrelated animals sharing an estimated birthdate aren't
  falsely grouped
- `supabase/migrations/` — schema, run manually via the Supabase SQL Editor
  (no CLI migration tooling wired up)
