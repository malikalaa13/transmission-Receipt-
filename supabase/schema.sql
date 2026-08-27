-- Supabase schema for Transmission Receipt Manager
create extension if not exists pgcrypto;

create type public.user_role as enum ('admin','employee');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role public.user_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table if not exists public.company_settings (
  id bigint primary key default 1 check (id = 1),
  company_name text not null default 'MR. TRANSMISSION',
  address text not null default '',
  phone text not null default '',
  fax text not null default '',
  email text not null default '',
  logo_url text not null default '',
  tax_rate numeric(8,3) not null default 0,
  default_guarantee text not null default '',
  default_notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  address_data jsonb,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  year text, make text, model text, color text,
  mileage_in text, mileage_out text, engine_size text, vin text, plate_number text,
  created_at timestamptz not null default now()
);
create index if not exists vehicles_customer_id_idx on public.vehicles(customer_id);
create index if not exists vehicles_vin_idx on public.vehicles(vin);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists parts_name_idx on public.parts using gin (to_tsvector('simple', name));

create sequence if not exists public.receipt_number_seq start 106;

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text not null unique default lpad(nextval('public.receipt_number_seq')::text, 5, '0'),
  customer_id uuid not null references public.customers(id),
  vehicle_id uuid references public.vehicles(id),
  arrive_date date,
  vehicle_details text,
  show_vehicle_details boolean not null default false,
  discount numeric(12,2) not null default 0,
  tax_rate numeric(8,3) not null default 0,
  guarantee text not null default '',
  notes text not null default '',
  signature text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists receipts_customer_id_idx on public.receipts(customer_id);
create index if not exists receipts_created_at_idx on public.receipts(created_at desc);

create table if not exists public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  description text not null default '',
  qty numeric(12,2) not null default 1,
  total numeric(12,2) not null default 0,
  sort_order integer not null default 0
);
create index if not exists receipt_items_receipt_id_idx on public.receipt_items(receipt_id);

create or replace function public.create_receipt_atomic(p_receipt jsonb, p_items jsonb)
returns jsonb language plpgsql security definer as $$
declare
  r public.receipts;
  item jsonb;
begin
  insert into public.receipts (
    id, receipt_no, customer_id, vehicle_id, arrive_date, vehicle_details, show_vehicle_details,
    discount, tax_rate, guarantee, notes, signature, created_by, created_at, updated_at
  ) values (
    coalesce((p_receipt->>'id')::uuid, gen_random_uuid()),
    case when p_receipt ? 'receipt_no' and coalesce(p_receipt->>'receipt_no','') <> '' then p_receipt->>'receipt_no' else lpad(nextval('public.receipt_number_seq')::text, 5, '0') end,
    (p_receipt->>'customer_id')::uuid,
    nullif(p_receipt->>'vehicle_id','')::uuid,
    nullif(p_receipt->>'arrive_date','')::date,
    coalesce(p_receipt->>'vehicle_details',''),
    coalesce((p_receipt->>'show_vehicle_details')::boolean,false),
    coalesce((p_receipt->>'discount')::numeric,0),
    coalesce((p_receipt->>'tax_rate')::numeric,0),
    coalesce(p_receipt->>'guarantee',''), coalesce(p_receipt->>'notes',''), coalesce(p_receipt->>'signature',''),
    auth.uid(), coalesce((p_receipt->>'created_at')::timestamptz,now()), now()
  ) on conflict (id) do update set
    customer_id=excluded.customer_id, vehicle_id=excluded.vehicle_id, arrive_date=excluded.arrive_date,
    vehicle_details=excluded.vehicle_details, show_vehicle_details=excluded.show_vehicle_details,
    discount=excluded.discount, tax_rate=excluded.tax_rate, guarantee=excluded.guarantee, notes=excluded.notes,
    signature=excluded.signature, updated_at=now()
  returning * into r;

  delete from public.receipt_items where receipt_id=r.id;
  for item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    insert into public.receipt_items(receipt_id,description,qty,total,sort_order)
    values(r.id, coalesce(item->>'description',''), coalesce((item->>'qty')::numeric,1), coalesce((item->>'total')::numeric,0), coalesce((item->>'sort_order')::int,0));
  end loop;
  return to_jsonb(r);
end; $$;


alter table public.profiles enable row level security;
alter table public.company_settings enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.parts enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;

create policy "authenticated profiles read" on public.profiles for select to authenticated using (true);
create policy "authenticated company settings read" on public.company_settings for select to authenticated using (true);
create policy "authenticated company settings write" on public.company_settings for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "authenticated customers" on public.customers for all to authenticated using (true) with check (true);
create policy "authenticated vehicles" on public.vehicles for all to authenticated using (true) with check (true);
create policy "authenticated parts" on public.parts for all to authenticated using (true) with check (true);
create policy "authenticated receipts" on public.receipts for all to authenticated using (true) with check (true);
create policy "authenticated receipt items" on public.receipt_items for all to authenticated using (true) with check (true);

insert into public.company_settings(id) values (1) on conflict (id) do nothing;
