begin;

revoke all on table catalog.source_recipe_candidates from public, anon, authenticated;

drop policy if exists source_recipe_candidates_no_client_access
  on catalog.source_recipe_candidates;

create policy source_recipe_candidates_no_client_access
  on catalog.source_recipe_candidates
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

commit;
