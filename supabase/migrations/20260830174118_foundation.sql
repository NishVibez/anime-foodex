begin;

set check_function_bodies = off;

create schema if not exists catalog;
create schema if not exists community;
create schema if not exists private;
create schema if not exists api;

revoke all on schema catalog, community, private, api from public;
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;
alter default privileges in schema catalog revoke all on tables from public, anon, authenticated;
alter default privileges in schema catalog revoke all on functions from public, anon, authenticated;
alter default privileges in schema community revoke all on tables from public, anon, authenticated;
alter default privileges in schema community revoke all on functions from public, anon, authenticated;
alter default privileges in schema private revoke all on tables from public, anon, authenticated;
alter default privileges in schema private revoke all on functions from public, anon, authenticated;
alter default privileges in schema api revoke all on tables from public, anon, authenticated;
alter default privileges in schema api revoke all on functions from public, anon, authenticated;

create extension if not exists pg_trgm with schema extensions;

create type catalog.fandom_kind as enum ('anime', 'animation', 'game', 'film', 'theme_park');
create type catalog.appearance_type as enum ('shown', 'mentioned', 'official_inspired', 'game_item', 'menu_item', 'adjacent_media');
create type catalog.rights_status as enum ('research_only', 'rights_unknown', 'licensed', 'creator_permission', 'public_domain', 'original_editorial');
create type catalog.editorial_state as enum ('candidate', 'evidence_verified', 'drafted', 'test_cooked', 'culinary_reviewed', 'rights_cleared', 'published', 'retired');
create type catalog.access_tier as enum ('guest', 'member', 'supporter');
create type catalog.source_kind as enum ('official', 'primary_media', 'publisher', 'government', 'culinary_reference', 'community_lead', 'research_file');
create type catalog.entry_kind as enum ('episode', 'chapter', 'scene', 'quest', 'menu', 'location', 'other');
create type catalog.difficulty as enum ('easy', 'medium', 'advanced');
create type catalog.review_kind as enum ('editorial', 'culinary', 'allergen', 'rights', 'media');
create type catalog.review_decision as enum ('pending', 'approved', 'changes_requested', 'rejected');
create type catalog.asset_state as enum ('quarantined', 'sanitized', 'approved', 'rejected', 'retired');
create type catalog.market_code as enum ('IN', 'NA', 'EU', 'OTHER');

create type community.visibility as enum ('public', 'followers', 'private');
create type community.moderation_state as enum ('pending', 'auto_passed', 'flagged', 'approved', 'rejected', 'removed');
create type community.reaction_kind as enum ('like', 'yum', 'inspired');
create type community.report_reason as enum ('harassment', 'spam', 'privacy', 'unsafe_food', 'infringement', 'sexual_or_violent', 'minor_safety', 'other');
create type community.submission_state as enum ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn');
create type community.notification_kind as enum ('follow', 'reaction', 'comment', 'review', 'quest', 'achievement', 'moderation', 'billing', 'system');

create type private.app_role as enum ('member', 'moderator', 'editor', 'culinary_reviewer', 'rights_reviewer', 'admin', 'owner');
create type private.account_state as enum ('pending_age', 'active', 'restricted', 'suspended', 'deletion_pending', 'deleted');
create type private.consent_kind as enum ('terms', 'privacy', 'personalized_ads', 'community_license', 'analytics');
create type private.consent_action as enum ('granted', 'withdrawn');
create type private.payment_gateway as enum ('razorpay', 'stripe');
create type private.ad_provider as enum ('adsense', 'media_net', 'infolinks');
create type private.entitlement_status as enum ('pending', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'disputed', 'revoked');
create type private.plan_interval as enum ('monthly', 'yearly', 'lifetime');
create type private.webhook_state as enum ('received', 'processed', 'ignored', 'failed');
create type private.moderation_action_kind as enum ('approve', 'reject', 'remove', 'restore', 'warn', 'suspend', 'ban', 'resolve_report', 'uphold_appeal', 'deny_appeal');

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function catalog.join_text_array(values_to_join text[])
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select pg_catalog.array_to_string(values_to_join, ' ');
$$;

create table catalog.franchises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  name_ja text,
  romanized_names text[] not null default '{}',
  primary_kind catalog.fandom_kind not null,
  synopsis text not null default '',
  official_url text,
  rights_status catalog.rights_status not null default 'rights_unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table catalog.works (
  id uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references catalog.franchises(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  title_ja text,
  aliases text[] not null default '{}',
  kind catalog.fandom_kind not null,
  release_year smallint check (release_year between 1900 and 2200),
  official_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index works_franchise_id_idx on catalog.works(franchise_id);

create table catalog.work_entries (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references catalog.works(id) on delete cascade,
  kind catalog.entry_kind not null,
  number_label text,
  title text,
  released_on date,
  created_at timestamptz not null default now(),
  unique (work_id, kind, number_label)
);
create index work_entries_work_id_idx on catalog.work_entries(work_id);

create table catalog.locations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references catalog.works(id) on delete cascade,
  slug text not null,
  name text not null,
  location_kind text not null,
  country_code char(2),
  official_url text,
  created_at timestamptz not null default now(),
  unique nulls not distinct (work_id, slug)
);
create index locations_work_id_idx on catalog.locations(work_id);

create table catalog.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_kind catalog.source_kind not null,
  url text,
  publisher text,
  published_on date,
  file_sha256 text check (file_sha256 is null or file_sha256 ~ '^[a-f0-9]{64}$'),
  rights_status catalog.rights_status not null default 'research_only',
  is_primary_verification boolean not null default false,
  private_locator text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (url is not null or file_sha256 is not null)
);

create table catalog.dishes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  title_ja text,
  aliases text[] not null default '{}',
  summary text not null,
  origin_region text,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title_ja, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(catalog.join_text_array(aliases), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dishes_search_vector_idx on catalog.dishes using gin(search_vector);
create index dishes_title_trgm_idx on catalog.dishes using gin(title extensions.gin_trgm_ops);

create table catalog.appearances (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references catalog.dishes(id) on delete restrict,
  work_id uuid references catalog.works(id) on delete restrict,
  work_entry_id uuid references catalog.work_entries(id) on delete restrict,
  location_id uuid references catalog.locations(id) on delete restrict,
  source_id uuid not null references catalog.sources(id) on delete restrict,
  primary_collection catalog.fandom_kind not null,
  appearance_type catalog.appearance_type not null,
  evidence_locator text not null check (length(evidence_locator) between 3 and 500),
  evidence_note text not null default '',
  confidence numeric(4,3) not null default 1 check (confidence between 0 and 1),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (work_id is not null or location_id is not null)
);
create index appearances_dish_id_idx on catalog.appearances(dish_id);
create index appearances_work_id_idx on catalog.appearances(work_id);
create index appearances_work_entry_id_idx on catalog.appearances(work_entry_id);
create index appearances_location_id_idx on catalog.appearances(location_id);
create index appearances_source_id_idx on catalog.appearances(source_id);
create index appearances_quota_idx on catalog.appearances(primary_collection, verified_at) where verified_at is not null;

create table catalog.recipes (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references catalog.dishes(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  primary_collection catalog.fandom_kind not null,
  access_tier catalog.access_tier not null default 'member' check (access_tier <> 'guest'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recipes_dish_id_idx on catalog.recipes(dish_id);
create index recipes_quota_idx on catalog.recipes(primary_collection, access_tier);

create table catalog.recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references catalog.recipes(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  title text not null,
  teaser text not null,
  description text not null,
  yield_quantity numeric(8,2) not null check (yield_quantity > 0),
  yield_unit text not null,
  prep_minutes integer not null check (prep_minutes between 0 and 1440),
  cook_minutes integer not null check (cook_minutes between 0 and 2880),
  difficulty catalog.difficulty not null,
  dietary_tags text[] not null default '{}',
  allergen_summary text[] not null default '{}',
  skill_notes text not null default '',
  provenance_note text not null,
  editorial_state catalog.editorial_state not null default 'drafted',
  authored_by uuid references auth.users(id) on delete set null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  published_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  unique (recipe_id, version_number, locale),
  check ((editorial_state = 'published' and published_at is not null) or editorial_state <> 'published')
);
create index recipe_versions_recipe_id_idx on catalog.recipe_versions(recipe_id);
create index recipe_versions_published_idx on catalog.recipe_versions(recipe_id, locale, version_number desc) where editorial_state = 'published';

create table catalog.units (
  code text primary key check (code ~ '^[a-z0-9_]+$'),
  quantity_kind text not null check (quantity_kind in ('mass', 'volume', 'count', 'temperature', 'time', 'other')),
  metric_label text not null,
  imperial_label text not null,
  is_base_unit boolean not null default false
);

create table catalog.ingredients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  name_ja text,
  aliases text[] not null default '{}',
  default_unit_code text references catalog.units(code) on delete restrict,
  pantry boolean not null default false,
  description text not null default '',
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(name_ja, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(catalog.join_text_array(aliases), '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ingredients_search_vector_idx on catalog.ingredients using gin(search_vector);
create index ingredients_name_trgm_idx on catalog.ingredients using gin(name extensions.gin_trgm_ops);

create table catalog.recipe_ingredients (
  id bigint generated always as identity primary key,
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  ingredient_id uuid not null references catalog.ingredients(id) on delete restrict,
  position integer not null check (position > 0),
  quantity_min numeric(12,4) check (quantity_min is null or quantity_min >= 0),
  quantity_max numeric(12,4) check (quantity_max is null or quantity_max >= quantity_min),
  unit_code text references catalog.units(code) on delete restrict,
  preparation text not null default '',
  optional boolean not null default false,
  group_label text not null default 'Main',
  unique (recipe_version_id, position)
);
create index recipe_ingredients_version_idx on catalog.recipe_ingredients(recipe_version_id);
create index recipe_ingredients_ingredient_idx on catalog.recipe_ingredients(ingredient_id);

create table catalog.recipe_steps (
  id bigint generated always as identity primary key,
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  position integer not null check (position > 0),
  instruction text not null check (length(instruction) between 3 and 2000),
  timer_seconds integer check (timer_seconds between 1 and 86400),
  temperature_c numeric(6,2),
  safety_note text not null default '',
  group_label text not null default 'Main',
  unique (recipe_version_id, position)
);
create index recipe_steps_version_idx on catalog.recipe_steps(recipe_version_id);

create table catalog.equipment (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default ''
);

create table catalog.recipe_equipment (
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  equipment_id uuid not null references catalog.equipment(id) on delete restrict,
  optional boolean not null default false,
  note text not null default '',
  primary key (recipe_version_id, equipment_id)
);
create index recipe_equipment_equipment_idx on catalog.recipe_equipment(equipment_id);

create table catalog.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  tag_group text not null
);

create table catalog.recipe_tags (
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  tag_id uuid not null references catalog.tags(id) on delete cascade,
  primary key (recipe_version_id, tag_id)
);
create index recipe_tags_tag_idx on catalog.recipe_tags(tag_id);

create table catalog.allergens (
  code text primary key,
  label text not null,
  eu_required boolean not null default false,
  us_major boolean not null default false
);

create table catalog.ingredient_allergens (
  ingredient_id uuid not null references catalog.ingredients(id) on delete cascade,
  allergen_code text not null references catalog.allergens(code) on delete restrict,
  relation text not null check (relation in ('contains', 'may_contain', 'cross_contact')),
  primary key (ingredient_id, allergen_code, relation)
);
create index ingredient_allergens_allergen_idx on catalog.ingredient_allergens(allergen_code);

create table catalog.recipe_allergens (
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  allergen_code text not null references catalog.allergens(code) on delete restrict,
  relation text not null check (relation in ('contains', 'may_contain', 'cross_contact')),
  review_note text not null,
  primary key (recipe_version_id, allergen_code, relation)
);
create index recipe_allergens_allergen_idx on catalog.recipe_allergens(allergen_code);

create table catalog.regional_substitutions (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references catalog.ingredients(id) on delete cascade,
  substitute_ingredient_id uuid references catalog.ingredients(id) on delete restrict,
  market catalog.market_code not null,
  substitute_label text,
  ratio numeric(10,4) not null default 1 check (ratio > 0),
  note text not null,
  priority smallint not null default 100,
  created_at timestamptz not null default now(),
  check (substitute_ingredient_id is not null or substitute_label is not null),
  check (substitute_ingredient_id is null or substitute_ingredient_id <> ingredient_id)
);
create index regional_substitutions_lookup_idx on catalog.regional_substitutions(ingredient_id, market, priority);
create index regional_substitutions_substitute_idx on catalog.regional_substitutions(substitute_ingredient_id);

create table catalog.unit_conversions (
  id bigint generated always as identity primary key,
  from_unit_code text not null references catalog.units(code) on delete cascade,
  to_unit_code text not null references catalog.units(code) on delete cascade,
  ingredient_id uuid references catalog.ingredients(id) on delete cascade,
  multiplier numeric(20,10) not null check (multiplier > 0),
  additive_offset numeric(20,10) not null default 0,
  unique nulls not distinct (from_unit_code, to_unit_code, ingredient_id),
  check (from_unit_code <> to_unit_code)
);
create index unit_conversions_ingredient_idx on catalog.unit_conversions(ingredient_id);

create table catalog.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  object_path text not null,
  alt_text text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  width integer not null check (width between 1 and 12000),
  height integer not null check (height between 1 and 12000),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  rights_status catalog.rights_status not null,
  license_note text not null,
  state catalog.asset_state not null default 'quarantined',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (bucket_id, object_path),
  unique (sha256)
);

create table catalog.recipe_media (
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  media_asset_id uuid not null references catalog.media_assets(id) on delete restrict,
  purpose text not null check (purpose in ('hero', 'step', 'gallery', 'og')),
  position integer not null default 1,
  primary key (recipe_version_id, media_asset_id, purpose)
);
create index recipe_media_asset_idx on catalog.recipe_media(media_asset_id);

create table catalog.test_sessions (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  tested_by uuid references auth.users(id) on delete set null,
  tested_on date not null,
  market catalog.market_code not null,
  unit_system text not null check (unit_system in ('metric', 'imperial')),
  outcome catalog.review_decision not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  yield_observed numeric(8,2),
  duration_minutes integer check (duration_minutes between 1 and 2880),
  safety_findings text not null default '',
  notes text not null,
  created_at timestamptz not null default now()
);
create index test_sessions_version_idx on catalog.test_sessions(recipe_version_id);

create table catalog.editorial_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete cascade,
  kind catalog.review_kind not null,
  reviewer_id uuid references auth.users(id) on delete set null,
  decision catalog.review_decision not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  notes text not null,
  reviewed_at timestamptz not null default now()
);
create index editorial_reviews_version_idx on catalog.editorial_reviews(recipe_version_id, kind, reviewed_at desc);

create table catalog.rights_records (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid references catalog.recipe_versions(id) on delete cascade,
  appearance_id uuid references catalog.appearances(id) on delete cascade,
  media_asset_id uuid references catalog.media_assets(id) on delete cascade,
  status catalog.rights_status not null,
  basis text not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now(),
  expires_at timestamptz,
  check (num_nonnulls(recipe_version_id, appearance_id, media_asset_id) = 1)
);
create index rights_records_recipe_idx on catalog.rights_records(recipe_version_id);
create index rights_records_appearance_idx on catalog.rights_records(appearance_id);
create index rights_records_media_idx on catalog.rights_records(media_asset_id);

create table catalog.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  access_tier catalog.access_tier not null default 'member',
  primary_collection catalog.fandom_kind,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table catalog.collection_recipes (
  collection_id uuid not null references catalog.collections(id) on delete cascade,
  recipe_id uuid not null references catalog.recipes(id) on delete cascade,
  position integer not null check (position > 0),
  primary key (collection_id, recipe_id),
  unique (collection_id, position)
);
create index collection_recipes_recipe_idx on catalog.collection_recipes(recipe_id);

create table community.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (length(display_name) between 1 and 60),
  bio text not null default '' check (length(bio) <= 500),
  avatar_object_path text,
  profile_visibility community.visibility not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_username_lower_uidx on community.profiles(lower(username));

create table community.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en',
  market catalog.market_code not null default 'OTHER',
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  dietary_requirements text[] not null default '{}',
  excluded_allergens text[] not null default '{}',
  disliked_ingredient_ids uuid[] not null default '{}',
  reduced_motion boolean not null default false,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table community.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_id_idx on community.blocks(blocked_id);

create table community.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index follows_followed_id_idx on community.follows(followed_id, created_at desc);

create table community.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid references catalog.recipes(id) on delete set null,
  cook_log_id uuid,
  body text not null default '' check (length(body) <= 2000),
  visibility community.visibility not null default 'public',
  moderation_state community.moderation_state not null default 'pending',
  published_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_author_created_idx on community.posts(author_id, created_at desc);
create index posts_feed_idx on community.posts(created_at desc, id) where moderation_state in ('auto_passed', 'approved') and removed_at is null;
create index posts_recipe_id_idx on community.posts(recipe_id);

create table community.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community.posts(id) on delete cascade,
  quarantine_path text not null,
  sanitized_path text,
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  mime_type text check (mime_type is null or mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  width integer check (width is null or width between 1 and 12000),
  height integer check (height is null or height between 1 and 12000),
  state community.moderation_state not null default 'pending',
  alt_text text not null default '',
  created_at timestamptz not null default now(),
  unique (quarantine_path),
  unique (sanitized_path)
);
create index post_media_post_id_idx on community.post_media(post_id);

create table community.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references community.comments(id) on delete cascade,
  body text not null check (length(body) between 1 and 1000),
  moderation_state community.moderation_state not null default 'pending',
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index comments_post_created_idx on community.comments(post_id, created_at, id);
create index comments_author_id_idx on community.comments(author_id);
create index comments_parent_id_idx on community.comments(parent_id);

create table community.reactions (
  post_id uuid not null references community.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind community.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);
create index reactions_user_id_idx on community.reactions(user_id);

create table community.reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references catalog.recipes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (length(body) <= 2000),
  moderation_state community.moderation_state not null default 'pending',
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, author_id)
);
create index reviews_recipe_created_idx on community.reviews(recipe_id, created_at desc);
create index reviews_author_id_idx on community.reviews(author_id);

create table community.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  title text not null check (length(title) between 1 and 100),
  description text not null default '' check (length(description) <= 1000),
  visibility community.visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);
create index community_collections_owner_idx on community.collections(owner_id, created_at desc);

create table community.collection_items (
  collection_id uuid not null references community.collections(id) on delete cascade,
  recipe_id uuid not null references catalog.recipes(id) on delete cascade,
  note text not null default '' check (length(note) <= 500),
  position integer not null check (position > 0),
  added_at timestamptz not null default now(),
  primary key (collection_id, recipe_id),
  unique (collection_id, position)
);
create index collection_items_recipe_id_idx on community.collection_items(recipe_id);

create table community.saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references catalog.recipes(id) on delete cascade,
  offline_requested boolean not null default false,
  saved_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
create index saves_recipe_id_idx on community.saves(recipe_id);

create table community.cook_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references catalog.recipes(id) on delete restrict,
  recipe_version_id uuid not null references catalog.recipe_versions(id) on delete restrict,
  idempotency_key text not null check (length(idempotency_key) between 8 and 128),
  started_at timestamptz,
  completed_at timestamptz,
  servings numeric(8,2) check (servings is null or servings > 0),
  private_notes text not null default '' check (length(private_notes) <= 5000),
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index cook_logs_user_created_idx on community.cook_logs(user_id, created_at desc);
create index cook_logs_recipe_id_idx on community.cook_logs(recipe_id);
create index cook_logs_version_id_idx on community.cook_logs(recipe_version_id);

alter table community.posts
  add constraint posts_cook_log_id_fkey foreign key (cook_log_id) references community.cook_logs(id) on delete set null;
create index posts_cook_log_id_idx on community.posts(cook_log_id);

create table community.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  kind community.notification_kind not null,
  object_type text not null,
  object_id uuid,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_unread_idx on community.notifications(recipient_id, created_at desc) where read_at is null;

create table community.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'post', 'comment', 'review', 'collection', 'submission')),
  target_id uuid not null,
  reason community.report_reason not null,
  detail text not null default '' check (length(detail) <= 2000),
  status text not null default 'open' check (status in ('open', 'triaged', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (reporter_id, target_type, target_id, reason)
);
create index reports_status_created_idx on community.reports(status, created_at);

create table community.submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid not null references auth.users(id) on delete cascade,
  state community.submission_state not null default 'draft',
  proposed_title text not null check (length(proposed_title) between 1 and 150),
  source_declaration text not null check (length(source_declaration) between 10 and 3000),
  contributor_license_accepted_at timestamptz,
  payload jsonb not null default '{}',
  moderator_note text not null default '',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index submissions_submitter_created_idx on community.submissions(submitter_id, created_at desc);
create index submissions_review_queue_idx on community.submissions(state, submitted_at) where state in ('submitted', 'under_review');

create table private.age_policy_rules (
  country_code text primary key check (country_code = '*' or country_code ~ '^[A-Z]{2}$'),
  minimum_account_age smallint not null check (minimum_account_age between 13 and 18),
  minimum_social_age smallint not null check (minimum_social_age between 14 and 18),
  policy_version text not null,
  source_note text not null,
  effective_from date not null,
  reviewed_at timestamptz not null default now(),
  check (minimum_social_age >= minimum_account_age or minimum_account_age > 14)
);

create table private.account_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  country_code char(2) not null,
  date_of_birth date not null,
  state private.account_state not null default 'pending_age',
  age_rule_version text not null,
  social_eligible boolean not null default false,
  advertising_eligible boolean not null default false,
  accepted_at timestamptz,
  deletion_requested_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (date_of_birth <= current_date)
);

create table private.role_assignments (
  user_id uuid not null references auth.users(id) on delete cascade,
  role private.app_role not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, role)
);
create index role_assignments_active_idx on private.role_assignments(user_id, expires_at);

create table private.consent_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind private.consent_kind not null,
  action private.consent_action not null,
  policy_version text not null,
  country_code char(2) not null,
  occurred_at timestamptz not null default now(),
  request_id text,
  metadata jsonb not null default '{}'
);
create index consent_records_user_kind_idx on private.consent_records(user_id, kind, occurred_at desc);

create table private.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  action private.moderation_action_kind not null,
  reason text not null,
  previous_state jsonb not null default '{}',
  resulting_state jsonb not null default '{}',
  reversible boolean not null default true,
  reversed_by_action_id uuid references private.moderation_actions(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index moderation_actions_target_idx on private.moderation_actions(target_type, target_id, created_at desc);
create index moderation_actions_actor_idx on private.moderation_actions(actor_id, created_at desc);

create table private.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  request_id text,
  ip_hash text,
  user_agent_hash text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_logs_actor_created_idx on private.audit_logs(actor_id, created_at desc);
create index audit_logs_target_idx on private.audit_logs(target_type, target_id, created_at desc);

create table private.xp_rules (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  version integer not null check (version > 0),
  base_xp integer not null check (base_xp >= 0),
  supporter_multiplier numeric(5,2) not null default 1 check (supporter_multiplier between 1 and 5),
  cooldown_seconds integer not null default 0 check (cooldown_seconds between 0 and 2592000),
  daily_cap integer check (daily_cap is null or daily_cap >= 0),
  active_from timestamptz not null,
  active_until timestamptz,
  created_at timestamptz not null default now(),
  unique (event_type, version),
  check (active_until is null or active_until > active_from)
);
create unique index xp_rules_one_active_idx on private.xp_rules(event_type) where active_until is null;

create table private.game_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  entity_id uuid,
  idempotency_key text not null check (length(idempotency_key) between 8 and 128),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index game_events_user_type_created_idx on private.game_events(user_id, event_type, created_at desc);

create table private.xp_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_event_id uuid not null unique references private.game_events(id) on delete restrict,
  xp_rule_id uuid not null references private.xp_rules(id) on delete restrict,
  base_xp integer not null check (base_xp >= 0),
  multiplier numeric(5,2) not null check (multiplier >= 1),
  awarded_xp integer not null check (awarded_xp >= 0),
  reason text not null,
  awarded_at timestamptz not null default now()
);
create index xp_ledger_user_awarded_idx on private.xp_ledger(user_id, awarded_at desc);

create table private.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp bigint not null default 0 check (total_xp >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= current_streak),
  last_cook_on date,
  updated_at timestamptz not null default now()
);

create table private.quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  cadence text not null check (cadence in ('daily', 'weekly', 'seasonal', 'one_time')),
  event_type text not null,
  target_count integer not null check (target_count > 0),
  bonus_xp integer not null default 0 check (bonus_xp >= 0),
  active_from timestamptz not null,
  active_until timestamptz,
  created_at timestamptz not null default now()
);

create table private.quest_assignments (
  quest_id uuid not null references private.quests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  claimed_at timestamptz,
  primary key (quest_id, user_id)
);
create index quest_assignments_user_idx on private.quest_assignments(user_id, completed_at);

create table private.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  rarity text not null check (rarity in ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  criteria jsonb not null,
  cosmetic_key text,
  created_at timestamptz not null default now()
);

create table private.user_achievements (
  achievement_id uuid not null references private.achievements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_event_id uuid references private.game_events(id) on delete set null,
  awarded_at timestamptz not null default now(),
  primary key (achievement_id, user_id)
);
create index user_achievements_user_idx on private.user_achievements(user_id, awarded_at desc);

create table private.offers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  currency char(3) not null,
  interval private.plan_interval not null,
  founding_amount_minor integer not null check (founding_amount_minor > 0),
  published_amount_minor integer not null check (published_amount_minor >= founding_amount_minor),
  campaign_starts_at timestamptz,
  campaign_ends_at timestamptz,
  active boolean not null default true,
  gateway private.payment_gateway not null,
  external_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (campaign_ends_at is null or campaign_starts_at is not null),
  check (campaign_ends_at is null or campaign_ends_at > campaign_starts_at)
);

create table private.offer_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references private.offers(id) on delete restrict,
  amount_minor integer not null check (amount_minor > 0),
  currency char(3) not null,
  claimed_at timestamptz not null default now(),
  checkout_expires_at timestamptz not null,
  consumed_at timestamptz,
  external_checkout_id text,
  created_at timestamptz not null default now(),
  unique (user_id, offer_id),
  check (checkout_expires_at > claimed_at)
);
create index offer_claims_expiry_idx on private.offer_claims(checkout_expires_at) where consumed_at is null;

create table private.payment_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gateway private.payment_gateway not null,
  external_customer_id text not null,
  billing_country char(2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, gateway),
  unique (gateway, external_customer_id)
);

create table private.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gateway private.payment_gateway not null,
  external_subscription_id text not null,
  plan private.plan_interval not null check (plan <> 'lifetime'),
  status private.entitlement_status not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  source_webhook_event_id uuid,
  source_occurred_at timestamptz not null default '-infinity',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, external_subscription_id)
);
create index subscriptions_user_status_idx on private.subscriptions(user_id, status, current_period_end);

create table private.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gateway private.payment_gateway not null,
  external_customer_id text,
  external_purchase_id text not null,
  plan private.plan_interval not null,
  status private.entitlement_status not null,
  effective_from timestamptz not null,
  effective_until timestamptz,
  lifetime boolean not null default false,
  source_webhook_event_id uuid,
  source_occurred_at timestamptz not null default '-infinity',
  revoked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, external_purchase_id),
  check (lifetime = (plan = 'lifetime')),
  check ((lifetime and effective_until is null) or (not lifetime and effective_until is not null))
);
create index entitlements_user_active_idx on private.entitlements(user_id, status, effective_until);

create table private.webhook_events (
  id uuid primary key default gen_random_uuid(),
  gateway private.payment_gateway not null,
  external_event_id text not null,
  event_type text not null,
  external_occurred_at timestamptz not null,
  signature_verified boolean not null default false,
  raw_payload jsonb not null,
  state private.webhook_state not null default 'received',
  attempts integer not null default 0,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (gateway, external_event_id)
);
create index webhook_events_queue_idx on private.webhook_events(state, received_at) where state in ('received', 'failed');

alter table private.subscriptions
  add constraint subscriptions_source_webhook_fkey foreign key (source_webhook_event_id) references private.webhook_events(id) on delete restrict;
alter table private.entitlements
  add constraint entitlements_source_webhook_fkey foreign key (source_webhook_event_id) references private.webhook_events(id) on delete restrict;

create or replace function private.reject_immutable_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = format('%I.%I is append-only', tg_table_schema, tg_table_name);
end;
$$;

create or replace function private.protect_published_recipe_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.editorial_state = 'published' then
    raise exception using errcode = '55000', message = 'Published recipe versions are immutable; create a new version';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger protect_published_recipe_versions
before update or delete on catalog.recipe_versions
for each row execute function private.protect_published_recipe_version();

create trigger game_events_append_only before update or delete on private.game_events
for each row execute function private.reject_immutable_change();
create trigger xp_ledger_append_only before update or delete on private.xp_ledger
for each row execute function private.reject_immutable_change();
create trigger consent_records_append_only before update or delete on private.consent_records
for each row execute function private.reject_immutable_change();
create trigger audit_logs_append_only before update or delete on private.audit_logs
for each row execute function private.reject_immutable_change();

create trigger franchises_touch_updated_at before update on catalog.franchises for each row execute function private.touch_updated_at();
create trigger works_touch_updated_at before update on catalog.works for each row execute function private.touch_updated_at();
create trigger dishes_touch_updated_at before update on catalog.dishes for each row execute function private.touch_updated_at();
create trigger recipes_touch_updated_at before update on catalog.recipes for each row execute function private.touch_updated_at();
create trigger ingredients_touch_updated_at before update on catalog.ingredients for each row execute function private.touch_updated_at();
create trigger catalog_collections_touch_updated_at before update on catalog.collections for each row execute function private.touch_updated_at();
create trigger profiles_touch_updated_at before update on community.profiles for each row execute function private.touch_updated_at();
create trigger preferences_touch_updated_at before update on community.preferences for each row execute function private.touch_updated_at();
create trigger posts_touch_updated_at before update on community.posts for each row execute function private.touch_updated_at();
create trigger comments_touch_updated_at before update on community.comments for each row execute function private.touch_updated_at();
create trigger reviews_touch_updated_at before update on community.reviews for each row execute function private.touch_updated_at();
create trigger community_collections_touch_updated_at before update on community.collections for each row execute function private.touch_updated_at();
create trigger cook_logs_touch_updated_at before update on community.cook_logs for each row execute function private.touch_updated_at();
create trigger submissions_touch_updated_at before update on community.submissions for each row execute function private.touch_updated_at();
create trigger account_profiles_touch_updated_at before update on private.account_profiles for each row execute function private.touch_updated_at();
create trigger offers_touch_updated_at before update on private.offers for each row execute function private.touch_updated_at();
create trigger payment_customers_touch_updated_at before update on private.payment_customers for each row execute function private.touch_updated_at();
create trigger subscriptions_touch_updated_at before update on private.subscriptions for each row execute function private.touch_updated_at();
create trigger entitlements_touch_updated_at before update on private.entitlements for each row execute function private.touch_updated_at();

commit;
