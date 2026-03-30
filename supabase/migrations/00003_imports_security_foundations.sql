-- DealDesk Day 1+ security foundations (minimal hardening)
--
-- Goal: keep imports user-submitted input separate from system-controlled workflow
-- fields, without changing app behavior.
--
-- imports table split (logical):
--   user input: raw_text
--   system controlled: parsed_json, status
--
-- Note for future schema work:
-- Do NOT add system-controlled fields (plan/subscription/admin/usage/rate limits)
-- to user-editable tables in public schema.

-- 1) Bound user-supplied import payload size to reduce abuse/cost risk.
alter table public.imports
  add constraint imports_raw_text_len_chk
  check (char_length(raw_text) between 1 and 20000);

-- 2) Restrict authenticated users to writing only user-owned input fields.
-- Keep user_id ownership enforcement in existing RLS policy.
revoke insert on public.imports from authenticated;
grant insert (user_id, raw_text) on public.imports to authenticated;

revoke update on public.imports from authenticated;
grant update (raw_text) on public.imports to authenticated;

-- parsed_json and status remain writable by privileged server paths only.
