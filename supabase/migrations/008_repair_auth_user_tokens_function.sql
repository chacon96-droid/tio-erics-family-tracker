create or replace function public.repair_auth_user_tokens(target_email text default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update auth.users
  set
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    reauthentication_token = coalesce(reauthentication_token, '')
  where (target_email is null or lower(email) = lower(target_email))
    and (
      confirmation_token is null
      or recovery_token is null
      or email_change_token_new is null
      or email_change_token_current is null
      or reauthentication_token is null
    );
end;
$$;

revoke all on function public.repair_auth_user_tokens(text) from public;
grant execute on function public.repair_auth_user_tokens(text) to service_role;

select public.repair_auth_user_tokens(null);
