-- 0001_baseline_schema.sql
--
-- Idempotent baseline capturing the schema documented in
-- db/legacy/export_database_take2.sql (a pg_dump of the production
-- database taken 2025-10-15). On the real production database every one
-- of these tables already exists, so this migration is a guaranteed no-op
-- there. Its purpose is to let a fresh/dev database be bootstrapped to the
-- same known-good baseline via `npm run migrate`.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.screen_tokens (
  screen_id uuid NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  token text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (screen_id, token)
);

CREATE TABLE IF NOT EXISTS public.screen_payloads (
  screen_id uuid PRIMARY KEY REFERENCES public.screens(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_events (
  id bigserial PRIMARY KEY,
  screen_id uuid NOT NULL REFERENCES public.screens(id),
  payload jsonb NOT NULL,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_logs (
  id bigserial PRIMARY KEY,
  screen_id text,
  user_id uuid REFERENCES public.users(id),
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_assignments_audit (
  id bigserial PRIMARY KEY,
  admin_sub text,
  screen_id text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
