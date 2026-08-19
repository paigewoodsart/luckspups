-- Manual litter grouping -- a first-class litters table + animals.litter_id,
-- used alongside (not replacing) the text-match litter inference in
-- lib/litters.ts. Animals with an explicit litter_id are grouped
-- unconditionally (no birthday/breed cross-check, shown even with a single
-- member); animals without one still go through the legacy groups/litterName
-- detection unchanged.

create table litters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table animals add column litter_id uuid;

alter table animals
  add constraint animals_litter_fk
  foreign key (litter_id) references litters(id) on delete set null;

create index animals_litter_id_idx on animals (litter_id);

alter table litters enable row level security;

create policy "litters are publicly readable"
  on litters for select
  using (true);
