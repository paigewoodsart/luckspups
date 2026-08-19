-- Tracks which raw groups/litter_name text an auto-synced litter came from,
-- so publishing a new upload can find-or-create the right litter row by
-- that key rather than by display name -- name alone isn't safe to match
-- on, since an admin-created litter could coincidentally share a name with
-- an unrelated imported group and silently absorb it. Null for litters an
-- admin created directly (they never match a sync lookup).
alter table litters add column source_group_key text;
