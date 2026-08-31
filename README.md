# Anime FooDex

**The fandom food encyclopedia.** Anime FooDex is a production-oriented Next.js application for discovering, collecting, cooking, and discussing independently authored recipes connected to animation, games, films, and themed worlds.

The repository is private and pre-GA. Its bundled catalog is a structural research fixture, not a claim that the editorial launch gate has been met. Nothing may be promoted to GA until the release checklist, 420-recipe/1,000-appearance content gate, rights review, kitchen testing, provider approvals, and production security checks are complete.

## Product surfaces

- Public catalog previews, discovery, full-text search, collections, and deterministic “What should I eat?” recommendations.
- Member Vault, authorized recipe detail, cooking mode, personal progress, social feed, reviews, collections, reports, and blocks.
- Server-authoritative XP, quests, achievements, streaks, entitlements, and offer claims.
- Google and Discord OAuth onboarding with private country/age eligibility checks.
- Stripe and Razorpay checkout/webhook normalization behind one entitlement model.
- Quarantined, sanitized UGC media and fail-closed automated moderation.
- Installable offline cooking with account- and entitlement-bound caches.
- Editorial, culinary, rights, moderation, billing, and publication Studio routes.

## Technology

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Node.js 22+, and pnpm.
- Supabase Auth, Postgres, Storage, and limited Realtime. Internal data is separated into `catalog`, `community`, and `private` schemas; only reviewed `api` views/functions are intended for Data API exposure.
- Vercel Preview and Production environments with separate environment settings.

## Local setup

1. Install Node.js 22+ and pnpm 10+.
2. Copy `.env.example` to `.env.local` and populate only local or staging credentials.
3. Start the local Supabase stack and apply the reviewed migrations in `supabase/migrations`.
4. Install and run the application:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. Never put a service-role, payment secret, moderation key, or webhook secret in a `NEXT_PUBLIC_` variable.

## Verification

Run the complete repository gate before every release candidate:

```bash
pnpm verify
pnpm test:e2e
```

Database policy tests live in `supabase/tests/database.test.sql`. The hosted project must also pass Supabase security advisors, a clean Codex Security scan, browser verification, provider webhook contract tests, accessibility checks, a backup/restore drill, and the release checklist.

## Operations and release safety

- Start with the [operating handbook](docs/README.md), [security policy](SECURITY.md), and [release checklist](docs/release/release-checklist.md).
- Supplied cookbooks and webpages are research-only discovery inputs. Do not commit, upload, reproduce, or publish protected scans, artwork, instructions, or prose.
- Public previews must never contain recipe quantities or instructions. Published versions are immutable; corrections create audited successors.
- Keep `CONTENT_GATE_MODE=candidate` until the independently verified GA corpus is complete.
- Keep ads disabled until consent behavior and one approved provider are verified. Keep billing disabled until the business, tax, processor, webhook, refund, and reconciliation workflows are approved.
- `animefoodex.com` is a future custom domain. Follow `docs/operations/domain-cutover.md` after purchase; do not enable canonical-host enforcement earlier.

## Repository

The intended private remote is `NishVibez/anime-foodex`. Branch protection, required checks, private vulnerability reporting, Dependabot, secret scanning/push protection, and least-privilege collaborator access must be configured before GA.
