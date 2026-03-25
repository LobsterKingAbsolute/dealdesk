# DealDesk

Internal-style web app for deals, tasks, and follow-ups (Next.js + Supabase).

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project URL and publishable (anon) key.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

1. **Auth → URL configuration**  
   Add your site URL and redirect URL: `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).

2. **Database**  
   Apply the Day 1 schema from `supabase/migrations/00002_day1_schema.sql` (SQL Editor or Supabase CLI).  
   Legacy reference SQL lives in `supabase/legacy/` and is **not** part of the active migration chain.

## Deploy (Vercel)

Set environment variables in the Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use the same auth redirect URLs as in Supabase for your production domain.
