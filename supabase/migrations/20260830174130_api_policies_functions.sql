begin;

set check_function_bodies = off;

create or replace function private.has_active_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from private.account_profiles ap
      where ap.user_id = (select auth.uid())
        and ap.state = 'active'
        and ap.deleted_at is null
    );
$$;

create or replace function private.is_social_eligible()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from private.account_profiles ap
      where ap.user_id = (select auth.uid())
        and ap.state = 'active'
        and ap.social_eligible
        and ap.deleted_at is null
    );
$$;

create or replace function private.has_any_role(required_roles private.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from private.role_assignments ra
      where ra.user_id = (select auth.uid())
        and ra.role = any(required_roles)
        and (ra.expires_at is null or ra.expires_at > statement_timestamp())
    );
$$;

create or replace function private.is_blocked_between(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from community.blocks b
      where (b.blocker_id = (select auth.uid()) and b.blocked_id = other_user_id)
         or (b.blocker_id = other_user_id and b.blocked_id = (select auth.uid()))
    );
$$;

create or replace function private.has_supporter_entitlement()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from private.entitlements e
      where e.user_id = (select auth.uid())
        and e.status = 'active'
        and e.effective_from <= statement_timestamp()
        and (e.lifetime or e.effective_until > statement_timestamp())
    );
$$;

create or replace function private.can_access_recipe_version(target_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_active_account()
    and exists (
      select 1
      from catalog.recipe_versions rv
      join catalog.recipes r on r.id = rv.recipe_id
      where rv.id = target_version_id
        and rv.editorial_state = 'published'
        and (
          r.access_tier = 'member'
          or (r.access_tier = 'supporter' and private.has_supporter_entitlement())
        )
    );
$$;

revoke all on function private.has_active_account() from public, anon, authenticated;
revoke all on function private.is_social_eligible() from public, anon, authenticated;
revoke all on function private.has_any_role(private.app_role[]) from public, anon, authenticated;
revoke all on function private.is_blocked_between(uuid) from public, anon, authenticated;
revoke all on function private.has_supporter_entitlement() from public, anon, authenticated;
revoke all on function private.can_access_recipe_version(uuid) from public, anon, authenticated;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.reject_immutable_change() from public, anon, authenticated;
revoke all on function private.protect_published_recipe_version() from public, anon, authenticated;
revoke all on function catalog.join_text_array(text[]) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.has_active_account() to authenticated;
grant execute on function private.is_social_eligible() to authenticated;
grant execute on function private.has_any_role(private.app_role[]) to authenticated;
grant execute on function private.is_blocked_between(uuid) to authenticated;
grant execute on function private.has_supporter_entitlement() to authenticated;
grant execute on function private.can_access_recipe_version(uuid) to authenticated;
grant usage on schema private to anon;
grant execute on function private.has_any_role(private.app_role[]) to anon;
grant execute on function private.is_blocked_between(uuid) to anon;

do $do$
declare
  table_record record;
begin
  for table_record in
    select schemaname, tablename
    from pg_catalog.pg_tables
    where schemaname in ('catalog', 'community', 'private')
  loop
    execute format('alter table %I.%I enable row level security', table_record.schemaname, table_record.tablename);
    execute format('alter table %I.%I force row level security', table_record.schemaname, table_record.tablename);
  end loop;
end
$do$;

do $do$
declare
  table_record record;
begin
  for table_record in
    select tablename
    from pg_catalog.pg_tables
    where schemaname = 'catalog'
  loop
    execute format(
      'create policy %I on catalog.%I for all to authenticated using ((select private.has_any_role(array[''editor'', ''culinary_reviewer'', ''rights_reviewer'', ''admin'', ''owner'']::private.app_role[]))) with check ((select private.has_any_role(array[''editor'', ''culinary_reviewer'', ''rights_reviewer'', ''admin'', ''owner'']::private.app_role[])))',
      table_record.tablename || '_staff_all',
      table_record.tablename
    );
  end loop;
end
$do$;

create policy franchises_published_read on catalog.franchises for select to anon, authenticated
using (exists (
  select 1 from catalog.works w
  join catalog.appearances a on a.work_id = w.id and a.verified_at is not null
  join catalog.recipes r on r.dish_id = a.dish_id
  join catalog.recipe_versions rv on rv.recipe_id = r.id and rv.editorial_state = 'published'
  where w.franchise_id = franchises.id
));

create policy works_published_read on catalog.works for select to anon, authenticated
using (exists (
  select 1 from catalog.appearances a
  join catalog.recipes r on r.dish_id = a.dish_id
  join catalog.recipe_versions rv on rv.recipe_id = r.id and rv.editorial_state = 'published'
  where a.work_id = works.id and a.verified_at is not null
));

create policy work_entries_verified_read on catalog.work_entries for select to anon, authenticated
using (exists (select 1 from catalog.appearances a where a.work_entry_id = work_entries.id and a.verified_at is not null));

create policy locations_verified_read on catalog.locations for select to anon, authenticated
using (exists (select 1 from catalog.appearances a where a.location_id = locations.id and a.verified_at is not null));

create policy dishes_published_read on catalog.dishes for select to anon, authenticated
using (exists (
  select 1 from catalog.recipes r
  join catalog.recipe_versions rv on rv.recipe_id = r.id and rv.editorial_state = 'published'
  where r.dish_id = dishes.id
));

create policy appearances_verified_read on catalog.appearances for select to anon, authenticated
using (verified_at is not null and exists (
  select 1 from catalog.recipes r
  join catalog.recipe_versions rv on rv.recipe_id = r.id and rv.editorial_state = 'published'
  where r.dish_id = appearances.dish_id
));

create policy recipes_published_read on catalog.recipes for select to anon, authenticated
using (exists (select 1 from catalog.recipe_versions rv where rv.recipe_id = recipes.id and rv.editorial_state = 'published'));

create policy recipe_versions_published_read on catalog.recipe_versions for select to anon, authenticated
using (editorial_state = 'published');

create policy units_public_read on catalog.units for select to anon, authenticated using (true);
create policy ingredients_published_read on catalog.ingredients for select to authenticated
using (exists (
  select 1 from catalog.recipe_ingredients ri
  where ri.ingredient_id = ingredients.id and private.can_access_recipe_version(ri.recipe_version_id)
));
create policy recipe_ingredients_authorized_read on catalog.recipe_ingredients for select to authenticated
using (private.can_access_recipe_version(recipe_version_id));
create policy recipe_steps_authorized_read on catalog.recipe_steps for select to authenticated
using (private.can_access_recipe_version(recipe_version_id));
create policy equipment_authorized_read on catalog.equipment for select to authenticated
using (exists (
  select 1 from catalog.recipe_equipment re
  where re.equipment_id = equipment.id and private.can_access_recipe_version(re.recipe_version_id)
));
create policy recipe_equipment_authorized_read on catalog.recipe_equipment for select to authenticated
using (private.can_access_recipe_version(recipe_version_id));
create policy tags_published_read on catalog.tags for select to anon, authenticated
using (exists (
  select 1 from catalog.recipe_tags rt
  join catalog.recipe_versions rv on rv.id = rt.recipe_version_id and rv.editorial_state = 'published'
  where rt.tag_id = tags.id
));
create policy recipe_tags_published_read on catalog.recipe_tags for select to anon, authenticated
using (exists (select 1 from catalog.recipe_versions rv where rv.id = recipe_tags.recipe_version_id and rv.editorial_state = 'published'));
create policy allergens_public_read on catalog.allergens for select to anon, authenticated using (true);
create policy ingredient_allergens_authorized_read on catalog.ingredient_allergens for select to authenticated
using (exists (
  select 1 from catalog.recipe_ingredients ri
  where ri.ingredient_id = ingredient_allergens.ingredient_id and private.can_access_recipe_version(ri.recipe_version_id)
));
create policy recipe_allergens_authorized_read on catalog.recipe_allergens for select to authenticated
using (private.can_access_recipe_version(recipe_version_id));
create policy regional_substitutions_authorized_read on catalog.regional_substitutions for select to authenticated
using (exists (
  select 1 from catalog.recipe_ingredients ri
  where ri.ingredient_id = regional_substitutions.ingredient_id and private.can_access_recipe_version(ri.recipe_version_id)
));
create policy unit_conversions_authorized_read on catalog.unit_conversions for select to authenticated using (private.has_active_account());
create policy media_assets_approved_read on catalog.media_assets for select to anon, authenticated
using (state = 'approved' and rights_status in ('licensed', 'creator_permission', 'public_domain', 'original_editorial'));
create policy recipe_media_published_read on catalog.recipe_media for select to anon, authenticated
using (exists (select 1 from catalog.recipe_versions rv where rv.id = recipe_media.recipe_version_id and rv.editorial_state = 'published'));
create policy catalog_collections_published_read on catalog.collections for select to anon, authenticated
using (published_at is not null);
create policy collection_recipes_published_read on catalog.collection_recipes for select to anon, authenticated
using (exists (select 1 from catalog.collections c where c.id = collection_recipes.collection_id and c.published_at is not null));

create policy profiles_visible_read on community.profiles for select to anon, authenticated
using (
  profile_visibility = 'public'
  or user_id = (select auth.uid())
  or (
    profile_visibility = 'followers'
    and exists (select 1 from community.follows f where f.followed_id = profiles.user_id and f.follower_id = (select auth.uid()))
  )
  and (auth.uid() is null or not private.is_blocked_between(user_id))
);
create policy profiles_owner_insert on community.profiles for insert to authenticated
with check (user_id = (select auth.uid()) and private.has_active_account());
create policy profiles_owner_update on community.profiles for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy preferences_owner_all on community.preferences for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and private.has_active_account());

create policy blocks_owner_read on community.blocks for select to authenticated using (blocker_id = (select auth.uid()));
create policy blocks_owner_insert on community.blocks for insert to authenticated
with check (blocker_id = (select auth.uid()) and private.is_social_eligible());
create policy blocks_owner_delete on community.blocks for delete to authenticated using (blocker_id = (select auth.uid()));

create policy follows_visible_read on community.follows for select to authenticated
using ((follower_id = (select auth.uid()) or followed_id = (select auth.uid())) and not private.is_blocked_between(case when follower_id = (select auth.uid()) then followed_id else follower_id end));
create policy follows_owner_insert on community.follows for insert to authenticated
with check (follower_id = (select auth.uid()) and private.is_social_eligible() and not private.is_blocked_between(followed_id));
create policy follows_owner_delete on community.follows for delete to authenticated using (follower_id = (select auth.uid()));

create policy posts_visible_read on community.posts for select to anon, authenticated
using (
  (
    (moderation_state in ('auto_passed', 'approved') and removed_at is null and published_at is not null)
    or author_id = (select auth.uid())
    or private.has_any_role(array['moderator', 'admin', 'owner']::private.app_role[])
  )
  and (
    visibility = 'public'
    or author_id = (select auth.uid())
    or (visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = posts.author_id and f.follower_id = (select auth.uid())))
  )
  and (auth.uid() is null or not private.is_blocked_between(author_id))
);
create policy posts_owner_insert on community.posts for insert to authenticated
with check (author_id = (select auth.uid()) and private.is_social_eligible());
create policy posts_owner_update on community.posts for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy posts_owner_delete on community.posts for delete to authenticated using (author_id = (select auth.uid()));

create policy post_media_visible_read on community.post_media for select to anon, authenticated
using (state in ('auto_passed', 'approved') and exists (select 1 from community.posts p where p.id = post_media.post_id));
create policy post_media_owner_read on community.post_media for select to authenticated
using (exists (select 1 from community.posts p where p.id = post_media.post_id and p.author_id = (select auth.uid())));

create policy comments_visible_read on community.comments for select to anon, authenticated
using (
  ((moderation_state in ('auto_passed', 'approved') and removed_at is null) or author_id = (select auth.uid()) or private.has_any_role(array['moderator', 'admin', 'owner']::private.app_role[]))
  and exists (select 1 from community.posts p where p.id = comments.post_id)
  and (auth.uid() is null or not private.is_blocked_between(author_id))
);
create policy comments_owner_insert on community.comments for insert to authenticated
with check (author_id = (select auth.uid()) and private.is_social_eligible() and not exists (select 1 from community.posts p where p.id = comments.post_id and private.is_blocked_between(p.author_id)));
create policy comments_owner_update on community.comments for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy comments_owner_delete on community.comments for delete to authenticated using (author_id = (select auth.uid()));

create policy reactions_visible_read on community.reactions for select to anon, authenticated
using (exists (select 1 from community.posts p where p.id = reactions.post_id));
create policy reactions_owner_insert on community.reactions for insert to authenticated
with check (user_id = (select auth.uid()) and private.is_social_eligible() and exists (select 1 from community.posts p where p.id = reactions.post_id and not private.is_blocked_between(p.author_id)));
create policy reactions_owner_delete on community.reactions for delete to authenticated using (user_id = (select auth.uid()));

create policy reviews_visible_read on community.reviews for select to anon, authenticated
using (((moderation_state in ('auto_passed', 'approved') and removed_at is null) or author_id = (select auth.uid())) and (auth.uid() is null or not private.is_blocked_between(author_id)));
create policy reviews_owner_insert on community.reviews for insert to authenticated
with check (author_id = (select auth.uid()) and private.is_social_eligible());
create policy reviews_owner_update on community.reviews for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy reviews_owner_delete on community.reviews for delete to authenticated using (author_id = (select auth.uid()));

create policy user_collections_visible_read on community.collections for select to anon, authenticated
using (
  visibility = 'public'
  or owner_id = (select auth.uid())
  or (visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = collections.owner_id and f.follower_id = (select auth.uid())))
);
create policy user_collections_owner_all on community.collections for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and private.has_active_account());
create policy collection_items_visible_read on community.collection_items for select to anon, authenticated
using (exists (select 1 from community.collections c where c.id = collection_items.collection_id));
create policy collection_items_owner_all on community.collection_items for all to authenticated
using (exists (select 1 from community.collections c where c.id = collection_items.collection_id and c.owner_id = (select auth.uid())))
with check (exists (select 1 from community.collections c where c.id = collection_items.collection_id and c.owner_id = (select auth.uid())));

create policy saves_owner_all on community.saves for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and private.has_active_account());
create policy cook_logs_owner_read on community.cook_logs for select to authenticated using (user_id = (select auth.uid()));
create policy cook_logs_owner_update on community.cook_logs for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_owner_read on community.notifications for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_owner_update on community.notifications for update to authenticated
using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy reports_owner_insert on community.reports for insert to authenticated
with check (reporter_id = (select auth.uid()) and private.is_social_eligible());
create policy reports_owner_read on community.reports for select to authenticated
using (reporter_id = (select auth.uid()) or private.has_any_role(array['moderator', 'admin', 'owner']::private.app_role[]));
create policy submissions_owner_all on community.submissions for all to authenticated
using (submitter_id = (select auth.uid()) or private.has_any_role(array['moderator', 'editor', 'admin', 'owner']::private.app_role[]))
with check (submitter_id = (select auth.uid()) or private.has_any_role(array['moderator', 'editor', 'admin', 'owner']::private.app_role[]));

create policy account_profiles_owner_read on private.account_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy account_profiles_staff_all on private.account_profiles for all to authenticated
using (private.has_any_role(array['admin', 'owner']::private.app_role[])) with check (private.has_any_role(array['admin', 'owner']::private.app_role[]));
create policy role_assignments_admin_all on private.role_assignments for all to authenticated
using (private.has_any_role(array['owner']::private.app_role[])) with check (private.has_any_role(array['owner']::private.app_role[]));
create policy consent_records_owner_read on private.consent_records for select to authenticated using (user_id = (select auth.uid()));
create policy moderation_actions_staff_read on private.moderation_actions for select to authenticated
using (private.has_any_role(array['moderator', 'admin', 'owner']::private.app_role[]));
create policy audit_logs_staff_read on private.audit_logs for select to authenticated
using (private.has_any_role(array['admin', 'owner']::private.app_role[]));
create policy user_progress_owner_read on private.user_progress for select to authenticated using (user_id = (select auth.uid()));
create policy quest_assignments_owner_read on private.quest_assignments for select to authenticated using (user_id = (select auth.uid()));
create policy user_achievements_owner_read on private.user_achievements for select to authenticated using (user_id = (select auth.uid()));
create policy entitlements_owner_read on private.entitlements for select to authenticated using (user_id = (select auth.uid()));
create policy subscriptions_owner_read on private.subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy payment_customers_owner_read on private.payment_customers for select to authenticated using (user_id = (select auth.uid()));
create policy offer_claims_owner_read on private.offer_claims for select to authenticated using (user_id = (select auth.uid()));
create policy offers_active_read on private.offers for select to authenticated using (active);
create policy quests_active_read on private.quests for select to authenticated
using (active_from <= statement_timestamp() and (active_until is null or active_until > statement_timestamp()));
create policy achievements_read on private.achievements for select to authenticated using (true);
create policy age_policy_staff_read on private.age_policy_rules for select to authenticated
using (private.has_any_role(array['admin', 'owner']::private.app_role[]));

create or replace function private.award_game_event(
  target_user_id uuid,
  target_event_type text,
  target_entity_id uuid,
  target_idempotency_key text,
  target_metadata jsonb default '{}'
)
returns table(game_event_id uuid, awarded_xp integer, total_xp bigint, was_duplicate boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_rule private.xp_rules%rowtype;
  existing_event_id uuid;
  existing_award integer;
  event_id uuid;
  multiplier_value numeric(5,2) := 1;
  computed_award integer := 0;
  today_awarded integer := 0;
  progress_total bigint := 0;
  last_awarded_at timestamptz;
begin
  if target_user_id is null or target_user_id <> (select auth.uid()) then
    raise exception using errcode = '42501', message = 'Cannot award XP for another user';
  end if;
  if not private.has_active_account() then
    raise exception using errcode = '42501', message = 'An active account is required';
  end if;
  if length(target_idempotency_key) not between 8 and 128 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_user_id::text, 4104));

  select ge.id, xl.awarded_xp
    into existing_event_id, existing_award
  from private.game_events ge
  left join private.xp_ledger xl on xl.game_event_id = ge.id
  where ge.user_id = target_user_id and ge.idempotency_key = target_idempotency_key;

  if existing_event_id is not null then
    select coalesce(up.total_xp, 0) into progress_total from private.user_progress up where up.user_id = target_user_id;
    return query select existing_event_id, coalesce(existing_award, 0), coalesce(progress_total, 0), true;
    return;
  end if;

  select xr.* into active_rule
  from private.xp_rules xr
  where xr.event_type = target_event_type
    and xr.active_from <= statement_timestamp()
    and (xr.active_until is null or xr.active_until > statement_timestamp())
  order by xr.version desc
  limit 1;

  if active_rule.id is null then
    raise exception using errcode = '22023', message = 'No active XP rule for event';
  end if;

  insert into private.game_events (user_id, event_type, entity_id, idempotency_key, metadata)
  values (target_user_id, target_event_type, target_entity_id, target_idempotency_key, coalesce(target_metadata, '{}'))
  returning id into event_id;

  select max(xl.awarded_at) into last_awarded_at
  from private.xp_ledger xl
  join private.game_events ge on ge.id = xl.game_event_id
  where xl.user_id = target_user_id and ge.event_type = target_event_type;

  if active_rule.cooldown_seconds = 0
     or last_awarded_at is null
     or last_awarded_at <= statement_timestamp() - pg_catalog.make_interval(secs => active_rule.cooldown_seconds) then
    if private.has_supporter_entitlement() then
      multiplier_value := active_rule.supporter_multiplier;
    end if;
    computed_award := round(active_rule.base_xp * multiplier_value);

    if active_rule.daily_cap is not null then
      select coalesce(sum(xl.awarded_xp), 0)::integer into today_awarded
      from private.xp_ledger xl
      join private.game_events ge on ge.id = xl.game_event_id
      where xl.user_id = target_user_id
        and ge.event_type = target_event_type
        and xl.awarded_at >= date_trunc('day', statement_timestamp());
      computed_award := greatest(0, least(computed_award, active_rule.daily_cap - today_awarded));
    end if;
  end if;

  insert into private.xp_ledger (user_id, game_event_id, xp_rule_id, base_xp, multiplier, awarded_xp, reason)
  values (target_user_id, event_id, active_rule.id, active_rule.base_xp, multiplier_value, computed_award, target_event_type);

  insert into private.user_progress (user_id, total_xp, level, current_streak, longest_streak, last_cook_on)
  values (
    target_user_id,
    computed_award,
    floor(sqrt(computed_award::numeric / 100))::integer + 1,
    case when target_event_type = 'cook_completed' then 1 else 0 end,
    case when target_event_type = 'cook_completed' then 1 else 0 end,
    case when target_event_type = 'cook_completed' then current_date else null end
  )
  on conflict (user_id) do update set
    total_xp = private.user_progress.total_xp + excluded.total_xp,
    level = floor(sqrt((private.user_progress.total_xp + excluded.total_xp)::numeric / 100))::integer + 1,
    current_streak = case
      when target_event_type <> 'cook_completed' then private.user_progress.current_streak
      when private.user_progress.last_cook_on = current_date then private.user_progress.current_streak
      when private.user_progress.last_cook_on = current_date - 1 then private.user_progress.current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      private.user_progress.longest_streak,
      case
        when target_event_type <> 'cook_completed' then private.user_progress.current_streak
        when private.user_progress.last_cook_on = current_date then private.user_progress.current_streak
        when private.user_progress.last_cook_on = current_date - 1 then private.user_progress.current_streak + 1
        else 1
      end
    ),
    last_cook_on = case when target_event_type = 'cook_completed' then current_date else private.user_progress.last_cook_on end,
    updated_at = statement_timestamp()
  returning private.user_progress.total_xp into progress_total;

  return query select event_id, computed_award, progress_total, false;
end;
$$;
revoke all on function private.award_game_event(uuid, text, uuid, text, jsonb) from public, anon, authenticated;

create or replace function api.complete_cook(
  p_recipe_id uuid,
  p_recipe_version_id uuid,
  p_idempotency_key text,
  p_servings numeric default null
)
returns table(cook_log_id uuid, awarded_xp integer, total_xp bigint, was_duplicate boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  log_id uuid;
  inserted_count integer;
  award record;
begin
  if caller_id is null or not private.has_active_account() then
    raise exception using errcode = '42501', message = 'An active account is required';
  end if;
  if not private.can_access_recipe_version(p_recipe_version_id) then
    raise exception using errcode = '42501', message = 'Recipe version is unavailable';
  end if;
  if not exists (
    select 1 from catalog.recipe_versions rv
    where rv.id = p_recipe_version_id and rv.recipe_id = p_recipe_id and rv.editorial_state = 'published'
  ) then
    raise exception using errcode = '22023', message = 'Recipe/version mismatch';
  end if;

  insert into community.cook_logs (user_id, recipe_id, recipe_version_id, idempotency_key, started_at, completed_at, servings)
  values (caller_id, p_recipe_id, p_recipe_version_id, p_idempotency_key, statement_timestamp(), statement_timestamp(), p_servings)
  on conflict (user_id, idempotency_key) do nothing
  returning id into log_id;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    select cl.id into log_id from community.cook_logs cl where cl.user_id = caller_id and cl.idempotency_key = p_idempotency_key;
  end if;

  select * into award from private.award_game_event(caller_id, 'cook_completed', p_recipe_id, 'cook:' || p_idempotency_key, jsonb_build_object('cook_log_id', log_id, 'recipe_version_id', p_recipe_version_id));
  return query select log_id, award.awarded_xp, award.total_xp, (inserted_count = 0 or award.was_duplicate);
end;
$$;

create or replace function api.claim_supporter_offer(offer_code text)
returns table(claim_id uuid, amount_minor integer, currency text, gateway text, checkout_expires_at timestamptz, already_claimed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  selected_offer private.offers%rowtype;
  result_claim private.offer_claims%rowtype;
  did_insert boolean := false;
begin
  if caller_id is null or not private.has_active_account() then
    raise exception using errcode = '42501', message = 'An active account is required';
  end if;
  select o.* into selected_offer
  from private.offers o
  where o.code = offer_code
    and o.active
    and (o.campaign_starts_at is null or o.campaign_starts_at <= statement_timestamp())
    and (o.campaign_ends_at is null or o.campaign_ends_at > statement_timestamp());
  if selected_offer.id is null then
    raise exception using errcode = '22023', message = 'Offer is unavailable';
  end if;

  insert into private.offer_claims (user_id, offer_id, amount_minor, currency, checkout_expires_at)
  values (caller_id, selected_offer.id, selected_offer.founding_amount_minor, selected_offer.currency, statement_timestamp() + interval '15 minutes')
  on conflict (user_id, offer_id) do nothing
  returning * into result_claim;
  did_insert := found;

  if not did_insert then
    select oc.* into result_claim from private.offer_claims oc where oc.user_id = caller_id and oc.offer_id = selected_offer.id;
  end if;

  return query select result_claim.id, result_claim.amount_minor, result_claim.currency::text, selected_offer.gateway::text, result_claim.checkout_expires_at, not did_insert;
end;
$$;

create or replace function api.save_recipe(p_recipe_id uuid, p_offline_requested boolean default false)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  private_collection_count integer;
begin
  if caller_id is null or not private.has_active_account() then
    raise exception using errcode = '42501', message = 'An active account is required';
  end if;
  if not exists (select 1 from catalog.recipes r where r.id = p_recipe_id) then
    raise exception using errcode = '22023', message = 'Recipe is unavailable';
  end if;
  if p_offline_requested and not private.has_supporter_entitlement() then
    select count(*) into private_collection_count from community.saves s where s.user_id = caller_id and s.offline_requested;
    if private_collection_count >= 5 then
      raise exception using errcode = '22023', message = 'Free offline save limit reached';
    end if;
  end if;
  insert into community.saves (user_id, recipe_id, offline_requested)
  values (caller_id, p_recipe_id, p_offline_requested)
  on conflict (user_id, recipe_id) do update set offline_requested = excluded.offline_requested, saved_at = statement_timestamp();
  return true;
end;
$$;

create or replace function api.follow_user(target_user_id uuid, should_follow boolean default true)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare caller_id uuid := (select auth.uid());
begin
  if caller_id is null or not private.is_social_eligible() or target_user_id = caller_id or private.is_blocked_between(target_user_id) then
    raise exception using errcode = '42501', message = 'Follow action is unavailable';
  end if;
  if should_follow then
    insert into community.follows (follower_id, followed_id) values (caller_id, target_user_id) on conflict do nothing;
  else
    delete from community.follows where follower_id = caller_id and followed_id = target_user_id;
  end if;
  return should_follow;
end;
$$;

create or replace function api.block_user(target_user_id uuid, should_block boolean default true)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare caller_id uuid := (select auth.uid());
begin
  if caller_id is null or not private.is_social_eligible() or target_user_id = caller_id then
    raise exception using errcode = '42501', message = 'Block action is unavailable';
  end if;
  if should_block then
    insert into community.blocks (blocker_id, blocked_id) values (caller_id, target_user_id) on conflict do nothing;
    delete from community.follows where (follower_id = caller_id and followed_id = target_user_id) or (follower_id = target_user_id and followed_id = caller_id);
  else
    delete from community.blocks where blocker_id = caller_id and blocked_id = target_user_id;
  end if;
  return should_block;
end;
$$;

create or replace function api.mark_notification_read(p_notification_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update community.notifications set read_at = coalesce(read_at, statement_timestamp())
  where id = p_notification_id and recipient_id = (select auth.uid());
  return found;
end;
$$;

create or replace function api.complete_age_gate(p_country_code text, p_date_of_birth date)
returns table(account_state text, minimum_age integer, social_eligible boolean, advertising_eligible boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  normalized_country text := upper(trim(p_country_code));
  rule private.age_policy_rules%rowtype;
  age_years integer;
  resulting_state private.account_state;
  can_socialize boolean;
  can_receive_personalized_ads boolean;
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'Authentication is required';
  end if;
  if normalized_country !~ '^[A-Z]{2}$' or p_date_of_birth is null or p_date_of_birth > current_date then
    raise exception using errcode = '22023', message = 'Invalid age declaration';
  end if;

  select apr.* into rule
  from private.age_policy_rules apr
  where apr.country_code in (normalized_country, '*')
    and apr.effective_from <= current_date
  order by (apr.country_code = normalized_country) desc, apr.effective_from desc
  limit 1;

  if rule.country_code is null then
    raise exception using errcode = '55000', message = 'Age policy is not configured';
  end if;

  age_years := extract(year from age(current_date, p_date_of_birth))::integer;
  resulting_state := case when age_years >= rule.minimum_account_age then 'active'::private.account_state else 'restricted'::private.account_state end;
  can_socialize := resulting_state = 'active' and age_years >= greatest(14, rule.minimum_social_age);
  can_receive_personalized_ads := resulting_state = 'active' and age_years >= 18;

  insert into private.account_profiles (
    user_id, country_code, date_of_birth, state, age_rule_version,
    social_eligible, advertising_eligible, accepted_at
  ) values (
    caller_id, normalized_country, p_date_of_birth, resulting_state, rule.policy_version,
    can_socialize, can_receive_personalized_ads,
    case when resulting_state = 'active' then statement_timestamp() else null end
  )
  on conflict (user_id) do update set
    country_code = excluded.country_code,
    date_of_birth = excluded.date_of_birth,
    state = excluded.state,
    age_rule_version = excluded.age_rule_version,
    social_eligible = excluded.social_eligible,
    advertising_eligible = excluded.advertising_eligible,
    accepted_at = excluded.accepted_at,
    updated_at = statement_timestamp();

  insert into private.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (caller_id, 'account.age_declaration', 'account', caller_id::text, jsonb_build_object('country_code', normalized_country, 'policy_version', rule.policy_version, 'eligible', resulting_state = 'active'));

  return query select resulting_state::text, rule.minimum_account_age::integer, can_socialize, can_receive_personalized_ads;
end;
$$;

create or replace function api.publish_recipe_version(p_recipe_version_id uuid, p_request_id text default null)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  target_recipe_id uuid;
  target_dish_id uuid;
  published_time timestamptz := statement_timestamp();
begin
  if caller_id is null or not private.has_any_role(array['editor', 'admin', 'owner']::private.app_role[]) then
    raise exception using errcode = '42501', message = 'Editorial publication permission is required';
  end if;

  select rv.recipe_id, r.dish_id into target_recipe_id, target_dish_id
  from catalog.recipe_versions rv
  join catalog.recipes r on r.id = rv.recipe_id
  where rv.id = p_recipe_version_id
    and rv.editorial_state = 'rights_cleared'
  for update of rv;

  if target_recipe_id is null then
    raise exception using errcode = '22023', message = 'Recipe version must be rights-cleared before publication';
  end if;
  if not exists (select 1 from catalog.recipe_ingredients ri where ri.recipe_version_id = p_recipe_version_id) then
    raise exception using errcode = '23514', message = 'Publication requires structured ingredients';
  end if;
  if not exists (select 1 from catalog.recipe_steps rs where rs.recipe_version_id = p_recipe_version_id) then
    raise exception using errcode = '23514', message = 'Publication requires cooking steps';
  end if;
  if not exists (select 1 from catalog.appearances a where a.dish_id = target_dish_id and a.verified_at is not null) then
    raise exception using errcode = '23514', message = 'Publication requires verified occurrence evidence';
  end if;
  if not exists (select 1 from catalog.test_sessions ts where ts.recipe_version_id = p_recipe_version_id and ts.outcome = 'approved') then
    raise exception using errcode = '23514', message = 'Publication requires an approved kitchen test';
  end if;
  if exists (
    select 1
    from unnest(array['editorial', 'culinary', 'allergen', 'rights', 'media']::catalog.review_kind[]) required(kind)
    where not exists (
      select 1 from catalog.editorial_reviews er
      where er.recipe_version_id = p_recipe_version_id and er.kind = required.kind and er.decision = 'approved'
    )
  ) then
    raise exception using errcode = '23514', message = 'Publication requires editorial, culinary, allergen, rights, and media approvals';
  end if;
  if not exists (
    select 1
    from catalog.recipe_media rm
    join catalog.media_assets ma on ma.id = rm.media_asset_id
    where rm.recipe_version_id = p_recipe_version_id
      and rm.purpose = 'hero'
      and ma.state = 'approved'
      and ma.rights_status in ('licensed', 'creator_permission', 'public_domain', 'original_editorial')
  ) then
    raise exception using errcode = '23514', message = 'Publication requires approved rights-cleared hero media';
  end if;
  if not exists (
    select 1 from catalog.rights_records rr
    where rr.recipe_version_id = p_recipe_version_id
      and rr.status in ('licensed', 'creator_permission', 'public_domain', 'original_editorial')
      and (rr.expires_at is null or rr.expires_at > published_time)
  ) then
    raise exception using errcode = '23514', message = 'Publication requires an active rights record';
  end if;

  update catalog.recipe_versions
  set editorial_state = 'published', published_at = published_time
  where id = p_recipe_version_id;

  insert into private.audit_logs(actor_id, action, target_type, target_id, request_id, metadata)
  values (caller_id, 'catalog.recipe.publish', 'recipe_version', p_recipe_version_id::text, p_request_id, jsonb_build_object('recipe_id', target_recipe_id));

  return published_time;
end;
$$;

create or replace function api.get_checkout_claim(p_claim_id uuid)
returns table(
  claim_id uuid,
  offer_code text,
  amount_minor integer,
  currency text,
  gateway text,
  plan_interval text,
  checkout_expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    oc.id,
    o.code,
    oc.amount_minor,
    oc.currency::text,
    o.gateway::text,
    o.interval::text,
    oc.checkout_expires_at
  from private.offer_claims oc
  join private.offers o on o.id = oc.offer_id
  where oc.id = p_claim_id
    and oc.user_id = (select auth.uid())
    and oc.consumed_at is null
    and oc.checkout_expires_at > statement_timestamp()
    and private.has_active_account();
$$;

create or replace function api.consume_checkout_claim(
  p_claim_id uuid,
  p_user_id uuid,
  p_external_checkout_id text
)
returns table(
  claim_id uuid,
  offer_code text,
  amount_minor integer,
  currency text,
  gateway text,
  plan_interval text,
  checkout_expires_at timestamptz,
  already_consumed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_claim private.offer_claims%rowtype;
  selected_offer private.offers%rowtype;
  was_consumed boolean := false;
begin
  if p_user_id is null or p_external_checkout_id is null or length(p_external_checkout_id) not between 3 and 255 then
    raise exception using errcode = '22023', message = 'Invalid checkout claim consumption request';
  end if;

  select oc.* into locked_claim
  from private.offer_claims oc
  where oc.id = p_claim_id and oc.user_id = p_user_id
  for update;

  if locked_claim.id is null then
    raise exception using errcode = '42501', message = 'Checkout claim is unavailable';
  end if;
  if locked_claim.checkout_expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'Checkout claim has expired';
  end if;
  if locked_claim.consumed_at is not null then
    if locked_claim.external_checkout_id <> p_external_checkout_id then
      raise exception using errcode = '23505', message = 'Checkout claim was already consumed';
    end if;
    was_consumed := true;
  else
    update private.offer_claims oc
    set consumed_at = statement_timestamp(), external_checkout_id = p_external_checkout_id
    where oc.id = locked_claim.id
    returning * into locked_claim;
  end if;

  select o.* into selected_offer from private.offers o where o.id = locked_claim.offer_id;
  return query select
    locked_claim.id,
    selected_offer.code,
    locked_claim.amount_minor,
    locked_claim.currency::text,
    selected_offer.gateway::text,
    selected_offer.interval::text,
    locked_claim.checkout_expires_at,
    was_consumed;
end;
$$;

create or replace function api.record_verified_webhook(
  p_gateway private.payment_gateway,
  p_external_event_id text,
  p_event_type text,
  p_external_occurred_at timestamptz,
  p_raw_payload jsonb,
  p_signature_verified boolean
)
returns table(webhook_event_id uuid, processing_state text, was_duplicate boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_event private.webhook_events%rowtype;
  inserted boolean := false;
begin
  if not p_signature_verified then
    raise exception using errcode = '42501', message = 'Webhook signature was not verified';
  end if;
  if length(p_external_event_id) not between 3 and 255 or length(p_event_type) not between 1 and 255 or p_external_occurred_at is null then
    raise exception using errcode = '22023', message = 'Invalid webhook envelope';
  end if;

  insert into private.webhook_events (
    gateway, external_event_id, event_type, external_occurred_at,
    signature_verified, raw_payload
  ) values (
    p_gateway, p_external_event_id, p_event_type, p_external_occurred_at,
    true, coalesce(p_raw_payload, '{}')
  )
  on conflict (gateway, external_event_id) do nothing
  returning * into selected_event;
  inserted := found;

  if not inserted then
    select we.* into selected_event
    from private.webhook_events we
    where we.gateway = p_gateway and we.external_event_id = p_external_event_id;
  end if;

  return query select selected_event.id, selected_event.state::text, not inserted;
end;
$$;

create or replace function api.apply_entitlement_webhook(
  p_webhook_event_id uuid,
  p_user_id uuid,
  p_external_customer_id text,
  p_external_purchase_id text,
  p_plan private.plan_interval,
  p_status private.entitlement_status,
  p_effective_from timestamptz,
  p_effective_until timestamptz,
  p_lifetime boolean,
  p_revoked_reason text default null
)
returns table(entitlement_id uuid, applied boolean, processing_state text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_event private.webhook_events%rowtype;
  result_id uuid;
  did_apply boolean := false;
begin
  select we.* into locked_event
  from private.webhook_events we
  where we.id = p_webhook_event_id
  for update;

  if locked_event.id is null or not locked_event.signature_verified then
    raise exception using errcode = '42501', message = 'Verified webhook event is required';
  end if;
  if p_user_id is null or length(p_external_purchase_id) not between 3 and 255 then
    raise exception using errcode = '22023', message = 'Invalid entitlement event';
  end if;
  if p_lifetime <> (p_plan = 'lifetime') then
    raise exception using errcode = '23514', message = 'Lifetime flag and plan do not match';
  end if;
  if (p_lifetime and p_effective_until is not null) or (not p_lifetime and p_effective_until is null) then
    raise exception using errcode = '23514', message = 'Entitlement expiry does not match plan';
  end if;

  insert into private.entitlements (
    user_id, gateway, external_customer_id, external_purchase_id, plan, status,
    effective_from, effective_until, lifetime, source_webhook_event_id,
    source_occurred_at, revoked_reason
  ) values (
    p_user_id, locked_event.gateway, p_external_customer_id, p_external_purchase_id, p_plan, p_status,
    p_effective_from, p_effective_until, p_lifetime, locked_event.id,
    locked_event.external_occurred_at, p_revoked_reason
  )
  on conflict (gateway, external_purchase_id) do update set
    user_id = excluded.user_id,
    external_customer_id = excluded.external_customer_id,
    plan = excluded.plan,
    status = excluded.status,
    effective_from = excluded.effective_from,
    effective_until = excluded.effective_until,
    lifetime = excluded.lifetime,
    source_webhook_event_id = excluded.source_webhook_event_id,
    source_occurred_at = excluded.source_occurred_at,
    revoked_reason = excluded.revoked_reason,
    updated_at = statement_timestamp()
  where excluded.source_occurred_at >= private.entitlements.source_occurred_at
  returning id into result_id;
  did_apply := found;

  if not did_apply then
    select e.id into result_id
    from private.entitlements e
    where e.gateway = locked_event.gateway and e.external_purchase_id = p_external_purchase_id;
  end if;

  update private.webhook_events
  set
    state = case when did_apply then 'processed'::private.webhook_state else 'ignored'::private.webhook_state end,
    attempts = attempts + 1,
    processed_at = statement_timestamp(),
    last_error = null
  where id = locked_event.id;

  return query select result_id, did_apply, case when did_apply then 'processed'::text else 'ignored'::text end;
end;
$$;

create or replace function api.entitlement_reconciliation_candidates(
  p_before timestamptz default statement_timestamp(),
  p_result_limit integer default 100
)
returns table(
  entitlement_id uuid,
  user_id uuid,
  gateway text,
  external_purchase_id text,
  plan text,
  status text,
  effective_until timestamptz,
  source_occurred_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.user_id,
    e.gateway::text,
    e.external_purchase_id,
    e.plan::text,
    e.status::text,
    e.effective_until,
    e.source_occurred_at
  from private.entitlements e
  where not e.lifetime
    and (
      e.status in ('pending', 'past_due')
      or (e.status = 'active' and e.effective_until <= p_before + interval '24 hours')
    )
  order by e.effective_until nulls first, e.updated_at
  limit least(greatest(p_result_limit, 1), 500);
$$;

revoke all on function api.complete_cook(uuid, uuid, text, numeric) from public, anon, authenticated;
revoke all on function api.claim_supporter_offer(text) from public, anon, authenticated;
revoke all on function api.save_recipe(uuid, boolean) from public, anon, authenticated;
revoke all on function api.follow_user(uuid, boolean) from public, anon, authenticated;
revoke all on function api.block_user(uuid, boolean) from public, anon, authenticated;
revoke all on function api.mark_notification_read(uuid) from public, anon, authenticated;
revoke all on function api.complete_age_gate(text, date) from public, anon, authenticated;
revoke all on function api.publish_recipe_version(uuid, text) from public, anon, authenticated;
revoke all on function api.get_checkout_claim(uuid) from public, anon, authenticated, service_role;
revoke all on function api.consume_checkout_claim(uuid, uuid, text) from public, anon, authenticated, service_role;
revoke all on function api.record_verified_webhook(private.payment_gateway, text, text, timestamptz, jsonb, boolean) from public, anon, authenticated, service_role;
revoke all on function api.apply_entitlement_webhook(uuid, uuid, text, text, private.plan_interval, private.entitlement_status, timestamptz, timestamptz, boolean, text) from public, anon, authenticated, service_role;
revoke all on function api.entitlement_reconciliation_candidates(timestamptz, integer) from public, anon, authenticated, service_role;

create or replace view api.recipe_previews
with (security_invoker = true)
as
select distinct on (r.id)
  r.id,
  r.slug,
  r.primary_collection,
  r.access_tier,
  d.id as dish_id,
  d.title as dish_title,
  d.title_ja as dish_title_ja,
  d.aliases as dish_aliases,
  rv.id as recipe_version_id,
  rv.version_number,
  rv.locale,
  rv.title,
  rv.teaser,
  rv.prep_minutes,
  rv.cook_minutes,
  rv.difficulty,
  rv.dietary_tags,
  rv.allergen_summary,
  ma.object_path as hero_image_path,
  coalesce(w.title, f.name) as fandom_context,
  rv.published_at
from catalog.recipes r
join catalog.dishes d on d.id = r.dish_id
join catalog.recipe_versions rv on rv.recipe_id = r.id and rv.editorial_state = 'published'
left join catalog.recipe_media rm on rm.recipe_version_id = rv.id and rm.purpose = 'hero'
left join catalog.media_assets ma on ma.id = rm.media_asset_id and ma.state = 'approved'
left join lateral (
  select a.work_id from catalog.appearances a where a.dish_id = d.id and a.verified_at is not null order by a.verified_at desc limit 1
) primary_appearance on true
left join catalog.works w on w.id = primary_appearance.work_id
left join catalog.franchises f on f.id = w.franchise_id
order by r.id, rv.version_number desc, rm.position asc;

create or replace view api.recipe_details
with (security_invoker = true)
as
select
  rp.*,
  rv.description,
  rv.yield_quantity,
  rv.yield_unit,
  rv.skill_notes,
  rv.provenance_note,
  rv.content_hash
from api.recipe_previews rp
join catalog.recipe_versions rv on rv.id = rp.recipe_version_id
where private.can_access_recipe_version(rv.id);

create or replace view api.recipe_ingredients
with (security_invoker = true)
as
select
  ri.id,
  ri.recipe_version_id,
  ri.position,
  i.id as ingredient_id,
  i.slug as ingredient_slug,
  i.name,
  i.name_ja,
  i.aliases,
  ri.quantity_min,
  ri.quantity_max,
  ri.unit_code,
  ri.preparation,
  ri.optional,
  ri.group_label
from catalog.recipe_ingredients ri
join catalog.ingredients i on i.id = ri.ingredient_id
where private.can_access_recipe_version(ri.recipe_version_id);

create or replace view api.recipe_steps
with (security_invoker = true)
as
select id, recipe_version_id, position, instruction, timer_seconds, temperature_c, safety_note, group_label
from catalog.recipe_steps
where private.can_access_recipe_version(recipe_version_id);

create or replace view api.appearances
with (security_invoker = true)
as
select
  a.id,
  a.dish_id,
  a.primary_collection,
  a.appearance_type,
  a.evidence_locator,
  a.evidence_note,
  a.confidence,
  a.verified_at,
  w.id as work_id,
  w.slug as work_slug,
  w.title as work_title,
  we.number_label as entry_number,
  we.title as entry_title,
  l.name as location_name
from catalog.appearances a
left join catalog.works w on w.id = a.work_id
left join catalog.work_entries we on we.id = a.work_entry_id
left join catalog.locations l on l.id = a.location_id
where a.verified_at is not null;

create or replace view api.regional_substitutions
with (security_invoker = true)
as
select
  rs.id,
  rs.ingredient_id,
  rs.market,
  rs.substitute_ingredient_id,
  coalesce(si.name, rs.substitute_label) as substitute_name,
  rs.ratio,
  rs.note,
  rs.priority
from catalog.regional_substitutions rs
left join catalog.ingredients si on si.id = rs.substitute_ingredient_id;

create or replace view api.public_profiles
with (security_invoker = true)
as
select user_id, username, display_name, bio, avatar_object_path, profile_visibility, created_at
from community.profiles;

create or replace view api.following_feed
with (security_invoker = true)
as
select
  p.id,
  p.author_id,
  pr.username,
  pr.display_name,
  p.recipe_id,
  p.body,
  p.published_at,
  p.created_at,
  coalesce((select count(*) from community.reactions r where r.post_id = p.id), 0)::integer as reaction_count,
  coalesce((select count(*) from community.comments c where c.post_id = p.id and c.removed_at is null), 0)::integer as comment_count
from community.posts p
join community.profiles pr on pr.user_id = p.author_id
where p.author_id = (select auth.uid())
   or exists (select 1 from community.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.author_id);

create or replace view api.my_notifications
with (security_invoker = true)
as
select id, actor_id, kind, object_type, object_id, payload, read_at, created_at
from community.notifications
where recipient_id = (select auth.uid());

create or replace view api.my_progress
with (security_invoker = true)
as
select up.user_id, up.total_xp, up.level, up.current_streak, up.longest_streak, up.last_cook_on, up.updated_at
from private.user_progress up
where up.user_id = (select auth.uid());

create or replace view api.my_entitlement
with (security_invoker = true)
as
select e.id, e.gateway, e.plan, e.status, e.effective_from, e.effective_until, e.lifetime
from private.entitlements e
where e.user_id = (select auth.uid())
order by e.effective_from desc;

create or replace function api.search_catalog(search_query text, result_limit integer default 20, after_slug text default null)
returns table(entity_kind text, entity_id uuid, slug text, title text, subtitle text, rank real)
language sql
stable
security invoker
set search_path = ''
as $$
  with normalized as (
    select pg_catalog.websearch_to_tsquery('simple', pg_catalog.left(coalesce(search_query, ''), 200)) as query
  ), candidates as (
    select
      'recipe'::text as entity_kind,
      rp.id as entity_id,
      rp.slug,
      rp.title,
      rp.fandom_context as subtitle,
      greatest(
        pg_catalog.ts_rank_cd(d.search_vector, n.query),
        extensions.similarity(rp.title, search_query),
        extensions.similarity(d.title, search_query)
      )::real as rank
    from api.recipe_previews rp
    join catalog.dishes d on d.id = rp.dish_id
    cross join normalized n
    where (d.search_vector @@ n.query or extensions.similarity(rp.title, search_query) > 0.15 or extensions.similarity(d.title, search_query) > 0.15)
      and (after_slug is null or rp.slug > after_slug)
    union all
    select
      'dish'::text,
      d.id,
      d.slug,
      d.title,
      d.title_ja,
      greatest(pg_catalog.ts_rank_cd(d.search_vector, n.query), extensions.similarity(d.title, search_query))::real
    from catalog.dishes d
    cross join normalized n
    where (d.search_vector @@ n.query or extensions.similarity(d.title, search_query) > 0.15)
      and (after_slug is null or d.slug > after_slug)
  )
  select c.entity_kind, c.entity_id, c.slug, c.title, c.subtitle, c.rank
  from candidates c
  order by c.rank desc, c.slug
  limit least(greatest(result_limit, 1), 50);
$$;

revoke all on schema api from public, anon, authenticated;
grant usage on schema api to anon, authenticated;
grant usage on schema catalog, community to anon, authenticated;

grant select on catalog.franchises, catalog.works, catalog.work_entries, catalog.locations,
  catalog.dishes, catalog.appearances, catalog.recipes, catalog.recipe_versions,
  catalog.tags, catalog.recipe_tags, catalog.allergens, catalog.media_assets,
  catalog.recipe_media, catalog.collections, catalog.collection_recipes to anon, authenticated;
grant select on catalog.units, catalog.ingredients, catalog.recipe_ingredients, catalog.recipe_steps,
  catalog.equipment, catalog.recipe_equipment, catalog.ingredient_allergens,
  catalog.recipe_allergens, catalog.regional_substitutions, catalog.unit_conversions to authenticated;
grant select on community.profiles, community.follows, community.posts, community.comments,
  community.reactions, community.reviews, community.collections, community.collection_items to anon, authenticated;
grant select on community.preferences, community.blocks, community.post_media, community.saves,
  community.cook_logs, community.notifications, community.reports, community.submissions to authenticated;
grant update (read_at) on community.notifications to authenticated;
grant select on private.user_progress, private.entitlements to authenticated;

grant select on api.recipe_previews, api.appearances, api.public_profiles to anon, authenticated;
grant select on api.recipe_details, api.recipe_ingredients, api.recipe_steps,
  api.regional_substitutions, api.following_feed, api.my_notifications, api.my_progress, api.my_entitlement to authenticated;
grant execute on function api.search_catalog(text, integer, text) to anon, authenticated;
grant execute on function api.complete_cook(uuid, uuid, text, numeric) to authenticated;
grant execute on function api.claim_supporter_offer(text) to authenticated;
grant execute on function api.save_recipe(uuid, boolean) to authenticated;
grant execute on function api.follow_user(uuid, boolean) to authenticated;
grant execute on function api.block_user(uuid, boolean) to authenticated;
grant execute on function api.mark_notification_read(uuid) to authenticated;
grant execute on function api.complete_age_gate(text, date) to authenticated;
grant execute on function api.publish_recipe_version(uuid, text) to authenticated;
grant execute on function api.get_checkout_claim(uuid) to authenticated;
grant usage on schema api, private to service_role;
grant execute on function api.consume_checkout_claim(uuid, uuid, text) to service_role;
grant execute on function api.record_verified_webhook(private.payment_gateway, text, text, timestamptz, jsonb, boolean) to service_role;
grant execute on function api.apply_entitlement_webhook(uuid, uuid, text, text, private.plan_interval, private.entitlement_status, timestamptz, timestamptz, boolean, text) to service_role;
grant execute on function api.entitlement_reconciliation_candidates(timestamptz, integer) to service_role;

-- A boolean capability probe lets the Next.js Studio layout fail closed without
-- exposing role assignments or accepting a user-editable role claim.
create or replace function api.has_studio_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_any_role(
    array['moderator', 'editor', 'culinary_reviewer', 'rights_reviewer', 'admin', 'owner']::private.app_role[]
  );
$$;

revoke all on function api.has_studio_access() from public, anon, service_role;
grant execute on function api.has_studio_access() to authenticated;

create or replace function api.create_post_submission(
  p_body text,
  p_visibility text default 'public'
)
returns table(post_id uuid, requires_owner_approval boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result_id uuid;
  prior_count integer;
begin
  if caller_id is null or not private.has_active_account() or not private.is_social_eligible() then
    raise exception using errcode = '42501', message = 'Social posting is unavailable';
  end if;
  if p_body is null or length(btrim(p_body)) not between 1 and 2000 then
    raise exception using errcode = '22023', message = 'Post body must be between 1 and 2000 characters';
  end if;
  if p_visibility not in ('public', 'followers', 'private') then
    raise exception using errcode = '22023', message = 'Invalid post visibility';
  end if;
  if (select count(*) from community.posts p where p.author_id = caller_id and p.created_at > statement_timestamp() - interval '10 minutes') >= 6 then
    raise exception using errcode = '54000', message = 'Posting cooldown exceeded';
  end if;

  select count(*) into prior_count from community.posts p where p.author_id = caller_id;
  insert into community.posts (author_id, body, visibility, moderation_state)
  values (caller_id, btrim(p_body), p_visibility::community.visibility, 'pending')
  returning id into result_id;
  return query select result_id, prior_count < 3;
end;
$$;

create or replace function api.apply_post_moderation(
  p_post_id uuid,
  p_outcome text,
  p_quarantine_path text default null,
  p_sanitized_path text default null,
  p_sha256 text default null,
  p_mime_type text default null,
  p_width integer default null,
  p_height integer default null,
  p_alt_text text default ''
)
returns table(final_state text, published_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target community.posts%rowtype;
  prior_count integer;
  selected_state community.moderation_state;
  selected_published_at timestamptz;
begin
  if p_outcome not in ('pending', 'auto_passed', 'flagged', 'rejected') then
    raise exception using errcode = '22023', message = 'Invalid moderation outcome';
  end if;
  select * into target from community.posts p where p.id = p_post_id for update;
  if target.id is null then raise exception using errcode = 'P0002', message = 'Post not found'; end if;

  select count(*) into prior_count from community.posts p where p.author_id = target.author_id and p.created_at < target.created_at;
  selected_state := case when p_outcome = 'auto_passed' and prior_count < 3 then 'pending'::community.moderation_state else p_outcome::community.moderation_state end;
  selected_published_at := case when selected_state = 'auto_passed' then statement_timestamp() else null end;

  update community.posts p set moderation_state = selected_state, published_at = selected_published_at where p.id = target.id;
  if p_quarantine_path is not null then
    insert into community.post_media (post_id, quarantine_path, sanitized_path, sha256, mime_type, width, height, state, alt_text)
    values (target.id, p_quarantine_path, p_sanitized_path, p_sha256, p_mime_type, p_width, p_height, selected_state, coalesce(p_alt_text, ''));
  end if;
  return query select selected_state::text, selected_published_at;
end;
$$;

revoke all on function api.create_post_submission(text, text) from public, anon, authenticated, service_role;
grant execute on function api.create_post_submission(text, text) to authenticated;
revoke all on function api.apply_post_moderation(uuid, text, text, text, text, text, integer, integer, text) from public, anon, authenticated, service_role;
grant execute on function api.apply_post_moderation(uuid, text, text, text, text, text, integer, integer, text) to service_role;

commit;
