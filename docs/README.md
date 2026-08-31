# Anime FooDex operating handbook

These documents define pre-GA policy and the repeatable evidence required to operate Anime FooDex. Checkboxes and target values are never evidence that a control passed.

## Security and privacy

- [`security/threat-model.md`](security/threat-model.md) — trust boundaries, attacker stories, and severity calibration.
- [`security/github-hardening.md`](security/github-hardening.md) — repository protection, CI, dependency, and secret-scanning settings.
- [`../SECURITY.md`](../SECURITY.md) — vulnerability reporting and repository-wide scanner policy.

## Governance

- [`governance/data-rights-editorial-policy.md`](governance/data-rights-editorial-policy.md) — data classes, research-source restrictions, evidence, rights, culinary review, corrections, and deletion.

## Operations

- [`operations/moderation-upload-runbook.md`](operations/moderation-upload-runbook.md)
- [`operations/incident-response.md`](operations/incident-response.md)
- [`operations/deployment-rollback.md`](operations/deployment-rollback.md)
- [`operations/backup-restore.md`](operations/backup-restore.md)
- [`operations/domain-cutover.md`](operations/domain-cutover.md)
- [`operations/observability-and-alerting.md`](operations/observability-and-alerting.md)

## Release

- [`release/ga-content-gate.md`](release/ga-content-gate.md)
- [`release/external-launch-dependencies.md`](release/external-launch-dependencies.md)
- [`release/release-checklist.md`](release/release-checklist.md)

## Document control

Every policy or runbook change requires a pull request, an owner, and a reason. Review this handbook before each GA rehearsal and at least quarterly after launch. Time-sensitive legal, processor, tax, consent, and age-policy assertions must be revalidated with qualified professionals; repository text does not replace that review.
