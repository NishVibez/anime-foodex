begin;

create or replace function api.get_my_ad_context()
returns table(advertising_eligible boolean, personalized_consent boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ap.state = 'active' and ap.advertising_eligible,
    coalesce((
      select cr.action = 'granted'
      from private.consent_records cr
      where cr.user_id = ap.user_id and cr.kind = 'personalized_ads'
      order by cr.occurred_at desc, cr.id desc
      limit 1
    ), false)
  from private.account_profiles ap
  where ap.user_id = (select auth.uid());
$$;

create or replace function api.record_personalized_ads_consent(
  p_granted boolean,
  p_policy_version text,
  p_request_id text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  profile private.account_profiles%rowtype;
  selected_action private.consent_action := case when p_granted then 'granted' else 'withdrawn' end;
begin
  if caller_id is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  if p_policy_version is null or length(btrim(p_policy_version)) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'A policy version is required';
  end if;
  select * into profile from private.account_profiles where user_id = caller_id for update;
  if profile.user_id is null or profile.state <> 'active' then
    raise exception using errcode = '42501', message = 'Active account required';
  end if;
  if p_granted and not profile.advertising_eligible then
    raise exception using errcode = '42501', message = 'Personalized advertising is not available for this account';
  end if;
  insert into private.consent_records (user_id, kind, action, policy_version, country_code, request_id)
  values (caller_id, 'personalized_ads', selected_action, btrim(p_policy_version), profile.country_code, p_request_id);
  insert into private.audit_logs (actor_id, action, target_type, target_id, request_id, metadata)
  values (caller_id, 'personalized_ads_consent_changed', 'account', caller_id::text, p_request_id, jsonb_build_object('action', selected_action));
  return selected_action::text;
end;
$$;

create or replace function api.request_account_deletion(p_request_id text default null)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  requested_at timestamptz := statement_timestamp();
begin
  if caller_id is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  update private.account_profiles
  set state = 'deletion_pending', social_eligible = false, advertising_eligible = false,
      deletion_requested_at = requested_at, updated_at = requested_at
  where user_id = caller_id and state <> 'deleted';
  if not found then raise exception using errcode = 'P0002', message = 'Account profile not found'; end if;

  update community.profiles set profile_visibility = 'private', updated_at = requested_at where user_id = caller_id;
  update community.posts set removed_at = coalesce(removed_at, requested_at), updated_at = requested_at where author_id = caller_id;
  update community.comments set removed_at = coalesce(removed_at, requested_at), updated_at = requested_at where author_id = caller_id;
  update community.reviews set removed_at = coalesce(removed_at, requested_at), updated_at = requested_at where author_id = caller_id;
  delete from community.follows where follower_id = caller_id or followed_id = caller_id;

  insert into private.audit_logs (actor_id, action, target_type, target_id, request_id, metadata)
  values (caller_id, 'account_deletion_requested', 'account', caller_id::text, p_request_id, jsonb_build_object('requested_at', requested_at));
  return requested_at;
end;
$$;

create or replace function api.export_account_data(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'generated_at', statement_timestamp(),
    'account', (select to_jsonb(x) from private.account_profiles x where x.user_id = p_user_id),
    'profile', (select to_jsonb(x) from community.profiles x where x.user_id = p_user_id),
    'preferences', (select to_jsonb(x) from community.preferences x where x.user_id = p_user_id),
    'consents', coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_at) from private.consent_records x where x.user_id = p_user_id), '[]'::jsonb),
    'follows', coalesce((select jsonb_agg(to_jsonb(x)) from community.follows x where x.follower_id = p_user_id or x.followed_id = p_user_id), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(to_jsonb(x)) from community.blocks x where x.blocker_id = p_user_id), '[]'::jsonb),
    'posts', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from community.posts x where x.author_id = p_user_id), '[]'::jsonb),
    'comments', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from community.comments x where x.author_id = p_user_id), '[]'::jsonb),
    'reactions', coalesce((select jsonb_agg(to_jsonb(x)) from community.reactions x where x.user_id = p_user_id), '[]'::jsonb),
    'reviews', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from community.reviews x where x.author_id = p_user_id), '[]'::jsonb),
    'collections', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from community.collections x where x.owner_id = p_user_id), '[]'::jsonb),
    'saves', coalesce((select jsonb_agg(to_jsonb(x)) from community.saves x where x.user_id = p_user_id), '[]'::jsonb),
    'cook_logs', coalesce((select jsonb_agg(to_jsonb(x) order by x.completed_at) from community.cook_logs x where x.user_id = p_user_id), '[]'::jsonb),
    'reports', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from community.reports x where x.reporter_id = p_user_id), '[]'::jsonb),
    'submissions', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from community.submissions x where x.submitter_id = p_user_id), '[]'::jsonb),
    'entitlements', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from private.entitlements x where x.user_id = p_user_id), '[]'::jsonb),
    'xp_ledger', coalesce((select jsonb_agg(to_jsonb(x) order by x.awarded_at) from private.xp_ledger x where x.user_id = p_user_id), '[]'::jsonb)
  );
$$;

create or replace function api.apply_entitlement_reconciliation(
  p_entitlement_id uuid,
  p_status text,
  p_effective_until timestamptz,
  p_request_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target private.entitlements%rowtype;
begin
  if p_status not in ('pending', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'disputed', 'revoked') then
    raise exception using errcode = '22023', message = 'Invalid entitlement status';
  end if;
  select * into target from private.entitlements where id = p_entitlement_id for update;
  if target.id is null or target.lifetime then return false; end if;
  update private.entitlements
  set status = p_status::private.entitlement_status,
      effective_until = coalesce(p_effective_until, effective_until),
      source_occurred_at = greatest(source_occurred_at, statement_timestamp()),
      revoked_reason = case when p_status in ('refunded', 'disputed', 'revoked') then 'nightly_reconciliation' else revoked_reason end,
      updated_at = statement_timestamp()
  where id = target.id;
  insert into private.audit_logs (action, target_type, target_id, request_id, metadata)
  values ('entitlement_reconciled', 'entitlement', target.id::text, p_request_id,
    jsonb_build_object('gateway', target.gateway, 'previous_status', target.status, 'status', p_status));
  return true;
end;
$$;

revoke all on function api.get_my_ad_context() from public, anon, authenticated, service_role;
grant execute on function api.get_my_ad_context() to authenticated;
revoke all on function api.record_personalized_ads_consent(boolean, text, text) from public, anon, authenticated, service_role;
grant execute on function api.record_personalized_ads_consent(boolean, text, text) to authenticated;
revoke all on function api.request_account_deletion(text) from public, anon, authenticated, service_role;
grant execute on function api.request_account_deletion(text) to authenticated;
revoke all on function api.export_account_data(uuid) from public, anon, authenticated, service_role;
grant execute on function api.export_account_data(uuid) to service_role;
revoke all on function api.apply_entitlement_reconciliation(uuid, text, timestamptz, text) from public, anon, authenticated, service_role;
grant execute on function api.apply_entitlement_reconciliation(uuid, text, timestamptz, text) to service_role;

commit;
