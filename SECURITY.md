# Anime FooDex Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability, leaked credential, private user data, payment detail, or a bypass of a content-safety control.

Use the repository's private [GitHub Security Advisory form](https://github.com/NishVibez/anime-foodex/security/advisories/new). Before GA, the product owner must also configure and test a monitored security contact in the repository and on the public security page. That contact is intentionally not invented in this repository.

Please include the affected surface, prerequisites, a minimal reproduction, likely impact, and whether any real user data was accessed. Use test accounts and synthetic data. Do not retain, download, or alter data beyond what is necessary to demonstrate the issue.

Response targets, measured in business days, are:

| Stage                      |                  Target |
| -------------------------- | ----------------------: |
| Acknowledge                |                  2 days |
| Initial severity and owner |                  5 days |
| Critical containment plan  |  1 day after validation |
| High containment plan      | 3 days after validation |

These are operating targets, not a bounty promise. A vulnerability-reward program has not been established.

## Supported versions

Anime FooDex is pre-GA. Only the latest revision of the protected `main` branch and the currently designated production deployment are supported. Preview deployments, local fixtures, research imports, and abandoned branches are not production systems, but a defect that can reach production through the build or release path remains in scope.

## System and scope

Anime FooDex is an internet-facing Next.js application deployed to Vercel with Supabase providing OAuth identity, Postgres, Storage, and limited Realtime invalidation. It includes:

- public catalog previews, search, discovery, and recommendation previews;
- authorized standard and Supporter recipe detail and offline cooking data;
- private profiles, age declarations, consent, saves, cook history, and progress;
- social posts, photos, comments, reactions, reviews, reports, and blocks;
- privileged editorial, rights, culinary-review, moderation, billing, and publication workflows;
- Stripe and Razorpay checkout and signed webhook processing;
- a server-authoritative XP and entitlement ledger; and
- quarantined research-source intake and user-media sanitization.

Repository code, migrations, CI/release automation, service configuration, and first-party browser caches are in scope. Provider infrastructure is outside our control, but unsafe integration, configuration, credential use, or failure handling in this repository is in scope.

## Threat model and trust boundaries

Attacker-controlled input includes URL and search parameters, OAuth return state, cookies, request bodies, Server Action arguments, webhook bodies and headers, recipe suggestions, profile and social text, links, image uploads, offline outbox events, source files, and third-party API responses. Anonymous users, authenticated members, Supporters, blocked users, malicious contributors, compromised browsers, and forged third-party callers must be treated as mutually untrusted.

Staff roles are trusted to perform only their assigned duties; possession of an account is not proof of editor, moderator, billing, or administrator authority. Vercel, Supabase, Google, Discord, Stripe, Razorpay, OpenAI Moderation, and active ad networks are separate trust zones. A detailed, reusable model is maintained in [`docs/security/threat-model.md`](docs/security/threat-model.md).

## Security invariants

The following properties must hold in production:

1. Authorization is enforced server-side and in Postgres. Browser state, request fields, user-editable profile metadata, and hidden UI never grant a role, entitlement, age eligibility, ownership, or XP.
2. The browser receives only public catalog previews unless an authenticated request is authorized for full detail. Quantities, instructions, Supporter content, private notes, and entitlement-bearing responses must not appear in public HTML, metadata, JSON-LD, client bundles, sitemaps, logs, or shared caches.
3. Every exposed table, view, function, and Storage operation has an explicit grant and row-level policy. Internal tables remain outside the Data API. Views use invoker security unless a narrowly justified alternative is reviewed.
4. Service-role, secret, provider, moderation, signing, and webhook credentials remain server-only, least-privileged, environment-scoped, rotatable, and absent from source, client bundles, logs, fixtures, and error responses.
5. First-party state-changing requests require authenticated identity, server-side schema validation, authorization, and origin/CSRF protection appropriate to the interface. Redirect targets are allow-listed.
6. Stripe and Razorpay webhooks are verified against the exact raw body before parsing or mutation. Event IDs are stored once; duplicate and out-of-order delivery cannot grant duplicate or stale entitlements.
7. XP, quests, streaks, offer claims, cook completion, and offline reconciliation use transactional, server-authoritative rules and idempotency keys. A client cannot choose an award amount or replay an event for additional credit.
8. Age declaration, country, consent history, provider email, billing identity, roles, moderation records, and audit logs are private. Public profiles never expose them.
9. Uploaded media remains non-public until it passes size, magic-byte, raster decode, dimension, animation, metadata-stripping, hash, automated moderation, and required human-review gates. SVG and executable content are rejected. Moderation failure is fail-closed.
10. Research PDFs and webpages are discovery inputs only. Protected scans, artwork, copied instructions, and extracted prose never enter production Storage or public output. Published recipes require separate occurrence evidence, culinary evidence, media rights, kitchen-test, allergen, culinary, and IP/rights sign-offs.
11. Published recipe versions, audit records, XP ledger entries, and accepted webhook events are append-only or corrected by a traceable successor event. Destructive administrative actions are reversible where technically possible and audited.
12. Private offline caches are user-bound, lease-bound where required, excluded from shared caches, and purged on logout, entitlement loss, account deletion, or failed revalidation.
13. Ads never render on prohibited surfaces or for Supporter sessions. Personalized ads require an authenticated adult, a valid unwithdrawn consent record, and a provider that consumes the approved signal.
14. Security-sensitive logs are structured and redact tokens, credentials, full webhook bodies, dates of birth, provider email, billing identity, private notes, and precise location.

## Reportable findings and severity context

A finding is reportable when it is realistically reachable and breaks an invariant in a way that gives an attacker new authority, cross-user access, protected content, financial effect, publication ability, moderation bypass, persistent script execution, or material availability impact.

- **Critical:** unauthenticated or broadly reachable service-secret disclosure; mass private-data extraction; arbitrary privileged publication or code execution; payment or entitlement compromise at scale.
- **High:** cross-user private-data access; Supporter recipe-detail bypass at scale; stored XSS on trusted pages; forged webhook entitlement; staff-role escalation; public release of quarantined media; reliable duplicate XP/financial award with material impact.
- **Medium:** limited cross-user metadata exposure; meaningful CSRF; consent/age control bypass without highly sensitive data; rate-limit or resource exhaustion with bounded production impact; audit-integrity gaps that materially hinder response.
- **Low:** defense-in-depth weakness, narrow information disclosure, or low-impact abuse requiring unusual conditions and no durable privilege gain.

Severity is reduced only by an effective, independently enforced prerequisite or compensating control—not by intended UI behavior, an unverified configuration, or a promise to monitor.

## Out of scope, exclusions, and accepted risk

No product security risks are owner-accepted at this pre-GA stage. The following are normally non-reportable unless they demonstrate a broken invariant or realistic impact:

- provider-wide availability incidents with no Anime FooDex integration defect;
- content taste, recipe authenticity, or editorial disagreement without a safety, rights, fraud, or authorization issue;
- self-XSS or effects limited to the reporter's own synthetic account;
- missing headers on a local-only development server when production applies the control;
- harmless version disclosure, speculative dependency concerns without a reachable affected path, and rate-limit observations without material impact; and
- social-engineering claims that assume an already-compromised administrator and add no new capability.

Do not test denial of service, send spam, contact users, upload unlawful or harmful material, attempt payment fraud, or probe provider infrastructure. If a safe proof is not possible, report the hypothesis privately.

## Known limitations and launch dependencies

This repository contains intended controls and pre-GA fixtures; their presence does not prove production enforcement. GA is blocked until the required hosted projects, OAuth credentials, monitored support/security/legal contact, OpenAI key and moderation availability, Razorpay activation, Stripe India access, accountant approval, ad-network/CMP approvals, culinary reviewers, and IP/rights reviewers exist and the release checklist is signed.

The production threat model, RLS/grant matrix, Storage policies, webhook paths, CSP, offline cache behavior, backup restore, provider settings, and deployment redirects must be verified against the actual deployed resources. No Critical or High finding may remain open at GA. A Medium finding requires a named owner, expiry date, documented compensating control, and explicit owner acceptance.

See [`docs/release/external-launch-dependencies.md`](docs/release/external-launch-dependencies.md) and [`docs/release/release-checklist.md`](docs/release/release-checklist.md).

## Secret and dependency handling

- Put secrets only in encrypted provider environment settings, scoped separately for Preview and Production. Use `.env.example` only for names.
- Rotate a credential immediately if it appears in Git history, an artifact, a log, a screenshot, or an unintended environment. Removing the current line is not remediation.
- Lock dependencies, review Dependabot and CodeQL findings, require the CI workflow on protected branches, and pin or carefully review third-party Actions.
- Enable GitHub secret scanning and push protection for the private repository if the account plan supports them. If unavailable, add a reviewed secret scanner before GA; CI pattern matching alone is not a substitute.
