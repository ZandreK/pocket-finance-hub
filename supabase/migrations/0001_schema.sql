-- Pocket Finance Hub — schema da versão cloud (Supabase / PostgreSQL)
-- Cada usuário só enxerga os próprios dados (RLS). Referência da arquitetura
-- full-stack; a versão demo do app roda com localStorage e não usa este banco.

create extension if not exists "pgcrypto";

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('wallet','bank','savings','investment')),
  initial_balance numeric(14,2) not null default 0,
  color text not null default '#22c55e',
  yield_type text not null default 'none'
    check (yield_type in ('none','cdi','selic','fixed_year','fixed_month')),
  yield_percent numeric(8,2) not null default 0,
  business_days boolean not null default true,
  yield_start_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  color text not null default '#64748b'
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  "limit" numeric(14,2) not null default 0,
  closing_day int not null check (closing_day between 1 and 31),
  due_day int not null check (due_day between 1 and 31),
  debit_account_id uuid references accounts (id) on delete set null,
  color text not null default '#8b5cf6'
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid references accounts (id) on delete cascade,
  card_id uuid references cards (id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric(14,2) not null check (amount > 0),
  category_id uuid references categories (id) on delete set null,
  description text not null default '',
  date date not null default current_date,
  paid boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_tx_user_date on transactions (user_id, date desc);
create index if not exists idx_tx_card_paid on transactions (card_id, paid);

-- Row Level Security: isolamento por usuário autenticado
alter table accounts enable row level security;
alter table categories enable row level security;
alter table cards enable row level security;
alter table transactions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['accounts','categories','cards','transactions'] loop
    execute format(
      'create policy %1$I_select on %1$I for select using (user_id = auth.uid());', t);
    execute format(
      'create policy %1$I_insert on %1$I for insert with check (user_id = auth.uid());', t);
    execute format(
      'create policy %1$I_update on %1$I for update using (user_id = auth.uid());', t);
    execute format(
      'create policy %1$I_delete on %1$I for delete using (user_id = auth.uid());', t);
  end loop;
end $$;
