begin;

create or replace function api.react_to_post(p_post_id uuid, p_kind text, p_active boolean default true)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  target community.posts%rowtype;
begin
  if caller_id is null or not private.is_social_eligible() or p_kind not in ('like', 'yum', 'inspired') then
    raise exception using errcode = '42501', message = 'Reaction is unavailable';
  end if;
  select * into target from community.posts where id = p_post_id and moderation_state in ('auto_passed', 'approved') and removed_at is null;
  if target.id is null or private.is_blocked_between(target.author_id) then
    raise exception using errcode = '42501', message = 'Post is unavailable';
  end if;
  if p_active then
    insert into community.reactions (post_id, user_id, kind)
    values (p_post_id, caller_id, p_kind::community.reaction_kind)
    on conflict do nothing;
    if target.author_id <> caller_id and not exists (
      select 1 from community.notifications n
      where n.recipient_id = target.author_id and n.actor_id = caller_id and n.kind = 'reaction'
        and n.object_id = target.id and n.created_at > statement_timestamp() - interval '1 hour'
    ) then
      insert into community.notifications (recipient_id, actor_id, kind, object_type, object_id)
      values (target.author_id, caller_id, 'reaction', 'post', target.id);
    end if;
  else
    delete from community.reactions where post_id = p_post_id and user_id = caller_id and kind = p_kind::community.reaction_kind;
  end if;
  return p_active;
end;
$$;

create or replace function api.report_content(p_target_type text, p_target_id uuid, p_reason text, p_detail text default '')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result_id uuid;
begin
  if caller_id is null or not private.is_social_eligible() then raise exception using errcode = '42501', message = 'Reporting is unavailable'; end if;
  if p_target_type not in ('profile', 'post', 'comment', 'review', 'collection', 'submission') then raise exception using errcode = '22023', message = 'Invalid report target'; end if;
  if p_reason not in ('harassment', 'spam', 'privacy', 'unsafe_food', 'infringement', 'sexual_or_violent', 'minor_safety', 'other') then raise exception using errcode = '22023', message = 'Invalid report reason'; end if;
  if length(coalesce(p_detail, '')) > 2000 then raise exception using errcode = '22023', message = 'Report detail is too long'; end if;
  insert into community.reports (reporter_id, target_type, target_id, reason, detail)
  values (caller_id, p_target_type, p_target_id, p_reason::community.report_reason, coalesce(p_detail, ''))
  on conflict (reporter_id, target_type, target_id, reason) do update set detail = excluded.detail
  returning id into result_id;
  return result_id;
end;
$$;

create or replace function api.submit_recipe_suggestion(
  p_title text,
  p_source_declaration text,
  p_payload jsonb,
  p_license_accepted boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result_id uuid;
begin
  if caller_id is null or not private.has_active_account() or not p_license_accepted then
    raise exception using errcode = '42501', message = 'An active account and contributor license are required';
  end if;
  if length(btrim(coalesce(p_title, ''))) not between 1 and 150 or length(btrim(coalesce(p_source_declaration, ''))) not between 10 and 3000 then
    raise exception using errcode = '22023', message = 'Suggestion fields are invalid';
  end if;
  if (select count(*) from community.submissions s where s.submitter_id = caller_id and s.created_at > statement_timestamp() - interval '1 day') >= 5 then
    raise exception using errcode = '54000', message = 'Daily suggestion limit reached';
  end if;
  insert into community.submissions (submitter_id, state, proposed_title, source_declaration, contributor_license_accepted_at, payload, submitted_at)
  values (caller_id, 'submitted', btrim(p_title), btrim(p_source_declaration), statement_timestamp(), coalesce(p_payload, '{}'::jsonb), statement_timestamp())
  returning id into result_id;
  return result_id;
end;
$$;

create or replace function api.create_private_collection(p_title text, p_description text default '')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result_id uuid;
  generated_slug text;
begin
  if caller_id is null or not private.has_active_account() then raise exception using errcode = '42501', message = 'Active account required'; end if;
  if length(btrim(coalesce(p_title, ''))) not between 1 and 100 or length(coalesce(p_description, '')) > 1000 then raise exception using errcode = '22023', message = 'Collection fields are invalid'; end if;
  if not private.has_supporter_entitlement() and (select count(*) from community.collections c where c.owner_id = caller_id) >= 5 then
    raise exception using errcode = '54000', message = 'Free accounts may create up to five private collections';
  end if;
  generated_slug := trim(both '-' from regexp_replace(lower(p_title), '[^a-z0-9]+', '-', 'g')) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  insert into community.collections (owner_id, slug, title, description, visibility)
  values (caller_id, generated_slug, btrim(p_title), coalesce(p_description, ''), 'private')
  returning id into result_id;
  return result_id;
end;
$$;

create or replace view api.my_collections
with (security_invoker = true)
as
select id, slug, title, description, visibility, created_at, updated_at
from community.collections
where owner_id = (select auth.uid());

create or replace view api.my_saves
with (security_invoker = true)
as
select s.recipe_id, r.slug, rv.title, s.offline_requested, s.saved_at
from community.saves s
join catalog.recipes r on r.id = s.recipe_id
join lateral (
  select v.title from catalog.recipe_versions v
  where v.recipe_id = r.id and v.editorial_state = 'published'
  order by v.published_at desc nulls last, v.version_number desc
  limit 1
) rv on true
where s.user_id = (select auth.uid());

create or replace view api.my_cook_logs
with (security_invoker = true)
as
select cl.id, cl.recipe_id, cl.recipe_version_id, r.slug, rv.title, cl.completed_at, cl.servings, cl.rating, cl.created_at
from community.cook_logs cl
join catalog.recipes r on r.id = cl.recipe_id
join catalog.recipe_versions rv on rv.id = cl.recipe_version_id
where cl.user_id = (select auth.uid());

revoke all on function api.react_to_post(uuid, text, boolean) from public, anon, authenticated, service_role;
grant execute on function api.react_to_post(uuid, text, boolean) to authenticated;
revoke all on function api.report_content(text, uuid, text, text) from public, anon, authenticated, service_role;
grant execute on function api.report_content(text, uuid, text, text) to authenticated;
revoke all on function api.submit_recipe_suggestion(text, text, jsonb, boolean) from public, anon, authenticated, service_role;
grant execute on function api.submit_recipe_suggestion(text, text, jsonb, boolean) to authenticated;
revoke all on function api.create_private_collection(text, text) from public, anon, authenticated, service_role;
grant execute on function api.create_private_collection(text, text) to authenticated;
grant select on api.my_collections to authenticated;
grant select on api.my_saves, api.my_cook_logs to authenticated;

commit;
