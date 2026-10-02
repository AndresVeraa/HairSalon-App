create extension if not exists pgcrypto;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  phone varchar(20) unique not null,
  email varchar(255),
  qr_nfc_token varchar(100) unique not null,
  total_points int not null default 10 check (total_points >= 0),
  created_at timestamptz not null default current_timestamp
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name varchar(100) not null,
  role varchar(50) not null,
  commission_percentage numeric(5, 2) not null check (commission_percentage between 0 and 100),
  is_owner boolean not null default false,
  created_at timestamptz not null default current_timestamp
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  client_name varchar(150) not null,
  customer_id uuid references public.customers(id) on delete set null,
  staff_id uuid references public.staff(id) on delete restrict,
  service_type varchar(100) not null,
  price numeric(10, 2) not null check (price >= 0),
  payment_method varchar(50) not null check (payment_method in ('Efectivo', 'Nequi')),
  notes text,
  created_at timestamptz not null default current_timestamp
);

create table public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  points_earned int not null default 0 check (points_earned >= 0),
  points_redeemed int not null default 0 check (points_redeemed >= 0),
  description varchar(255),
  created_at timestamptz not null default current_timestamp
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  client_name varchar(150) not null,
  service_type varchar(100) not null,
  appointment_date timestamptz not null,
  source varchar(50) not null default 'Web',
  status varchar(50) not null default 'Pendiente',
  created_at timestamptz not null default current_timestamp
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  description varchar(255),
  points_cost int not null check (points_cost > 0),
  active boolean not null default true,
  created_at timestamptz not null default current_timestamp
);

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  reward_id uuid references public.rewards(id) on delete restrict not null,
  points_cost int not null check (points_cost > 0),
  status varchar(50) not null default 'Pendiente',
  created_at timestamptz not null default current_timestamp
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role varchar(20) not null default 'client' check (role in ('admin', 'client')),
  customer_id uuid references public.customers(id) on delete set null
);

insert into public.staff (name, role, commission_percentage, is_owner)
select 'Jhon barber', 'Barbería', 60, false
where not exists (select 1 from public.staff where name = 'Jhon barber');
insert into public.staff (name, role, commission_percentage, is_owner)
select 'Nelly peluquera', 'Peluquería', 50, false
where not exists (select 1 from public.staff where name = 'Nelly peluquera');
insert into public.staff (name, role, commission_percentage, is_owner)
select 'Luz peluquera', 'Peluquería', 100, true
where not exists (select 1 from public.staff where name = 'Luz peluquera');

create or replace function public.process_service_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  calculated_points int := 10;
begin
  if new.customer_id is not null then
    case lower(new.service_type)
      when 'corte', 'corte + barba', 'peinado', 'cepillado' then calculated_points := 15;
      when 'coloración', 'tinturación', 'rayitos', 'tratamiento' then calculated_points := 40;
      when 'keratina', 'alisado' then calculated_points := 85;
    end case;

    insert into public.points_transactions (customer_id, service_id, points_earned, description)
    values (new.customer_id, new.id, calculated_points, 'Puntos acumulados por ' || new.service_type);

    update public.customers
    set total_points = total_points + calculated_points
    where id = new.customer_id;
  end if;
  return new;
end;
$$;

create trigger trg_process_service_points
after insert on public.services
for each row execute function public.process_service_points();

create or replace function public.redeem_reward(p_reward_id uuid)
returns public.reward_redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_customer_id uuid;
  selected_reward public.rewards;
  redemption public.reward_redemptions;
begin
  select customer_id into current_customer_id from public.profiles where id = auth.uid();
  if current_customer_id is null then raise exception 'El usuario no tiene un cliente asociado'; end if;
  select * into selected_reward from public.rewards where id = p_reward_id and active;
  if not found then raise exception 'La recompensa no está disponible'; end if;
  update public.customers
  set total_points = total_points - selected_reward.points_cost
  where id = current_customer_id and total_points >= selected_reward.points_cost;
  if not found then raise exception 'Puntos insuficientes'; end if;
  insert into public.reward_redemptions (customer_id, reward_id, points_cost)
  values (current_customer_id, selected_reward.id, selected_reward.points_cost)
  returning * into redemption;
  insert into public.points_transactions (customer_id, points_redeemed, description)
  values (current_customer_id, selected_reward.points_cost, 'Canje: ' || selected_reward.name);
  return redemption;
end;
$$;
revoke all on function public.redeem_reward(uuid) from public, anon;
grant execute on function public.redeem_reward(uuid) to authenticated;

alter publication supabase_realtime add table public.customers;
alter publication supabase_realtime add table public.points_transactions;

alter table public.customers enable row level security;
alter table public.staff enable row level security;
alter table public.services enable row level security;
alter table public.points_transactions enable row level security;
alter table public.appointments enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.profiles enable row level security;

create policy "customers can read their own profile" on public.customers for select
using (id = (select customer_id from public.profiles where id = auth.uid()));
create policy "admins manage customers" on public.customers for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "customers read active rewards" on public.rewards for select using (active = true);
create policy "admins manage rewards" on public.rewards for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "users read their own profile" on public.profiles for select
using (id = auth.uid());
create policy "customers read own transactions" on public.points_transactions for select
using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
create policy "customers read and create own appointments" on public.appointments for select
using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
create policy "customers create own appointments" on public.appointments for insert
with check (customer_id = (select customer_id from public.profiles where id = auth.uid()));
create policy "admins manage staff" on public.staff for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admins manage services" on public.services for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admins manage appointments" on public.appointments for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "customers read own redemptions" on public.reward_redemptions for select
using (customer_id = (select customer_id from public.profiles where id = auth.uid()));
create policy "admins manage redemptions" on public.reward_redemptions for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
