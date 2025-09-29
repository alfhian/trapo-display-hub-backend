create extension if not exists pgcrypto;

create table if not exists screens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists screen_tokens (
  screen_id uuid references screens(id) on delete cascade,
  token text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (screen_id, token)
);

create table if not exists screen_payloads (
  screen_id uuid primary key references screens(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists assignment_events (
  id bigserial primary key,
  screen_id uuid not null references screens(id),
  payload jsonb not null,
  actor text,
  created_at timestamptz not null default now()
);
