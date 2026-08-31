begin;

create extension if not exists pgtap with schema extensions;

select plan(32);

select has_schema('catalog', 'catalog schema exists');
select has_schema('community', 'community schema exists');
select has_schema('private', 'private schema exists');
select has_schema('api', 'api schema exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'catalog.recipes'::regclass),
  'catalog recipes have RLS enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'community.posts'::regclass),
  'community posts force RLS'
);
select ok(
  not has_table_privilege('anon', 'api.recipe_details', 'select'),
  'anonymous users cannot select full recipe details'
);
select ok(
  has_table_privilege('anon', 'api.recipe_previews', 'select'),
  'anonymous users can select recipe previews'
);
select ok(
  not has_function_privilege('anon', 'api.complete_cook(uuid,uuid,text,numeric)', 'execute'),
  'anonymous users cannot complete cooks'
);
select ok(
  has_function_privilege('authenticated', 'api.complete_cook(uuid,uuid,text,numeric)', 'execute'),
  'authenticated users can call the cook completion RPC'
);
select ok(
  not has_function_privilege('authenticated', 'private.award_game_event(uuid,text,uuid,text,jsonb)', 'execute'),
  'clients cannot call the XP award primitive directly'
);
select ok(
  not has_table_privilege('authenticated', 'private.xp_ledger', 'insert'),
  'clients cannot fabricate XP ledger rows'
);

insert into auth.users (
  id, aud, role, email, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-4000-8000-000000000101', 'authenticated', 'authenticated', 'alice@example.test', now(), '{"provider":"google","providers":["google"]}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000202', 'authenticated', 'authenticated', 'bob@example.test', now(), '{"provider":"discord","providers":["discord"]}', '{}', now(), now());

insert into private.account_profiles (
  user_id, country_code, date_of_birth, state, age_rule_version,
  social_eligible, advertising_eligible, accepted_at
)
values
  ('00000000-0000-4000-8000-000000000101', 'US', '1990-01-01', 'active', 'test', true, true, now()),
  ('00000000-0000-4000-8000-000000000202', 'US', '1992-01-01', 'active', 'test', true, true, now());

insert into community.profiles (user_id, username, display_name)
values
  ('00000000-0000-4000-8000-000000000101', 'alice_test', 'Alice'),
  ('00000000-0000-4000-8000-000000000202', 'bob_test', 'Bob');

insert into community.preferences (user_id)
values
  ('00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000202');

insert into private.entitlements (
  user_id, gateway, external_purchase_id, plan, status,
  effective_from, effective_until, lifetime
)
values (
  '00000000-0000-4000-8000-000000000202', 'stripe', 'test_purchase_bob',
  'yearly', 'active', now() - interval '1 day', now() + interval '1 year', false
);

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000101';
set local "request.jwt.claims" = '{"sub":"00000000-0000-4000-8000-000000000101","role":"authenticated"}';

select is(
  (select count(*)::integer from community.preferences),
  1,
  'a user sees only their preferences'
);
select is(
  (select count(*)::integer from private.entitlements),
  0,
  'a user cannot read another user entitlement'
);
select ok(
  not private.has_supporter_entitlement(),
  'supporter helper is scoped to the current user'
);
select lives_ok(
  $$select api.block_user('00000000-0000-4000-8000-000000000202', true)$$,
  'eligible users may block another user through the guarded RPC'
);
select is(
  (select count(*)::integer from api.public_profiles where user_id = '00000000-0000-4000-8000-000000000202'),
  0,
  'blocked profiles are hidden'
);
select throws_ok(
  $$insert into private.xp_ledger(user_id, game_event_id, xp_rule_id, base_xp, multiplier, awarded_xp, reason) values ('00000000-0000-4000-8000-000000000101', gen_random_uuid(), gen_random_uuid(), 1, 1, 1, 'forged')$$,
  '42501',
  null,
  'direct XP ledger writes are rejected'
);

reset role;

select is(
  (select count(*)::integer from private.offer_claims),
  0,
  'offer claims begin empty and cannot be fabricated by test clients'
);
select ok(
  (select count(*) = 6 from private.offers),
  'all six founding offer variants are seeded'
);
select ok(
  not has_function_privilege('anon', 'api.export_account_data(uuid)', 'execute'),
  'anonymous users cannot invoke account exports'
);
select ok(
  not has_function_privilege('authenticated', 'api.export_account_data(uuid)', 'execute'),
  'authenticated clients cannot choose another export subject'
);
select ok(
  has_function_privilege('service_role', 'api.export_account_data(uuid)', 'execute'),
  'the server service may generate an authenticated export'
);
select ok(
  not has_function_privilege('anon', 'api.react_to_post(uuid,text,boolean)', 'execute'),
  'anonymous users cannot react to posts'
);
select ok(
  has_function_privilege('authenticated', 'api.react_to_post(uuid,text,boolean)', 'execute'),
  'eligible authenticated users may call the reaction RPC'
);
select ok(
  not has_function_privilege('authenticated', 'api.apply_entitlement_reconciliation(uuid,text,timestamptz,text)', 'execute'),
  'clients cannot reconcile their own entitlement'
);
select ok(
  has_function_privilege('service_role', 'api.apply_entitlement_reconciliation(uuid,text,timestamptz,text)', 'execute'),
  'the server service may reconcile entitlements'
);
select ok(
  has_function_privilege('authenticated', 'api.get_my_account_context()', 'execute'),
  'authenticated users may read only their verified account context'
);
select ok(
  not has_table_privilege('anon', 'api.my_collections', 'select'),
  'anonymous users cannot read private collection views'
);
select ok(
  not (select public from storage.buckets where id = 'ugc-sanitized'),
  'sanitized UGC is not a public bucket'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'users can upload only to their quarantine prefix'),
  0,
  'authenticated clients have no direct quarantine upload policy'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'sanitized ugc follows post visibility'),
  'sanitized UGC reads follow current post visibility'
);

select * from finish();
rollback;
