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
-- Guarded with `to_regclass` so the whole block is skipped when the table
-- already exists, instead of relying on CREATE TABLE/INDEX IF NOT EXISTS.
-- CREATE INDEX IF NOT EXISTS still requires ownership of the target table
-- to even evaluate whether the index already exists, so on production
-- (table owned by a different role than the app's migration user) it
-- fails with "must be owner of table screen_display" (42501) even though
-- nothing would have actually changed. The to_regclass guard avoids
-- touching the pre-existing table at all, sidestepping that ownership
-- check entirely — this makes the migration a true no-op on prod.

DO $$
BEGIN
  IF to_regclass('public.screen_display') IS NULL THEN
    CREATE TABLE public.screen_display (
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

    CREATE INDEX idx_screen_display_screen_active
      ON public.screen_display (screen_id, is_active, created_at DESC, id DESC);
  END IF;
END $$;
