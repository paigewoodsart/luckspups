-- staged_animals.matched_animal_id had no ON DELETE behavior, which blocked
-- deleting any animal that had ever been matched during an upload review
-- (i.e. most real animals) once the admin "delete animal" feature needed it.
-- Nulling this out only affects a past, already-actioned review screen --
-- it doesn't touch animal_upload_history, which already cascades correctly.
do $$
declare
  fk_name text;
begin
  select tc.constraint_name into fk_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
  where tc.table_name = 'staged_animals'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'matched_animal_id';

  execute format('alter table staged_animals drop constraint %I', fk_name);
end $$;

alter table staged_animals
  add constraint staged_animals_matched_animal_id_fkey
  foreign key (matched_animal_id) references animals(id) on delete set null;
