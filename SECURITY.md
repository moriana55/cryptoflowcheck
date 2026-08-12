# Security policy

## Supported version

Security fixes are applied to the latest commit on `main`.

## Reporting

Use GitHub private vulnerability reporting, or contact the repository owner privately through the email on their GitHub profile. Do not publish credentials, customer records, webhook payload secrets, or destructive proof-of-concept code in a public issue.

Include the affected route, reproduction steps, impact, and any suggested mitigation.

## Sensitive configuration

Stripe, OpenAI, admin, subscription-cookie, and cron secrets are server-only. Never expose them through `NEXT_PUBLIC_` variables or commit real values. Use independent secrets for admin sessions and subscription identity.
