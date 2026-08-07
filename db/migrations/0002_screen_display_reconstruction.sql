-- 0002_screen_display_reconstruction.sql
--
-- RECONSTRUCTED TABLE — NOT PRESENT IN db/legacy/export_database_take2.sql
-- (dumped 2025-10-15). Inferred solely from column usage in
-- services/screen-service.js (assignDisplayService, removeDisplayService,
-- getAllScreens, getScreenById) as of 2026-08-07.
--
-- This means the prod dump this repo has on file is stale/incomplete
-- relative to the live production schema, NOT that this table doesn't
-- exist in prod — the code actively reads/writes it today. Before
-- trusting this file as ground truth, diff it against a fresh
-- `pg_dump --schema-only -t screen_display` of the real prod DB and
-- correct any drift (nullability, extra columns, FK targets, etc. may not
-- exactly match).
--
-- IF NOT EXISTS makes this safe to run against prod (no-op there); the
-- reconstruction risk only materializes when bootstrapping a fresh dev DB
-- from these migrations.

CREATE TABLE IF NOT EXISTS public.screen_display (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  customer_name text,
  brand text,
  type text,
  year integer,
  license_plate text,
  service text,
  estimated_time timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_screen_display_screen_active
  ON public.screen_display (screen_id, is_active, created_at DESC, id DESC);
