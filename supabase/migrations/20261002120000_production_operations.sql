alter table public.appointments
  add column if not exists staff_id uuid references public.staff(id) on delete restrict,
  add column if not exists duration_minutes integer not null default 60;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_duration_check'
  ) then
    alter table public.appointments
      add constraint appointments_duration_check
      check (duration_minutes between 15 and 480);
  end if;
end;
$$;

create index if not exists appointments_staff_date_idx
  on public.appointments (staff_id, appointment_date, status);

create or replace function public.prevent_appointment_conflict()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.appointment_date <= now() then
    raise exception 'La cita debe programarse en el futuro';
  end if;

  if extract(isodow from new.appointment_date at time zone 'America/Bogota') = 7
     or (new.appointment_date at time zone 'America/Bogota')::time not between time '08:00' and time '20:00' then
    raise exception 'El horario de atención es de lunes a sábado entre 08:00 y 20:00';
  end if;

  if new.status in ('Pendiente', 'Confirmada')
     and exists (
       select 1
       from public.appointments existing
       where existing.id <> new.id
         and existing.status in ('Pendiente', 'Confirmada')
         and (new.staff_id is null or existing.staff_id is null or existing.staff_id = new.staff_id)
         and tstzrange(existing.appointment_date,
           existing.appointment_date + make_interval(mins => existing.duration_minutes), '[)')
           && tstzrange(new.appointment_date,
           new.appointment_date + make_interval(mins => new.duration_minutes), '[)')
     ) then
    raise exception 'El horario seleccionado se cruza con otra cita activa';
  end if;
  return new;
end;
$$;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  action varchar(80) not null,
  entity_type varchar(80) not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default current_timestamp
);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admins read audit log" on public.admin_audit_log;
create policy "admins read audit log" on public.admin_audit_log
for select using (exists (
  select 1 from public.profiles where id = auth.uid() and role = 'admin'
));

create or replace function public.write_admin_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.admin_audit_log(actor_id, action, entity_type, entity_id, old_data, new_data)
    values (
      auth.uid(),
      tg_op,
      tg_table_name,
      coalesce(new.id, old.id),
      case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_services on public.services;
create trigger trg_audit_services
after insert or update or delete on public.services
for each row execute function public.write_admin_audit_log();

drop trigger if exists trg_audit_appointments on public.appointments;
create trigger trg_audit_appointments
after insert or update or delete on public.appointments
for each row execute function public.write_admin_audit_log();

create or replace function public.adjust_customer_points(
  p_customer_id uuid,
  p_points_delta integer,
  p_reason varchar
)
returns public.points_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  adjustment public.points_transactions;
  next_total integer;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un administrador puede ajustar puntos';
  end if;
  if p_points_delta = 0 or nullif(trim(p_reason), '') is null then
    raise exception 'El ajuste debe tener puntos distintos de cero y una razón';
  end if;

  update public.customers
  set total_points = total_points + p_points_delta
  where id = p_customer_id
    and total_points + p_points_delta >= 0
  returning total_points into next_total;
  if not found then
    raise exception 'Cliente inexistente o saldo insuficiente';
  end if;

  insert into public.points_transactions(
    customer_id, points_earned, points_redeemed, description
  )
  values (
    p_customer_id,
    greatest(p_points_delta, 0),
    greatest(-p_points_delta, 0),
    'Ajuste administrativo: ' || trim(p_reason)
  )
  returning * into adjustment;

  return adjustment;
end;
$$;

revoke all on function public.adjust_customer_points(uuid, integer, varchar) from public, anon;
grant execute on function public.adjust_customer_points(uuid, integer, varchar) to authenticated;
