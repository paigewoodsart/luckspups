-- Luck's Pups schema.
-- Field names mirror the "Animals in Care" export shared by Shelterluv
-- and AnimalsFirst (confirmed against a real sample: Animals_In_Care.xlsx).

create extension if not exists pgcrypto;

-- ── Public, live tables ──────────────────────────────────────────
-- Nothing lands here until an admin reviews and publishes it, so the
-- read policy below can stay an unconditional `using (true))`.

create table animals (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,       -- source system's own animal ID; primary dedup key
  name text not null,
  animal_status text not null,            -- e.g. Transport Approved, Status Pending, Available, Foster To Adopt, Socialization Hold
  species text not null,                  -- e.g. dog, cat
  location_status text,                   -- e.g. Shelter, HQ, Foster
  admission_type text,                    -- e.g. Owner Surrender, Transfer In, Stray, Animal Control Admission
  intake_date date,
  groups text,                            -- litter/group name, e.g. "Gilmore Girls"
  heartworm_status text,
  gender text,
  altered text,
  altered_before_arrival text,
  altered_in_care text,
  litter_name text,
  birthday date,
  estimated_age text,                     -- given as free text, e.g. "0y, 5m, 0d"
  age_group text,
  size_group text,
  breed text,
  secondary_breed text,
  eye_color text,
  coat_type text,
  intake_note text,
  partner_type text,
  tags text,
  primary_photo_id uuid,                  -- fk added below, after animal_photos exists
  last_seen_upload_id uuid,               -- fk added later, after uploads exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table animal_photos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animals(id) on delete cascade,
  storage_path text not null,
  width int,
  height int,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table animals
  add constraint animals_primary_photo_fk
  foreign key (primary_photo_id) references animal_photos(id) on delete set null;

create index animals_status_idx on animals (animal_status);
create index animals_species_idx on animals (species);
create index animal_photos_animal_id_idx on animal_photos (animal_id);

-- ── Admin-only tables ────────────────────────────────────────────
-- RLS enabled with zero public policies -- locked by construction,
-- not by a conditional check that could be gotten wrong.

create table uploads (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null,             -- original PDF, kept for re-processing
  uploaded_at timestamptz not null default now(),
  status text not null default 'processing', -- processing | needs_review | published | failed
  page_count int,
  error_message text
);

alter table animals
  add constraint animals_last_seen_upload_fk
  foreign key (last_seen_upload_id) references uploads(id) on delete set null;

create table staged_animals (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references uploads(id) on delete cascade,
  page_number int not null,
  raw_extracted_json jsonb not null,
  external_id text,
  name text,
  animal_status text,
  species text,
  location_status text,
  admission_type text,
  intake_date date,
  groups text,
  heartworm_status text,
  gender text,
  altered text,
  altered_before_arrival text,
  altered_in_care text,
  litter_name text,
  birthday date,
  estimated_age text,
  age_group text,
  size_group text,
  breed text,
  secondary_breed text,
  eye_color text,
  coat_type text,
  intake_note text,
  partner_type text,
  tags text,
  match_status text not null default 'new',   -- new | update | possible_duplicate
  matched_animal_id uuid references animals(id),
  match_confidence text,                       -- high | medium | none
  match_reasons text,
  created_at timestamptz not null default now()
);

create table staged_animal_photos (
  id uuid primary key default gen_random_uuid(),
  staged_animal_id uuid not null references staged_animals(id) on delete cascade,
  storage_path text not null,
  source text not null,                        -- embedded_xobject | page_crop
  association_confidence text,
  created_at timestamptz not null default now()
);

create table animal_upload_history (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animals(id) on delete cascade,
  upload_id uuid not null references uploads(id) on delete cascade,
  action text not null,                        -- created | updated | confirmed_present
  created_at timestamptz not null default now()
);

create index staged_animals_upload_id_idx on staged_animals (upload_id);
create index animal_upload_history_animal_id_idx on animal_upload_history (animal_id);

-- ── Row Level Security ───────────────────────────────────────────

alter table animals enable row level security;
alter table animal_photos enable row level security;
alter table uploads enable row level security;
alter table staged_animals enable row level security;
alter table staged_animal_photos enable row level security;
alter table animal_upload_history enable row level security;

create policy "animals are publicly readable"
  on animals for select
  using (true);

create policy "animal photos are publicly readable"
  on animal_photos for select
  using (true);

-- No public policies at all on uploads / staged_animals /
-- staged_animal_photos / animal_upload_history: only the service-role
-- key (used exclusively in admin API routes) can read or write them.
