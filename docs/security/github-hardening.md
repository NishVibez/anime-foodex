# GitHub repository hardening

Apply these settings to the private `NishVibez/anime-foodex` repository after it exists. Record screenshots or API readback with sensitive values redacted.

## Access and ownership

- Require MFA for owners and collaborators; keep at least two recoverable owner accounts before GA.
- Grant write/admin access individually and for the shortest need. Quarterly, remove dormant users, stale deploy keys, OAuth apps, GitHub Apps, and Actions secrets.
- Use GitHub Security Advisories for private vulnerability reports. Test the link in `SECURITY.md` before publishing a security contact.
- Do not use personal access tokens for Vercel/Supabase if a scoped GitHub App/OIDC integration is available.

## Ruleset for `main`

Require pull requests, one independent approval (two for security policy, migrations, payments, auth, rights/publication, or workflows), dismissal of stale approvals, resolved conversations, linear history, signed commits if operationally supported, and successful `CI / quality`.

Block force pushes and deletion. Restrict bypass to a documented break-glass owner; every bypass creates an incident/change record. Require CodeQL and dependency review only after they run reliably for the private repository's plan—do not create an impossible required check that encourages bypass.

## Actions

- Default workflow permissions to read-only; grant job-level write scopes only where required.
- Disallow unapproved Actions and reusable workflows. Review action maintainers and pin third-party actions to immutable commit SHAs in the production baseline.
- Prevent forked pull requests from receiving secrets. Production deployment environments require reviewer approval and branch restrictions.
- Separate Preview and Production secrets/environments. Never expose Supabase secret/service role, Stripe/Razorpay/OpenAI secrets, webhook secrets, or provider credentials to pull-request code.
- Review changes under `.github/workflows/**` as privileged code.

## Security features

- Enable dependency graph, Dependabot alerts, Dependabot security updates, CodeQL/default setup or the checked-in workflow, and secret scanning plus push protection if available for the account plan.
- If private-repository secret scanning or dependency review is unavailable, select and approve an alternative before GA. It must scan the full Git history and incoming changes without uploading source/secrets to an unapproved service.
- Treat any real secret match as compromised: revoke at the issuer, inspect use, replace every environment, and verify the old value fails. Closing an alert or deleting a line is not remediation.
- Review GitHub's bypass/audit events and unresolved high/critical alerts as a release gate.

## Dependabot policy

Dependabot opens weekly npm and GitHub Actions updates. Lockfile-only or patch updates still require CI. Security updates receive severity-based triage; do not merge a major runtime/database/payment/auth upgrade without provider documentation, Preview verification, and rollback analysis.

## Evidence checklist

- [ ] Repository visibility is private and archived forks are reviewed.
- [ ] Ruleset readback shows required review/checks and no broad bypass.
- [ ] Actions default permissions are read-only; Production environment has reviewers.
- [ ] Secret scanning/push protection or approved substitute catches a synthetic canary and leaves no real credential in history.
- [ ] CodeQL and dependency review complete on the release commit.
- [ ] Advisory flow reaches the monitored owner privately.
- [ ] Vercel deployment maps to the exact protected commit.
