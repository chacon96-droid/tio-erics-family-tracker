create or replace function public.ensure_roster_auth_user(person_name text, person_email text, is_active boolean default false)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  normalized_email text := lower(trim(person_email));
  existing_user_id uuid;
  assigned_user_id uuid;
begin
  if normalized_email is null or normalized_email = '' then
    return null;
  end if;

  select id into existing_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if existing_user_id is null then
    existing_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000'::uuid,
      existing_user_id,
      'authenticated',
      'authenticated',
      normalized_email,
      extensions.crypt((gen_random_uuid()::text || gen_random_uuid()::text)::text, extensions.gen_salt('bf'::text)),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object(
        'name', person_name,
        'signup_role', case when is_active then 'family' else 'pending' end,
        'email_verified', true,
        'phone_verified', false
      ),
      now(),
      now(),
      false,
      false
    );

    insert into auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      existing_user_id::text,
      existing_user_id,
      jsonb_build_object(
        'sub', existing_user_id::text,
        'email', normalized_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, role, display_name)
  values (
    existing_user_id,
    case when is_active then 'family' else 'pending' end::public.app_role,
    coalesce(nullif(person_name, ''), normalized_email)
  )
  on conflict (id) do update set
    role = case
      when public.profiles.role = 'admin'::public.app_role then public.profiles.role
      else excluded.role
    end,
    display_name = coalesce(excluded.display_name, public.profiles.display_name);

  select existing_user_id into assigned_user_id
  where not exists (
    select 1 from public.people where user_id = existing_user_id
  );

  return assigned_user_id;
end;
$$;
