# Security Model (Foundation)

This project uses Supabase with Row Level Security (RLS) and user-scoped data.

## User-editable tables (current)

- `public.profiles`
- `public.brands`
- `public.deals`
- `public.tasks`
- `public.imports` (user input field: `raw_text`)

## System-controlled fields and data

System-controlled fields must NOT be added to user-editable tables above.

Examples that must be system-only:

- subscription status / plan / premium flags
- admin roles or authorization flags
- usage counters and quota state
- rate-limit counters and lockouts
- billing/provider sync state
- AI usage and spend control state

These belong in dedicated system tables with server-only write paths.

## Current imports rule

`public.imports` is split by responsibility:

- user input: `raw_text`
- system-controlled workflow: `parsed_json`, `status`

Authenticated users should not be able to write system-controlled workflow fields.

## Server-side enforcement requirements

Future billing, entitlement, usage-limit, and AI-cost logic must be enforced server-side.
Do not trust client-provided values for plan, role, quota, price, or authorization decisions.

## RLS requirements

RLS must remain enabled for user data tables, and policies must keep access owner-scoped.
Any new user data table must enable RLS and add explicit policies in the same migration.

## Secrets and keys

Never expose privileged secrets to the client bundle.

- `NEXT_PUBLIC_*` values are public by design.
- Service-role keys, provider secret keys, webhook secrets, and DB credentials are server-only.
- Never put service-role keys in client code.
