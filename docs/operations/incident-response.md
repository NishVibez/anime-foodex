# Incident response runbook

**Status:** Pre-GA; staff names, private contacts, and provider escalation paths must be filled and tested before launch.

## Roles

| Role                  | Responsibility                                              | Must be named before GA |
| --------------------- | ----------------------------------------------------------- | ----------------------: |
| Incident commander    | Owns severity, timeline, decisions, and closure             |                     Yes |
| Technical lead        | Containment, remediation, verification, rollback            |                     Yes |
| Security/privacy lead | Evidence, exposure analysis, notification advice            |                     Yes |
| Content-safety lead   | Harmful content, moderation, affected users                 |                     Yes |
| Billing lead          | Stripe/Razorpay reconciliation, refunds, entitlement freeze |                     Yes |
| Communications lead   | Status, user, provider, and regulator/counsel drafts        |                     Yes |

One person may cover roles during pre-GA testing, but each decision must be recorded with the role they were acting in. Legal, regulatory, tax, and breach-notification decisions require qualified counsel or the designated professional; this runbook does not set a statutory deadline.

## Severity

| Level          | Examples                                                                                                                             |                          Initial response target |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -----------------------------------------------: |
| SEV-0 Critical | Active secret compromise, mass private-data access, privileged publication takeover, forged entitlements at scale, public quarantine |  Page immediately; contain within 1 hour target. |
| SEV-1 High     | Cross-user data, stored XSS, significant moderation fail-open, payment/reconciliation integrity loss                                 | Page immediately; contain within 4 hours target. |
| SEV-2 Medium   | Bounded privacy/security/control failure, partial outage with data risk, growing abuse campaign                                      |                    Assign within 1 business day. |
| SEV-3 Low      | Defense-in-depth gap, localized fault with no sensitive impact                                                                       |                  Normal backlog with owner/date. |

Use the highest plausible level until evidence lowers it. Availability-only provider incidents use the same coordination flow but do not become security incidents without a security/control impact.

## First 30 minutes

1. Create a restricted incident record with a random ID, UTC start time, reporter, affected environment, and current commander.
2. Stop unsafe automation: pause publication, moderation auto-eligibility, payment entitlement mutation, or deployment as relevant. Prefer a reversible kill switch or access restriction.
3. Preserve evidence before changing it: deployment ID, commit, migration version, relevant audit IDs, provider event IDs, object hashes, sanitized log excerpts, and current configuration digests. Never paste secrets, raw birth dates, full webhook bodies, harmful media, or payment identity into the record.
4. Contain the smallest boundary that stops harm: revoke a key, disable a route/provider, unpublish an object, block a bucket policy, pause webhooks, or roll back the app. Do not destroy forensic state.
5. Establish a UTC event timeline and a fixed update cadence. Record facts, hypotheses, decisions, owner, and verification separately.

## Investigation questions

- What exact asset or invariant is affected, and in which environments?
- What is the earliest evidence of exposure and the last known safe revision/event?
- Which users, objects, recipe versions, payment events, or content were actually reachable—not merely present?
- Was authority gained through browser code, Server Action/Route Handler, Supabase grant/RLS, Storage, provider configuration, offline cache, or staff workflow?
- Were logs, backups, previews, CDN caches, sitemaps, analytics, or third parties secondary recipients?
- Does containment work for an unauthenticated, unrelated member, Supporter, blocked user, and compromised replay attempt?

## Containment playbooks

### Credential or secret exposure

Revoke/rotate at the issuing provider, remove the value from every environment and artifact, inspect usage since the earliest exposure, replace dependent webhook/OAuth configuration, redeploy, and verify the old value fails. Rewriting a file or Git history alone is not containment.

### Authorization or protected-content leak

Disable the affected read/mutation, revoke public grants/policies if needed, purge shared/CDN caches, expire relevant offline leases, identify accessed records from minimal logs, repair policy plus tests, and verify with cross-user matrices before restoration.

### UGC or moderation fail-open

Disable automatic publication and public access to affected object prefixes, move all uncertain items to the owner queue, preserve hashes, rescan sanitized objects, invalidate feeds/search, and follow specialist/legal escalation for personal, minor, or unlawful content.

### Payment or entitlement integrity

Pause automatic entitlement changes, continue storing verified incoming event IDs if safe, snapshot provider and local state, reconcile from provider APIs, correct with append-only events, and notify/refund only after billing/accounting approval. Never delete conflicting webhook history.

### XP or offer replay

Disable the award/claim RPC, preserve event/idempotency keys, calculate affected ledger entries, append compensating entries, and re-enable only after duplicate/concurrency tests pass.

## Recovery and verification

Recovery requires a reviewed fix, tests for the observed path, negative cross-user tests, configuration readback from the deployed environment, clean monitoring for an agreed window, and the incident commander's approval. Restore one dependency at a time. If a database correction is required, use a reviewed forward migration or append-only compensating event; never improvise destructive production commands.

After recovery, update affected credentials, policies, runbooks, tests, alerts, and the threat model. Track user deletion/cache purge and provider reconciliation to completion.

## Communication and notification

Only the communications lead sends external updates. State confirmed scope, user action, mitigation, and the next update time; do not speculate or expose another user. Coordinate payment wording with processors/accountant and privacy/breach wording with counsel. Keep provider receipts and message versions in the restricted incident record.

## Closure

Within five business days of stabilization, produce a blameless review containing impact, detection, timeline, root and contributing causes, why existing controls did not prevent/detect it, remediation owners/dates, notification decisions, and evidence that recovery worked. An incident closes only when temporary controls have owners and expiry dates, all affected systems are reconciled, and follow-up work is tracked.

## Drill cadence

Run tabletop drills before GA and twice yearly. Rotate at least: leaked Supabase secret, forged Stripe/Razorpay event, public quarantine policy, cross-user RLS regression, and protected recipe leaked into public metadata/offline cache.
