# Observability and alerting

## Principles

- Observe user-visible outcomes and security invariants, not just process uptime.
- Logs identify an event with request/trace ID, environment, route/action, actor class, target type/opaque ID, outcome, duration, and policy/rule version.
- Never log tokens, cookies, signatures, secret values, raw webhook bodies, dates of birth, provider email, billing identity, private notes, upload bytes, or full moderation text/image payloads.
- Production, Preview, and local signals are separated. Synthetic probes use dedicated accounts and data.

## Required dashboards

| Dashboard       | Minimum signals                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| Web health      | availability, server errors, route latency, Core Web Vitals p75, cache status, deployment/commit                     |
| Supabase        | connections, query latency, locks, storage/database growth, auth errors, RLS/permission errors, realtime load        |
| Content access  | preview/detail authorization denials, public cache anomalies, offline lease validation/purge                         |
| Moderation      | queue age/depth, pass/hold/reject/error-closed, first-three queue, false-pass/reversal sample                        |
| Community abuse | rate-limit hits, reports, blocks, repeat hashes/accounts/devices, removal propagation delay                          |
| Billing         | verified/invalid/duplicate webhooks, queue age, entitlement-provider mismatches, refund/dispute/cancellation latency |
| Game            | XP attempts/awards/duplicates/cooldown rejects, ledger reconciliation, unusual velocity                              |
| Editorial       | candidates by state, incomplete gates, publish/unpublish/takedown, audit-log write failures                          |
| Backups         | latest recovery point, object backup status, last restore drill, measured RPO/RTO                                    |

## Alerts

Page immediately on service-secret evidence, public quarantine access, cross-user authorization canary, protected detail in a public response/cache, unsigned webhook acceptance, duplicate entitlement/XP, append-only ledger mutation, audit-write failure during privileged action, or moderation fail-open.

Create urgent owner alerts for moderation provider outage/queue age, webhook reconciliation mismatch, backup age beyond RPO, error/latency burn, database saturation, content gate regression, ad rendering on prohibited surfaces, or personalized ads without the approved signal.

Each alert has an owner, severity, actionable message, runbook link, deduplication key, test procedure, and quiet-hours/escalation behavior. An alert is not production-ready until a synthetic event reaches the monitored channel and acknowledgement is recorded.

## Uptime probes

Probe the home page, search, one public preview, a synthetic authenticated standard detail, and a no-side-effect health endpoint from at least two regions. Do not probe Supporter detail with a shared credential in client-side monitoring. Payment, moderation, XP, and publication use scheduled synthetic/test-mode reconciliation rather than live mutations.

## Retention and access

Set log retention by data class and incident need, with the minimum viable payload. Access is least-privileged and audited. Export/drains use encrypted transport and a reviewed destination. Before GA, verify provider redaction, sampling, retention, and region settings against privacy promises.

## Release annotation

Every production deployment, migration, provider configuration change, XP/age/consent rule version, and catalog publication snapshot is annotated. During rollback, dashboards must show both the app deployment and database/content state so a code rollback cannot mask an incompatible migration.
