# Database verification

Run these tests against an ephemeral local database after Docker Desktop is
available:

```sh
pnpm dlx supabase@latest start
pnpm dlx supabase@latest db reset
pnpm dlx supabase@latest test db
pnpm dlx supabase@latest db lint --local --level warning --fail-on error
```

The suite verifies schema boundaries, RLS, preview/detail separation, private
entitlements, block propagation, and that XP can only enter the append-only
ledger through the server-authoritative award path.
