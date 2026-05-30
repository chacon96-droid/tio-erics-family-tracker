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
set search_path = public
as $$
declare
  new_person_id uuid;
begin
  insert into public.people (user_id, name, relationship, birthday, age_bracket, phone, email, active)
  values (null, person_name, person_relationship, person_birthday, person_age_bracket, person_phone, person_email, false)
  returning id into new_person_id;
  return new_person_id;
end;
$$;

grant execute on function public.create_public_roster_request(text, text, date, public.age_bracket, text, text) to anon, authenticated;
