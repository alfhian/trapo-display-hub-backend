-- 0004_seed_default_service_types.sql
--
-- Seeds the service catalog defaults that used to live in
-- trapo_display_hub_frontend/src/config/services.ts (DEFAULT_SERVICES),
-- so a fresh deploy of service_types isn't empty on day one.
--
-- Note: the last row intentionally has label != value
-- ('Pemasangan Kaca Film' / 'Instal Kaca Film') — preserved exactly as-is
-- since existing screen_display.service rows in prod may already contain
-- the string 'Instal Kaca Film'.

INSERT INTO public.service_types (label, value, duration_minutes) VALUES
  ('Instalasi Carmat', 'Instalasi Carmat', 30),
  ('Instalasi Dashcam', 'Instalasi Dashcam', 60),
  ('Coating Quick Shield', 'Coating Quick Shield', 1440),
  ('Coating Pro', 'Coating Pro', 4320),
  ('Coating Diamond', 'Coating Diamond', 4320),
  ('PPF', 'PPF', 10080),
  ('Interior Cleaning/Detailing', 'Interior Cleaning/Detailing', 180),
  ('Pemasangan Kaca Film', 'Instal Kaca Film', 120)
ON CONFLICT (value) DO NOTHING;
