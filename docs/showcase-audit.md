# Portfolio evidence audit

Audit date: 2026-08-13

## Verified locally

| Gate | Result | Evidence |
| --- | --- | --- |
| Automated tests | Pass | 35/35 across portfolio, CSV, Stripe signature, identity, tier, email, and link-safety logic |
| ESLint | Pass | Zero errors and zero warnings |
| Production build | Pass | Next.js 16.3 / React 19 production build |
| Dependency audit | Pass | `npm audit`: zero known vulnerabilities |
| Credential scan | Pass | No committed live-looking private credentials or private-key blocks |
| Public claims | Pass | Simulated scanner disclosed; unsupported sync/version claims removed |

## Security changes made during audit

- Removed a compiled-in fallback admin password.
- Added HTTP-only signed subscription identity and server-side Checkout verification.
- Added missing-secret, tamper, and expiry tests.
- Migrated to Next.js 16 proxy and ESLint conventions.
- Updated the previously vulnerable framework/runtime dependency chain.
- Replaced a polynomial email regex and rebuilt assistant comparison links from an explicit local allowlist.
- Enabled GitHub CodeQL default setup; the current default branch has zero open code-scanning alerts.

## Open production gates

- Replace JSON-file subscription persistence with a durable shared store before serverless or multi-instance deployment.
- Replace process-local rate limits with Redis/KV-backed counters.
- Exercise Stripe Checkout, webhook delivery, cancellation, replay/idempotency, and return verification using an owner test account.
- Add end-to-end browser, accessibility, responsive, and external-data failure tests.
- Decide whether local portfolio data should remain device-scoped or move behind real user authentication.

This repository is an auditable engineering case study. It is not a claim of live on-chain surveillance, guaranteed alpha, or production payment readiness.
