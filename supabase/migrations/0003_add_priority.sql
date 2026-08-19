-- Admin-settable "first choice" flag (Audray's priority labeling) -- floats
-- an animal to the top of the public browsing list and shows a badge on
-- its tile. Defaults to false so existing/imported animals are unaffected.
alter table animals add column priority boolean not null default false;
