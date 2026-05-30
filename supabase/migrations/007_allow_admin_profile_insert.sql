create policy "profiles: admin insert"
  on public.profiles for insert
  with check (public.is_admin());
