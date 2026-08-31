# `animefoodex.com` domain cutover runbook

Domain purchase and paid-plan changes are never automated by this repository. The user will acquire `animefoodex.com`; all steps below occur only after ownership is verified.

## Target behavior

- `https://animefoodex.com` is the sole canonical origin.
- `https://www.animefoodex.com` and the assigned `*.vercel.app` production URL redirect permanently to the same path and safe query string on the apex host.
- HTTP redirects to HTTPS. Unknown hosts are rejected; user-supplied return URLs never control the destination.
- Existing public recipe/collection URLs retain their paths. No redirect exposes authorized content or forwards OAuth/payment parameters to an untrusted host.

## Prerequisites

- [ ] Registrar account uses MFA, recovery codes, registry lock where available, and least-privileged DNS access.
- [ ] Vercel Production project and Supabase Production project are final and verified.
- [ ] The exact current `vercel.app` slug is recorded; no code assumes an unconfirmed slug.
- [ ] DNS zone is copied/exported and TTLs are reduced at least one prior TTL window before cutover.
- [ ] Canonical redirect behavior is implemented and tested on Preview with host simulation.
- [ ] Monitored `security@`, `privacy@`, `support@`, and legal/takedown addresses or approved equivalents exist; do not publish them before they work.
- [ ] OAuth, payment, CMP, ad, analytics, and monitoring owners are present for the cutover window.

## Cutover sequence

1. Add and verify the apex and `www` domains in Vercel. Follow the exact DNS records Vercel displays; do not copy stale example records.
2. Configure the apex as production primary and `www` as a redirect alias. Retain the assigned Vercel hostname as a redirect source.
3. Wait for authoritative DNS and certificate issuance. Verify CAA/DNSSEC decisions with the registrar and hosting requirements.
4. Set `NEXT_PUBLIC_SITE_URL`/canonical-host configuration for Production without changing Preview. Redeploy the already reviewed commit.
5. Update Supabase Auth site URL and exact additional redirect allow-list. Remove wildcards not required for controlled Vercel Preview flows. Configure Google and Discord authorized origins/callbacks exactly; test state, PKCE, linking after reauthentication, logout, and rejected foreign return URLs.
6. Update Stripe Checkout/Portal return URLs and signed webhook endpoint; update Razorpay callback/webhook configuration. Keep old signed endpoints active only for a bounded overlap so in-flight events are accepted idempotently.
7. Update OpenAI moderation allow/usage controls where applicable, Google Privacy & Messaging/CMP, each approved ad network, analytics, uptime checks, CSP sources, and any provider domain verification.
8. Verify robots, sitemap, Open Graph/canonical tags, structured data, public previews, and that recipe detail/Supporter data is absent from them.
9. Send test transactions only in provider test modes. Verify raw signature checks, event IDs, redirect origins, reconciliation, and no duplicate entitlement.
10. Raise DNS TTLs after the observation window and record the final zone/configuration digest.

## Verification matrix

Test desktop/mobile and an uncached external network:

| Request                         | Expected                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `http://animefoodex.com/a?x=1`  | One or bounded redirect chain to HTTPS apex, same safe path/query.                    |
| `https://www.animefoodex.com/a` | Permanent redirect to HTTPS apex `/a`.                                                |
| Production Vercel URL `/a`      | Permanent redirect to apex `/a`.                                                      |
| Preview Vercel URL              | Remains Preview; never claims canonical production and never uses Production secrets. |
| Unknown `Host`/forwarded host   | Rejected or resolved without attacker-controlled redirect.                            |
| OAuth login/link/logout         | Exact callback succeeds; foreign/old unapproved redirect fails.                       |
| Stripe/Razorpay test event      | Signature succeeds once; duplicate/out-of-order event is safe.                        |
| Public recipe URL               | Canonical tag is apex; detail remains authorized.                                     |
| Service worker/offline cache    | Scope is apex; old-origin private cache is inaccessible/expired.                      |

Run the full security and end-to-end suites after cutover.

## Mail DNS

Branded transactional email is not a GA dependency and remains disabled until mail is intentionally introduced. If/when enabled, configure provider verification, SPF, DKIM, DMARC in monitoring mode then enforce after validated delivery, separate transactional from support mail, and re-run privacy/security review. Never publish a contact address that is unmonitored.

## Rollback

If TLS, DNS, OAuth, payments, redirects, or protected-content boundaries fail, stop promotion and restore the prior DNS records/configuration. Keep the previous origin available for a bounded rollback window but do not split writes across two production backends. Reconcile webhooks accepted during the window and invalidate old-origin private/offline caches. Record actual DNS propagation; do not claim instant rollback.
