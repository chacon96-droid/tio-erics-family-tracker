alter type public.app_role add value if not exists 'pending';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    case when new.raw_user_meta_data->>'signup_role' = 'pending' then 'pending'::public.app_role else 'family'::public.app_role end,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  )
  on conflict (id) do update
    set display_name = excluded.display_name;
  return new;
end;
$$;

drop policy if exists "people: pending create own inactive" on public.people;
create policy "people: pending create own inactive"
  on public.people for insert
  with check (
    user_id = auth.uid()
    and active = false
  );

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
set search_path = public
as $$
declare
  new_person_id uuid;
begin
  insert into public.people (user_id, name, relationship, birthday, age_bracket, phone, email, active)
  values (target_user_id, person_name, person_relationship, person_birthday, person_age_bracket, person_phone, person_email, false)
  returning id into new_person_id;
  return new_person_id;
end;
$$;

grant execute on function public.create_pending_person(uuid, text, text, date, public.age_bracket, text, text) to anon, authenticated;
