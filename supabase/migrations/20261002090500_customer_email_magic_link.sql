alter table public.customers alter column phone drop not null;

create or replace function public.claim_customer_account(
  p_qr_nfc_token varchar,
  p_name varchar default null,
  p_email varchar default null
)
returns public.customers
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_email varchar;
  customer public.customers;
begin
  if auth.uid() is null then raise exception 'Se requiere una sesión verificada'; end if;
  select lower(email) into authenticated_email from auth.users where id = auth.uid();
  if authenticated_email is null then raise exception 'La sesión no tiene correo verificado'; end if;

  select * into customer from public.customers where qr_nfc_token = p_qr_nfc_token;
  if found and lower(coalesce(customer.email, '')) <> authenticated_email then
    raise exception 'El correo no coincide con la tarjeta';
  end if;

  if not found then
    if p_name is null or length(trim(p_name)) < 2 then
      raise exception 'El nombre es obligatorio para crear la cuenta';
    end if;
    insert into public.customers (name, email, qr_nfc_token, total_points)
    values (trim(p_name), authenticated_email, p_qr_nfc_token, 10)
    returning * into customer;
  else
    update public.customers
    set email = authenticated_email
    where id = customer.id
    returning * into customer;
  end if;

  insert into public.profiles (id, role, customer_id)
  values (auth.uid(), 'client', customer.id)
  on conflict (id) do update set customer_id = excluded.customer_id;
  return customer;
end;
$$;

revoke all on function public.claim_customer_account(varchar, varchar, varchar) from public, anon;
grant execute on function public.claim_customer_account(varchar, varchar, varchar) to authenticated;
