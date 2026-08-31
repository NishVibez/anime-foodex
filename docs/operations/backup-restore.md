# Backup and restore runbook

**Pre-GA dependency:** Production must use Supabase Pro. Confirm the actual backup retention, point-in-time recovery availability, Storage recovery behavior, and regional options in the purchased plan before setting the final RPO/RTO. Do not infer that database backups include Storage objects.

## Recovery objectives

Provisional product targets are an RPO of 24 hours for catalog/community state, 15 minutes for verified payment/entitlement events after provider reconciliation, and an RTO of 8 hours. These are unverified targets until a production-shaped restore drill demonstrates them. The product owner may tighten them only after capacity and cost approval.

## Protected sets

| Set                                                                 | Recovery source                                                         | Special reconciliation                                                                            |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Postgres schemas, Auth-linked app records, audit/XP/payment ledgers | Supabase backup/PITR plus reviewed migrations                           | Reconcile Auth, Stripe, Razorpay, moderation, and deletion events after restore point.            |
| Editorial and sanitized UGC objects                                 | Storage backup/export mechanism verified for the production plan        | Reconcile object rows, bucket policies, hashes, derivatives, and CDN state.                       |
| Vercel application/config                                           | Git commit, lockfile, Vercel deployment history, encrypted env settings | Restore exact commit; rotate secrets exposed during incident.                                     |
| Provider state                                                      | Stripe/Razorpay/OpenAI/OAuth/ad provider dashboards and APIs            | Providers are authoritative only for their own events/settings, not app roles or editorial state. |
| Research sources                                                    | Isolated research process only                                          | Not copied into production backup. Retain/delete under the editorial policy.                      |

Do not put credential values into backup manifests. Record key names, versions, owner, and recovery procedure.

## Daily checks

1. Confirm the provider reports a successful backup for the expected production project and region.
2. Alert if the newest recovery point exceeds the approved RPO.
3. Verify object backup/export job status separately from database status.
4. Record storage/database size trends and projected restore time.
5. Confirm billing/moderation webhook queues have no old unprocessed events; backups do not replace reconciliation.

## Monthly restore drill

1. Open a change/incident-style record with scope, selected recovery point, operators, and expected data classifications.
2. Provision an isolated recovery project with no public custom domain, OAuth callbacks, live webhooks, ad IDs, cron, email, or production service integrations.
3. Restore the database to the recovery project. Apply only migrations that belong after the selected recovery point and record each one.
4. Restore or attach copied Storage objects through the approved mechanism. Never make quarantine public.
5. Replace all external secrets with disabled/test credentials and block outbound payment, moderation, and user notification calls.
6. Read back schema exposure, grants, RLS, function ownership/search paths, buckets, policies, Auth redirect allow-list, and migration versions.
7. Validate sampled counts and hashes for users, current recipe versions, appearances, media links, blocks/reports, audit records, XP ledger, webhook IDs, entitlements, and deletions/legal holds.
8. Run cross-user authorization tests and public-preview/detail separation against the isolated project.
9. Rehearse post-point reconciliation using synthetic Stripe/Razorpay events, including duplicate and out-of-order cases. Confirm append-only corrections and no duplicate entitlement.
10. Measure effective RPO/RTO, document missing objects/events, and create dated remediation work.
11. Destroy the isolated recovery environment through an approved provider workflow after evidence is retained and expiry is confirmed.

A successful command is not a successful drill. The owner signs only after application-level data and security checks pass.

## Production recovery

1. Declare an incident and freeze writes or affected workflows.
2. Select a recovery point before the first corrupt/destructive event, balancing data loss against integrity.
3. Prefer restore to a new project so the original remains evidence and rollback remains possible.
4. Apply the monthly-drill validation, then calculate all events after the recovery point from authoritative logs/providers.
5. Reconcile in order: account deletion/blocks and safety actions; payment/refund/dispute/entitlement; publication/takedown; cook/XP/outbox; ordinary social writes.
6. Rotate credentials, update Vercel environment references, OAuth callbacks, webhook endpoints, monitoring, and DNS only after verification.
7. Keep the old project restricted and read-only until the incident commander approves destruction and retention needs are met.

## Deletion and legal holds

A restore must not resurrect deleted-account data into active service without applying the deletion ledger and cache/object purge. Legal holds are narrowly scoped, access-controlled, and released by the authorized owner. Backup expiry is documented to users accurately; do not promise immediate physical erasure from immutable backups if the provider cannot provide it.

## Drill record

Store date, recovery point, backup IDs, environment, operators, start/end, measured RPO/RTO, sampled counts/hashes, authorization tests, missing data, reconciliation results, screenshots with sensitive values redacted, pass/fail, approver, and follow-up owners/dates.
