-- 0003_create_service_types.sql
--
-- Master data for service catalog entries and their estimated turnaround
-- time (estimasi waktu pengerjaan), replacing the frontend's previous
-- localStorage-only "customServices" storage.

CREATE TABLE IF NOT EXISTS public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL UNIQUE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_types_active ON public.service_types (is_active);
