# Anime FooDex threat model

**Status:** Pre-GA model for the current repository. Revalidate against the exact hosted projects and release commit.

## Assets and trust boundaries

The highest-value assets are private account/age/consent data, Supporter recipe details, payment entitlements, staff roles, the XP ledger, quarantined uploads, publication state, service credentials, and immutable audit/evidence records.

Trust boundaries exist between the browser and Next.js, Next.js and Supabase Data API, the exposed `api` schema and internal schemas, public and private Storage buckets, OAuth providers and callback handling, Stripe/Razorpay and raw webhook handlers, OpenAI moderation and the owner queue, the service worker and browser-private caches, and staff roles in Studio. Every value crossing a boundary is untrusted until authenticated, authorized, validated, and bound to the expected operation.

## Principal abuse cases and controls

| Abuse case                                                              | Required control                                                                                                                                           | Verification                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Anonymous or free user obtains quantities, steps, or Supporter content  | Protected invoker views, entitlement checks, private/no-store responses, preview-only metadata and sitemap                                                 | Cross-role RLS tests plus HTML/bundle/cache inspection              |
| User edits profile metadata to become staff/adult/Supporter             | Roles, DOB, eligibility, consent, and entitlements live in private tables; all decisions are server-side                                                   | Tampered-token/profile tests                                        |
| Forged or replayed payment event grants access                          | Raw-body signatures, event uniqueness, monotonic source time, normalized entitlement function, reconciliation                                              | Provider contract fixtures for duplicates and out-of-order events   |
| Client fabricates or replays XP                                         | Server-owned rule version/amount, transaction, cooldown, daily cap, idempotency key, append-only ledgers                                                   | Concurrent replay tests                                             |
| Upload becomes stored XSS, malware, tracking image, or unlawful media   | Private quarantine; magic bytes, raster decode, size/dimension bounds, re-encode/EXIF strip, hash, multimodal moderation, first-three/flagged owner review | Adversarial image corpus and bucket-policy tests                    |
| Blocked user sees or interacts with another user                        | Database block predicate on reads/actions and removal propagation                                                                                          | Both block directions across feed, profile, comment, follow, report |
| CSRF mutates account, billing, social, or deletion state                | Same-origin validation, authenticated cookie context, narrow schemas, safe redirect allow-list                                                             | Foreign/missing Origin tests                                        |
| OAuth return redirects to an attacker                                   | Relative-path allow-list and exact configured callback origins                                                                                             | Encoded/protocol-relative redirect tests                            |
| Service worker leaks one account’s private recipe to another            | Private cache partition, no shared caching, lease validation, purge on logout/deletion/entitlement loss                                                    | Two-account browser test plus offline expiry                        |
| Ad code profiles a teen, unknown-age user, or Supporter                 | Server ad decision, contextual default, explicit adult consent, provider-signal feature gate, prohibited-surface exclusion                                 | Age/consent/tier matrix and network inspection                      |
| Research source or franchise media leaks into production                | Isolated source intake; factual leads only; clean authored records; content and Git/Storage scans                                                          | Release evidence pack and random manual sampling                    |
| Staff or service credential performs untraceable publication/moderation | Narrow roles/functions, separation of duties, immutable audit with initiating actor/request ID                                                             | Role matrix and audit reconstruction                                |

## Security assumptions that block GA

- Vercel and Supabase production environments are separate from staging and use least-privilege secrets.
- Google and Discord OAuth, Stripe, Razorpay, the selected ad network/CMP, and the moderation API are approved and configured for the final origins.
- Platform firewall/rate-limit controls supplement the database account cooldowns for IP/device abuse.
- Backup restoration, deletion propagation, entitlement reconciliation, moderation escalation, and domain rollback have been rehearsed.
- Qualified legal, privacy, tax, culinary, allergen, and rights reviewers approve their release evidence.

If any assumption is false, the affected feature remains disabled or the release remains blocked. No Critical or High finding is accepted for GA.
