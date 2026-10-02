insert into public.staff (name, role, commission_percentage, is_owner)
select 'Jhon barber', 'Barbería', 60, false
where not exists (select 1 from public.staff where name = 'Jhon barber');

insert into public.staff (name, role, commission_percentage, is_owner)
select 'Nelly peluquera', 'Peluquería', 50, false
where not exists (select 1 from public.staff where name = 'Nelly peluquera');

insert into public.staff (name, role, commission_percentage, is_owner)
select 'Luz peluquera', 'Peluquería', 100, true
where not exists (select 1 from public.staff where name = 'Luz peluquera');
