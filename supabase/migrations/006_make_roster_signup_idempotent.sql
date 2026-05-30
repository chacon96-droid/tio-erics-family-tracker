create or replace function public.create_public_roster_request(
  person_name text,
  person_relationship text,
  person_birthday date,
  person_age_bracket public.age_bracket,
  person_phone text,
  person_email text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  new_person_id uuid;
  target_user_id uuid;
  normalized_email text := lower(trim(person_email));
begin
  target_user_id := public.ensure_roster_auth_user(person_name, normalized_email, false);

  select id into new_person_id
  from public.people
  where lower(trim(email)) = normalized_email
  order by created_at desc
  limit 1;

  if new_person_id is not null then
    update public.people
    set
      name = person_name,
      relationship = person_relationship,
      birthday = person_birthday,
      age_bracket = person_age_bracket,
      phone = person_phone,
      email = normalized_email,
      user_id = coalesce(public.people.user_id, target_user_id),
      active = case when public.people.active then true else false end
    where id = new_person_id;

    return new_person_id;
  end if;

  insert into public.people (user_id, name, relationship, birthday, age_bracket, phone, email, active)
  values (target_user_id, person_name, person_relationship, person_birthday, person_age_bracket, person_phone, normalized_email, false)
  returning id into new_person_id;

  return new_person_id;
end;
$$;

create or replace function public.create_pending_person(
  target_user_id uuid,
  person_name text,
  person_relationship text,
  person_birthday date,
  person_age_bracket public.age_bracket,
  person_phone text,
  person_email text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  new_person_id uuid;
  normalized_email text := lower(trim(person_email));
begin
  select id into new_person_id
  from public.people
  where user_id = target_user_id
     or lower(trim(email)) = normalized_email
  order by created_at desc
  limit 1;

  if new_person_id is not null then
    update public.people
    set
      user_id = coalesce(public.people.user_id, target_user_id),
      name = person_name,
      relationship = person_relationship,
      birthday = person_birthday,
      age_bracket = person_age_bracket,
      phone = person_phone,
      email = normalized_email,
      active = case when public.people.active then true else false end
    where id = new_person_id;

    return new_person_id;
  end if;

  insert into public.people (user_id, name, relationship, birthday, age_bracket, phone, email, active)
  values (target_user_id, person_name, person_relationship, person_birthday, person_age_bracket, person_phone, normalized_email, false)
  returning id into new_person_id;

  return new_person_id;
end;
$$;
