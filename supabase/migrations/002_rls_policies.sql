alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.interactions enable row level security;
alter table public.scoring_weights enable row level security;
alter table public.scores enable row level security;
alter table public.badges enable row level security;
alter table public.person_badges enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles: self read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: admin update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "people: admin all"
  on public.people for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "people: family read own"
  on public.people for select
  using (user_id = auth.uid());

create policy "interactions: admin all"
  on public.interactions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "interactions: family read own"
  on public.interactions for select
  using (public.owns_person(person_id));

create policy "interactions: family insert pending own"
  on public.interactions for insert
  with check (
    public.owns_person(person_id)
    and source = 'manual'
    and status = 'pending'
    and created_by = auth.uid()
  );

create policy "scoring_weights: everyone read active"
  on public.scoring_weights for select
  using (active = true or public.is_admin());

create policy "scoring_weights: admin all"
  on public.scoring_weights for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "scores: admin all"
  on public.scores for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "scores: family read own"
  on public.scores for select
  using (public.owns_person(person_id));

create policy "badges: everyone read"
  on public.badges for select
  using (true);

create policy "badges: admin all"
  on public.badges for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "person_badges: admin all"
  on public.person_badges for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "person_badges: family read own"
  on public.person_badges for select
  using (public.owns_person(person_id));

create policy "app_settings: admin all"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "app_settings: authenticated read"
  on public.app_settings for select
  using (auth.role() = 'authenticated');
