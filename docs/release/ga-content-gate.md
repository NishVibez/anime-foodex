# GA content gate

The generated catalog fixture is research-only test data. It proves quota validation, not authorship, evidence, rights, safety, or kitchen review. `CONTENT_GATE_MODE=candidate` is the safe default; production promotion requires a separate, explicit GA validation result against the production content snapshot.

## Non-negotiable quotas

| Gate                                      |   Required result |
| ----------------------------------------- | ----------------: |
| Publishable recipes                       |       Exactly 420 |
| Verified appearance/connection records    |    At least 1,000 |
| Recipes per primary collection            |   Exactly 84 each |
| Appearance records per primary collection | At least 200 each |
| Standard recipes                          |  No more than 200 |
| Supporter recipes                         |      At least 220 |

Primary collections are `anime`, `animation`, `game`, `film`, and `theme_park`. Each recipe and appearance has exactly one quota-counting primary collection. Cross-links never count a record twice.

## Per-recipe gate

Every exact published recipe version must have:

- globally unique immutable ID and canonical lowercase slug;
- one canonical dish, one quota-counting primary collection, and intended access tier;
- at least one independently verified occurrence with precise medium-specific locator;
- independently authored teaser, headnote, structured ingredients, quantities, instructions, substitutions, timers, yield, equipment, scaling, and cooking-mode data;
- metric source quantities and reviewed imperial conversions;
- dietary/allergen assessment and explicit cross-contact/safety notes where relevant;
- availability/substitution review for India, North America, Europe, and configured other markets;
- completed kitchen test on the exact version with yield, timings, temperatures, deviations, and outcome;
- culinary reviewer sign-off and separate IP/rights decision;
- original/licensed media record covering the deployed asset and intended use;
- rights status `licensed`, `creator_permission`, `public_domain`, or `original_editorial` as supported by its evidence;
- immutable publication record, reviewer identities/timestamps, and audit request ID; and
- no protected source prose, scans, artwork, screenshots, or unlicensed media in text, assets, metadata, or history shipped to production.

## Per-appearance gate

Each connection has a unique ID, canonical dish/work or location, `AppearanceType`, quota-counting primary collection, source, precise locator, verifier, verification date, and evidence status `verified`. Candidate articles and cookbooks may seed the record but do not satisfy verification by themselves.

## Automated validation

The domain validator in `src/domain/catalog-validation.ts` enforces counts, quotas, unique IDs/slugs, references, publication state, rights state, evidence locator count, and sign-off booleans. Content CI must run it against the immutable export intended for deployment in GA mode, emit a machine-readable report, and fail on any issue.

Automation cannot validate whether a person actually cooked a recipe, owns an image, independently authored prose, correctly assessed allergens, or has legal authority. Those fields require signed evidence; bulk-filled booleans are a release-integrity incident.

## Release evidence pack

Archive a read-only evidence pack identified by catalog snapshot digest:

1. machine-readable validation report and exact input digest;
2. totals and per-collection/access-tier breakdown;
3. duplicate/reference/slug report;
4. missing/stale review report;
5. protected-expression/media scan report and manual sample record;
6. rights, culinary, allergen, and media sign-off indexes with opaque reviewer IDs;
7. search/preview/detail leak test and sitemap/JSON-LD inspection;
8. random sample of at least 10 recipes per primary collection, including standard and Supporter records;
9. unresolved corrections, safety cases, rights complaints, and takedowns; and
10. approvals by product owner, editorial lead, culinary lead, and rights lead.

Evidence documents may link to restricted records but must not copy birth dates, user data, source scans, credentials, or protected text into CI artifacts.

## Freeze and change control

After content freeze, any recipe, appearance, media, rights, allergen, access-tier, or primary-collection change creates a new snapshot and reruns the complete gate. Critical safety/takedown removals remain allowed and automatically block GA until quotas are restored with independently reviewed replacements.

## Gate result template

| Field                   | Value             |
| ----------------------- | ----------------- |
| Snapshot digest         | _unfilled_        |
| Validation UTC          | _unfilled_        |
| Automated result        | **Not run**       |
| Human evidence sampling | **Not performed** |
| Culinary approval       | **Not provided**  |
| Rights approval         | **Not provided**  |
| Product owner decision  | **Blocked**       |

This template remains blocked in source control. Only the release evidence system records an actual result.
