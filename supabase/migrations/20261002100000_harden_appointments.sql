do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_status_check'
  ) then
    alter table public.appointments
      add constraint appointments_status_check
      check (status in ('Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Completada'));
  end if;
end;
$$;

create index if not exists appointments_date_status_idx
  on public.appointments (appointment_date, status);

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
         and existing.appointment_date = new.appointment_date
         and existing.status in ('Pendiente', 'Confirmada')
     ) then
    raise exception 'El horario seleccionado ya no está disponible';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_appointment_conflict on public.appointments;
create trigger trg_prevent_appointment_conflict
before insert or update of appointment_date, status on public.appointments
for each row execute function public.prevent_appointment_conflict();
