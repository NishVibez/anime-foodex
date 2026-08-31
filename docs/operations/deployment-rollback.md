# Deployment and rollback runbook

## Release topology

- Local Supabase and local Next.js are for routine development.
- Every pull request receives an isolated Vercel Preview deployment and uses non-production credentials/data.
- A temporary hosted Supabase project is staging; it must contain synthetic or approved test data only.
- Production uses a clean Supabase Pro project and separate Vercel Production environment variables.
- Only a reviewed, immutable commit from protected `main` is promoted. Preview URLs are never treated as GA.

## Promotion prerequisites

1. CI lint, typecheck, unit tests, and production build pass on the exact commit.
2. Database migration lint/tests and the RLS/grant matrix pass from a clean reset and from the current production-like schema.
3. Migration is reviewed for locks, table rewrites, privilege changes, data backfill, rollback/forward-repair path, and required feature sequencing.
4. Preview verifies public preview, authorized detail, age gate, social isolation, offline logout purge, moderation fail-closed, billing test mode, and admin audit.
5. Release checklist and content gate have evidence, not just checked boxes.
6. Backup/restore status meets the release requirement; on-call owners and rollback decision maker are available.

## Database change pattern

Prefer expand/migrate/contract:

1. **Expand:** add nullable columns, new tables/functions, compatible indexes, and dual-read/write support. Use concurrent/online-safe operations where the platform supports them.
2. **Migrate:** backfill in bounded, restartable batches with progress, error, and load monitoring.
3. **Switch:** deploy readers to the new shape after data and privileges are verified.
4. **Contract:** remove old fields/functions in a later release after rollback window and telemetry show no use.

Migrations are forward-only artifacts. Do not rely on a Vercel code rollback to reverse a destructive database migration. For an unsafe deployed migration, stop writes if necessary and apply a reviewed forward repair or restore into a new recovery project.

## Deployment procedure

1. Record release ID, commit, migration list, Vercel deployment, Supabase project/ref, feature state, content snapshot digest, and operators.
2. Apply compatible database expansion first. Read back schema, grants, RLS status, function ownership/search paths, buckets/policies, and migration ledger.
3. Promote the prebuilt, verified Vercel artifact for the same commit; do not rebuild from a mutable branch.
4. Run smoke checks from an anonymous session and separate member/Supporter/staff test accounts.
5. Watch error, latency, database, auth, moderation, webhook, entitlement, and content-access signals through the observation window.
6. Mark complete only after the release owner records evidence and the previous deployment remains recoverable.

## Rollback triggers

Rollback or disable the affected capability immediately for a Critical/High security finding, protected-detail leak, cross-user access, public quarantine, signed-webhook failure, duplicate entitlement/XP, failed age/consent enforcement, severe error/latency regression, or an irreversible content publication error.

## Application rollback

1. Freeze further promotions and note the UTC decision time.
2. If the database remains backward-compatible, promote the last known-good Vercel deployment.
3. Purge/revalidate only affected caches; verify no protected detail remains in CDN, metadata, or service worker caches.
4. Run the minimum end-to-end checks for the incident surface plus login, preview/detail separation, and write authorization.
5. Keep the incident open until background jobs, webhooks, offline outboxes, and provider state are reconciled.

If the prior application is incompatible with the current schema, do not promote it. Disable the feature and deploy a reviewed compatibility fix.

## Database recovery

Never run an unreviewed destructive statement during an incident. Preserve the original project and audit trail. Restore/PITR to a separate recovery project or branch where possible, verify schema/data/security invariants, reconcile post-restore payment/moderation events, then cut over under the backup-restore runbook. Credentials copied into a recovery environment must be rotated or disabled before it is decommissioned.

## Roll-forward

When the last-known-good deployment cannot safely serve, create a minimal patch against the bad release, verify it in Preview with production-like configuration, and promote it through the same approval path. Avoid bundling unrelated changes.

## Evidence record

For each deploy/rollback retain the initiating human, approvals, commit/deployment IDs, migration versions, configuration digest (never values), test results, observation metrics, incidents, start/end UTC, and final disposition.
