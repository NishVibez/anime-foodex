# Production GA release checklist

Anime FooDex is a big-bang public GA. This checklist is deliberately unchecked. A checked item must link to immutable evidence for the exact release commit, database migration set, provider configuration, and catalog snapshot.

## 1. Ownership and governance

- [ ] Release commit, Vercel deployment, Supabase project/migrations, catalog digest, and GA UTC are recorded.
- [ ] Incident, security/privacy, content-safety, billing, editorial, culinary, rights, and communications owners are named and available.
- [ ] Monitored support/security/privacy/legal contacts pass inbound and escalation tests.
- [ ] Terms, privacy, community rules, cookie/consent, refund, lifetime, contributor, correction, takedown, and counter-notice materials have qualified review.
- [ ] Indian accountant has approved GST, invoice, export/remittance, tax, refund, and bookkeeping flows.
- [ ] No unresolved Critical/High security issue exists; every accepted Medium has owner, expiry, compensation, and explicit approval.

## 2. Infrastructure and identity

- [ ] Private GitHub repository has protected `main`, required CI/review, MFA-capable owners, secret scanning/push protection or approved substitute, CodeQL, Dependabot, and tested advisory reporting.
- [ ] Vercel Pro Preview/Production separation, environment secrets, logs, firewall/rate limits, observability, and rollback are verified.
- [ ] Clean Supabase Pro Production has explicit `api` exposure only, explicit grants/RLS, advisors reviewed, separate staging, backup retention, and successful restore drill.
- [ ] Google and Discord OAuth use exact production origins/callbacks; state/PKCE, reauthentication linking, logout, provider-email privacy, and foreign redirect rejection pass.
- [ ] Age declaration and country are private; global/EEA/India account thresholds and 14+ social gate pass dated tests and legal review.
- [ ] Export, deletion, consent withdrawal, block/report history, and cache/index/object purge complete end to end.

## 3. Catalog and cooking

- [ ] GA content gate reports at least 420 publishable recipes, at least 1,000 verified appearances, at least 84/200 per collection, at most 200 standard, and at least 220 Supporter.
- [ ] Culinary, allergen, rights, occurrence, media, and kitchen-test evidence is real, version-bound, sampled, and approved.
- [ ] Supplied PDFs/web sources and protected expression/media are absent from production Storage, Git history, client bundles, pages, metadata, logs, and CI artifacts.
- [ ] Search, filters, aliases, Japanese/romanized names, cursor pagination, recommendation hard exclusions, regions, units, scaling, substitutions, timers, and cooking mode pass.
- [ ] Public HTML/JSON-LD/sitemap/cache contains previews only; standard and Supporter detail requires authorization.
- [ ] Published version immutability, correction successor, retirement, takedown, canonical slugs, and no broken links pass.

## 4. Community, safety, and game

- [ ] Follows/feed/posts/photos/reactions/comments/reviews/collections/notifications/reports/blocks/suggestions pass owner/cross-user/blocked-user/deleted-user cases.
- [ ] Media magic-byte, limits, raster decode/re-encode, EXIF strip, hashing, quarantine, moderation, first-three-owner review, sampling, appeal, and removal propagation pass.
- [ ] Moderation outage/rate-limit/no-cost failure is fail-closed; queue alerts reach the owner.
- [ ] Rate limits, cooldowns, duplicate/link/spam detection, device/account/IP controls, reversible actions, and audit logs pass abuse tests.
- [ ] Server-authoritative XP, versioned rules, documented Supporter bonus, idempotency, cooldown, transactional ledger, quests, streaks, achievements, and friends-only leaderboard pass concurrency/replay tests.

## 5. Billing, offers, ads, and consent

- [ ] Razorpay INR routing by declared billing country, subscriptions, lifetime captured order, raw signatures, duplicates/out-of-order, refund/dispute/cancel/failure, and reconciliation pass in live-approved configuration.
- [ ] Stripe international subscriptions/lifetime/Checkout/Portal, India account access, tax display, raw signatures, duplicates/out-of-order, refund/dispute/cancel/failure, and reconciliation pass.
- [ ] One normalized entitlement ledger produces identical user-visible outcomes across gateways and purges lost offline access.
- [ ] Founding prices/end date are truthful; claim starts deliberately, never resets, creates checkout once, and distinguishes provider expiry.
- [ ] Provider-neutral ad adapter activates only one approved network, at most two allowed slots, no ads for Supporters/prohibited surfaces, and no intrusive formats.
- [ ] Anonymous/unknown/teen traffic is contextual only; personalized ads require authenticated 18+, valid consent, and supported signal; withdrawal propagates.

## 6. PWA, accessibility, performance, and resilience

- [ ] Shell/previews/selected authorized recipes/active cooking/timers/progress outbox work under planned offline scenarios.
- [ ] Logout, account deletion, entitlement loss/lease expiry, and failed revalidation purge private caches; social/billing clearly require connectivity.
- [ ] Offline reconciliation is idempotent and awards exactly one cook/XP event after reconnect.
- [ ] WCAG 2.2 AA review covers keyboard, focus, landmarks, names, errors, contrast, dark mode, reduced motion, zoom, and screen readers.
- [ ] Supported mobile/desktop browsers pass; Core Web Vitals are good at p75 with production data and consent/ad behavior.
- [ ] Load/failure tests cover search, feed, upload, auth, webhooks, XP, catalog publication, and provider degradation.

## 7. Security and operations

- [ ] Threat model and `SECURITY.md` match deployed architecture; standard full-repository Codex Security scan ran after implementation, findings were validated/fixed, and re-scan evidence is attached.
- [ ] CSP/nonces, security headers, CSRF/origin validation, validation schemas, safe redirects, upload isolation, log redaction, dependencies, secrets, SAST, database/storage advisors, and cache controls pass.
- [ ] Structured dashboards and alerts cover uptime/errors, authorization, moderation, billing/ads, audit failure, backups, and content gate; synthetic delivery is acknowledged.
- [ ] Monthly backup restore, deployment rollback, domain cutover rollback, incident tabletop, and webhook reconciliation drills pass within measured targets.
- [ ] Domain/TLS/canonical redirects, OAuth/payment/ad origins, DNS, robots/sitemap, and old-origin cache behavior pass after `animefoodex.com` cutover.

## Final decision

| Approval           | Person       | Evidence | UTC    | Decision    |
| ------------------ | ------------ | -------- | ------ | ----------- |
| Product owner      | _unassigned_ | _none_   | _none_ | **Blocked** |
| Security/privacy   | _unassigned_ | _none_   | _none_ | **Blocked** |
| Editorial          | _unassigned_ | _none_   | _none_ | **Blocked** |
| Culinary           | _unassigned_ | _none_   | _none_ | **Blocked** |
| Rights/legal       | _unassigned_ | _none_   | _none_ | **Blocked** |
| Billing/accounting | _unassigned_ | _none_   | _none_ | **Blocked** |

No code change may pre-fill this table with a pass.
