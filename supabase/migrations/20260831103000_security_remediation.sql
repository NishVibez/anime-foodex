begin;

-- A verified, caller-bound account context is the only source of UI access
-- state. Returning one row for pending users lets the application distinguish
-- onboarding from an anonymous session without trusting profile metadata.
create or replace function api.get_my_account_context()
returns table(
  account_state text,
  country_code text,
  social_eligible boolean,
  advertising_eligible boolean,
  entitlement_id uuid,
  entitlement_status text,
  entitlement_effective_from timestamptz,
  entitlement_effective_until timestamptz,
  entitlement_lifetime boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'Authentication is required';
  end if;

  return query
  select
    coalesce(ap.state::text, 'pending_age'),
    ap.country_code::text,
    coalesce(ap.social_eligible, false),
    coalesce(ap.advertising_eligible, false),
    entitlement.id,
    entitlement.status::text,
    entitlement.effective_from,
    entitlement.effective_until,
    entitlement.lifetime
  from (select caller_id as user_id) caller
  left join private.account_profiles ap on ap.user_id = caller.user_id
  left join lateral (
    select e.id, e.status, e.effective_from, e.effective_until, e.lifetime
    from private.entitlements e
    where e.user_id = caller.user_id
      and e.status = 'active'
      and e.effective_from <= statement_timestamp()
      and (e.lifetime or e.effective_until > statement_timestamp())
    order by e.lifetime desc, e.effective_until desc nulls first, e.effective_from desc
    limit 1
  ) entitlement on true;
end;
$$;

-- Age declarations create an account profile exactly once. An onboarding call
-- may be repeated only with the same declaration; it can never reactivate a
-- restricted, suspended, deleting, or deleted account.
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
  existing private.account_profiles%rowtype;
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

  select ap.* into existing
  from private.account_profiles ap
  where ap.user_id = caller_id
  for update;

  if existing.user_id is not null then
    if existing.state = 'active'
      and existing.country_code::text = normalized_country
      and existing.date_of_birth = p_date_of_birth then
      select apr.* into rule
      from private.age_policy_rules apr
      where apr.country_code in (normalized_country, '*')
        and apr.effective_from <= current_date
      order by (apr.country_code = normalized_country) desc, apr.effective_from desc
      limit 1;
      return query select existing.state::text, rule.minimum_account_age::integer, existing.social_eligible, existing.advertising_eligible;
      return;
    end if;
    raise exception using errcode = '42501', message = 'Age declaration is locked; contact support for a correction';
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
  );

  insert into private.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (caller_id, 'account.age_declaration', 'account', caller_id::text, jsonb_build_object('country_code', normalized_country, 'policy_version', rule.policy_version, 'eligible', resulting_state = 'active'));

  return query select resulting_state::text, rule.minimum_account_age::integer, can_socialize, can_receive_personalized_ads;
end;
$$;

-- Bind regional offers to the immutable private onboarding country. The
-- client may choose a plan, but it cannot choose its pricing authority.
create or replace function api.claim_supporter_offer(offer_code text)
returns table(claim_id uuid, amount_minor integer, currency text, gateway text, checkout_expires_at timestamptz, already_claimed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  account_country text;
  selected_offer private.offers%rowtype;
  result_claim private.offer_claims%rowtype;
  did_insert boolean := false;
begin
  if caller_id is null or not private.has_active_account() then
    raise exception using errcode = '42501', message = 'An active account is required';
  end if;

  select ap.country_code::text into account_country
  from private.account_profiles ap
  where ap.user_id = caller_id and ap.state = 'active'
  for update;

  select o.* into selected_offer
  from private.offers o
  where o.code = offer_code
    and o.active
    and (o.campaign_starts_at is null or o.campaign_starts_at <= statement_timestamp())
    and (o.campaign_ends_at is null or o.campaign_ends_at > statement_timestamp());
  if selected_offer.id is null then
    raise exception using errcode = '22023', message = 'Offer is unavailable';
  end if;
  if (account_country = 'IN' and selected_offer.gateway <> 'razorpay')
    or (account_country <> 'IN' and selected_offer.gateway <> 'stripe') then
    raise exception using errcode = '42501', message = 'Offer is not available for this account region';
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

-- SECURITY DEFINER social mutations must reproduce the read-time post
-- visibility decision instead of bypassing it.
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
  select * into target
  from community.posts p
  where p.id = p_post_id
    and p.moderation_state in ('auto_passed', 'approved')
    and p.removed_at is null
    and p.published_at is not null
    and (
      p.visibility = 'public'
      or p.author_id = caller_id
      or (
        p.visibility = 'followers'
        and exists (select 1 from community.follows f where f.followed_id = p.author_id and f.follower_id = caller_id)
      )
    );
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
  target_user_id uuid;
  target_visible boolean := false;
  result_id uuid;
begin
  if caller_id is null or not private.is_social_eligible() then raise exception using errcode = '42501', message = 'Reporting is unavailable'; end if;
  if p_target_type not in ('profile', 'post', 'comment', 'review', 'collection', 'submission') then raise exception using errcode = '22023', message = 'Invalid report target'; end if;
  if p_reason not in ('harassment', 'spam', 'privacy', 'unsafe_food', 'infringement', 'sexual_or_violent', 'minor_safety', 'other') then raise exception using errcode = '22023', message = 'Invalid report reason'; end if;
  if length(coalesce(p_detail, '')) > 2000 then raise exception using errcode = '22023', message = 'Report detail is too long'; end if;

  if exists (select 1 from community.reports r where r.reporter_id = caller_id and r.created_at > statement_timestamp() - interval '30 seconds')
    or (select count(*) from community.reports r where r.reporter_id = caller_id and r.created_at > statement_timestamp() - interval '1 day') >= 20 then
    raise exception using errcode = '54000', message = 'Reporting cooldown is active';
  end if;

  case p_target_type
    when 'profile' then
      select p.user_id,
        (p.profile_visibility = 'public' or p.user_id = caller_id or (p.profile_visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = p.user_id and f.follower_id = caller_id)))
      into target_user_id, target_visible from community.profiles p where p.user_id = p_target_id;
    when 'post' then
      select p.author_id,
        (p.moderation_state in ('auto_passed', 'approved') and p.removed_at is null and p.published_at is not null and (p.visibility = 'public' or p.author_id = caller_id or (p.visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = p.author_id and f.follower_id = caller_id))))
      into target_user_id, target_visible from community.posts p where p.id = p_target_id;
    when 'comment' then
      select c.author_id,
        (c.moderation_state in ('auto_passed', 'approved') and c.removed_at is null and p.moderation_state in ('auto_passed', 'approved') and p.removed_at is null and p.published_at is not null and (p.visibility = 'public' or p.author_id = caller_id or (p.visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = p.author_id and f.follower_id = caller_id))))
      into target_user_id, target_visible from community.comments c join community.posts p on p.id = c.post_id where c.id = p_target_id;
    when 'review' then
      select r.author_id, (r.moderation_state in ('auto_passed', 'approved') and r.removed_at is null)
      into target_user_id, target_visible from community.reviews r where r.id = p_target_id;
    when 'collection' then
      select c.owner_id,
        (c.visibility = 'public' or c.owner_id = caller_id or (c.visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = c.owner_id and f.follower_id = caller_id)))
      into target_user_id, target_visible from community.collections c where c.id = p_target_id;
    when 'submission' then
      select s.submitter_id, (s.submitter_id = caller_id or private.has_any_role(array['moderator', 'admin', 'owner']::private.app_role[]))
      into target_user_id, target_visible from community.submissions s where s.id = p_target_id;
  end case;

  if target_user_id is null or target_user_id = caller_id or not coalesce(target_visible, false) or private.is_blocked_between(target_user_id) then
    raise exception using errcode = '42501', message = 'Report target is unavailable';
  end if;

  insert into community.reports (reporter_id, target_type, target_id, reason, detail)
  values (caller_id, p_target_type, p_target_id, p_reason::community.report_reason, coalesce(p_detail, ''))
  on conflict (reporter_id, target_type, target_id, reason) do update set detail = excluded.detail
  returning id into result_id;
  return result_id;
end;
$$;

-- Lifetime purchases participate in reconciliation too. Their provider
-- reference is the Stripe PaymentIntent or Razorpay Order normalized by the
-- webhook routes.
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
  where
    (e.lifetime and e.status in ('pending', 'active', 'past_due'))
    or (
      not e.lifetime
      and (
        e.status in ('pending', 'past_due')
        or (e.status = 'active' and e.effective_until <= p_before + interval '24 hours')
      )
    )
  order by e.updated_at, e.effective_until nulls first
  limit least(greatest(p_result_limit, 1), 500);
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
declare target private.entitlements%rowtype;
begin
  if p_status not in ('pending', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'disputed', 'revoked') then
    raise exception using errcode = '22023', message = 'Invalid entitlement status';
  end if;
  select * into target from private.entitlements where id = p_entitlement_id for update;
  if target.id is null then return false; end if;
  update private.entitlements
  set status = p_status::private.entitlement_status,
      effective_until = case when target.lifetime then null else coalesce(p_effective_until, effective_until) end,
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

-- Sanitized UGC is a private bucket. A Storage read is authorized only while
-- the current post/media state is publishable and the reader can see the post.
update storage.buckets set public = false where id = 'ugc-sanitized';

drop policy if exists "sanitized ugc is publicly readable" on storage.objects;
drop policy if exists "sanitized ugc follows post visibility" on storage.objects;
create policy "sanitized ugc follows post visibility"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'ugc-sanitized'
  and exists (
    select 1
    from community.post_media pm
    join community.posts p on p.id = pm.post_id
    where pm.sanitized_path = storage.objects.name
      and pm.state in ('auto_passed', 'approved')
      and p.moderation_state in ('auto_passed', 'approved')
      and p.removed_at is null
      and p.published_at is not null
      and (
        p.visibility = 'public'
        or p.author_id = (select auth.uid())
        or (
          p.visibility = 'followers'
          and exists (select 1 from community.follows f where f.followed_id = p.author_id and f.follower_id = (select auth.uid()))
        )
      )
      and (auth.uid() is null or not private.is_blocked_between(p.author_id))
  )
);

-- Browser clients cannot write arbitrary quarantine objects. The bounded
-- first-party post route uses the server-only service credential after the
-- database cooldown and file checks succeed.
drop policy if exists "users can upload only to their quarantine prefix" on storage.objects;

revoke all on function api.get_my_account_context() from public, anon, authenticated, service_role;
grant execute on function api.get_my_account_context() to authenticated;
revoke all on function api.complete_age_gate(text, date) from public, anon, authenticated, service_role;
grant execute on function api.complete_age_gate(text, date) to authenticated;
revoke all on function api.claim_supporter_offer(text) from public, anon, authenticated, service_role;
grant execute on function api.claim_supporter_offer(text) to authenticated;
revoke all on function api.react_to_post(uuid, text, boolean) from public, anon, authenticated, service_role;
grant execute on function api.react_to_post(uuid, text, boolean) to authenticated;
revoke all on function api.report_content(text, uuid, text, text) from public, anon, authenticated, service_role;
grant execute on function api.report_content(text, uuid, text, text) to authenticated;
revoke all on function api.entitlement_reconciliation_candidates(timestamptz, integer) from public, anon, authenticated, service_role;
grant execute on function api.entitlement_reconciliation_candidates(timestamptz, integer) to service_role;
revoke all on function api.apply_entitlement_reconciliation(uuid, text, timestamptz, text) from public, anon, authenticated, service_role;
grant execute on function api.apply_entitlement_reconciliation(uuid, text, timestamptz, text) to service_role;

commit;
