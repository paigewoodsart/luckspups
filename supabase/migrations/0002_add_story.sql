-- Free-text bio/story per animal -- rescue-authored content that doesn't
-- come from either shelter management system's export, added and edited
-- directly through the admin animal editor.
alter table animals add column story text;
