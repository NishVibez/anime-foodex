begin;

insert into catalog.units (code, quantity_kind, metric_label, imperial_label, is_base_unit)
values
  ('g', 'mass', 'g', 'oz', true),
  ('kg', 'mass', 'kg', 'lb', false),
  ('ml', 'volume', 'ml', 'fl oz', true),
  ('l', 'volume', 'L', 'qt', false),
  ('tsp', 'volume', 'tsp', 'tsp', false),
  ('tbsp', 'volume', 'tbsp', 'tbsp', false),
  ('cup', 'volume', 'cup', 'cup', false),
  ('piece', 'count', 'piece', 'piece', true),
  ('pinch', 'other', 'pinch', 'pinch', false),
  ('to_taste', 'other', 'to taste', 'to taste', false),
  ('c', 'temperature', '°C', '°F', true),
  ('minute', 'time', 'min', 'min', true)
on conflict (code) do update set
  quantity_kind = excluded.quantity_kind,
  metric_label = excluded.metric_label,
  imperial_label = excluded.imperial_label,
  is_base_unit = excluded.is_base_unit;

insert into catalog.allergens (code, label, eu_required, us_major)
values
  ('celery', 'Celery', true, false),
  ('crustacean', 'Crustacean shellfish', true, true),
  ('egg', 'Egg', true, true),
  ('fish', 'Fish', true, true),
  ('gluten', 'Cereals containing gluten', true, true),
  ('lupin', 'Lupin', true, false),
  ('milk', 'Milk', true, true),
  ('mollusc', 'Molluscs', true, false),
  ('mustard', 'Mustard', true, false),
  ('peanut', 'Peanut', true, true),
  ('sesame', 'Sesame', true, true),
  ('soy', 'Soy', true, true),
  ('sulphite', 'Sulphites', true, false),
  ('tree_nut', 'Tree nuts', true, true)
on conflict (code) do update set
  label = excluded.label,
  eu_required = excluded.eu_required,
  us_major = excluded.us_major;

insert into private.age_policy_rules (
  country_code, minimum_account_age, minimum_social_age, policy_version, source_note, effective_from
)
values
  ('*', 13, 14, 'ga-2026-08-draft', 'Global fallback. Legal approval is required before GA.', '2026-08-01'),
  ('IN', 18, 18, 'ga-2026-08-draft', 'India launch rule: parental-consent support is intentionally excluded.', '2026-08-01'),
  ('AT', 14, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('BE', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('BG', 14, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('HR', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('CY', 14, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('CZ', 15, 15, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('DK', 15, 15, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('EE', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('FI', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('FR', 15, 15, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('DE', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('GR', 15, 15, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('HU', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('IE', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('IT', 14, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('LV', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('LT', 14, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('LU', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('MT', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('NL', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('PL', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('PT', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('RO', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('SK', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('SI', 16, 16, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('ES', 14, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('SE', 13, 14, 'ga-2026-08-draft', 'EEA digital-consent baseline; verify with launch counsel.', '2026-08-01'),
  ('GB', 13, 14, 'ga-2026-08-draft', 'UK digital-consent baseline; verify with launch counsel.', '2026-08-01')
on conflict (country_code) do update set
  minimum_account_age = excluded.minimum_account_age,
  minimum_social_age = excluded.minimum_social_age,
  policy_version = excluded.policy_version,
  source_note = excluded.source_note,
  effective_from = excluded.effective_from,
  reviewed_at = statement_timestamp();

insert into private.xp_rules (
  event_type, version, base_xp, supporter_multiplier, cooldown_seconds, daily_cap, active_from
)
values
  ('cook_completed', 1, 100, 1.10, 300, 550, '2026-01-01T00:00:00Z'),
  ('review_published', 1, 25, 1.10, 3600, 110, '2026-01-01T00:00:00Z'),
  ('recipe_saved', 1, 5, 1.10, 60, 55, '2026-01-01T00:00:00Z'),
  ('quest_completed', 1, 50, 1.10, 0, null, '2026-01-01T00:00:00Z')
on conflict (event_type, version) do update set
  base_xp = excluded.base_xp,
  supporter_multiplier = excluded.supporter_multiplier,
  cooldown_seconds = excluded.cooldown_seconds,
  daily_cap = excluded.daily_cap,
  active_from = excluded.active_from;

insert into private.offers (
  code, title, currency, interval, founding_amount_minor, published_amount_minor, gateway, active
)
values
  ('founder-in-monthly', 'Supporter Monthly — India', 'INR', 'monthly', 29900, 59900, 'razorpay', false),
  ('founder-in-yearly', 'Supporter Yearly — India', 'INR', 'yearly', 239900, 479900, 'razorpay', false),
  ('founder-in-lifetime', 'Supporter Lifetime — India', 'INR', 'lifetime', 599900, 1199900, 'razorpay', false),
  ('founder-intl-monthly', 'Supporter Monthly — International', 'USD', 'monthly', 499, 999, 'stripe', false),
  ('founder-intl-yearly', 'Supporter Yearly — International', 'USD', 'yearly', 3999, 7999, 'stripe', false),
  ('founder-intl-lifetime', 'Supporter Lifetime — International', 'USD', 'lifetime', 9999, 19999, 'stripe', false)
on conflict (code) do update set
  title = excluded.title,
  founding_amount_minor = excluded.founding_amount_minor,
  published_amount_minor = excluded.published_amount_minor,
  gateway = excluded.gateway;

insert into private.quests (slug, title, description, cadence, event_type, target_count, bonus_xp, active_from)
values
  ('first-bite', 'First Bite', 'Complete one recipe.', 'one_time', 'cook_completed', 1, 50, '2026-01-01T00:00:00Z'),
  ('daily-dish', 'Daily Dish', 'Complete one recipe today.', 'daily', 'cook_completed', 1, 25, '2026-01-01T00:00:00Z'),
  ('weekly-kitchen-arc', 'Kitchen Arc', 'Complete three recipes this week.', 'weekly', 'cook_completed', 3, 150, '2026-01-01T00:00:00Z')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  cadence = excluded.cadence,
  event_type = excluded.event_type,
  target_count = excluded.target_count,
  bonus_xp = excluded.bonus_xp;

insert into private.achievements (slug, title, description, rarity, criteria, cosmetic_key)
values
  ('mise-en-place', 'Mise en Place', 'Save your first recipe.', 'common', '{"event":"recipe_saved","count":1}', 'frame-rice-paper'),
  ('season-finale', 'Season Finale', 'Complete ten recipes.', 'rare', '{"event":"cook_completed","count":10}', 'badge-vermilion-bowl'),
  ('hundred-plates', 'Hundred Plates', 'Complete one hundred recipes.', 'legendary', '{"event":"cook_completed","count":100}', 'frame-jade-master')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  rarity = excluded.rarity,
  criteria = excluded.criteria,
  cosmetic_key = excluded.cosmetic_key;

commit;
