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
  authenticated_phone varchar;
  customer public.customers;
begin
  if auth.uid() is null then raise exception 'Se requiere una sesión verificada'; end if;
  select phone into authenticated_phone from auth.users where id = auth.uid();
  if authenticated_phone is null then raise exception 'La sesión no tiene teléfono verificado'; end if;

  select * into customer
  from public.customers
  where qr_nfc_token = p_qr_nfc_token;

  if found and customer.phone <> authenticated_phone then
    raise exception 'El teléfono no coincide con la tarjeta';
  end if;

  if not found then
    if p_name is null or length(trim(p_name)) < 2 then
      raise exception 'El nombre es obligatorio para crear la cuenta';
    end if;
    insert into public.customers (name, phone, email, qr_nfc_token, total_points)
    values (trim(p_name), authenticated_phone, nullif(trim(p_email), ''), p_qr_nfc_token, 10)
    returning * into customer;
  else
    update public.customers
    set email = coalesce(nullif(trim(p_email), ''), email)
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
