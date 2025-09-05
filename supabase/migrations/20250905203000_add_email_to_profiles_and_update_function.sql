-- Add email column to profiles if not exists
alter table public.profiles add column if not exists email text;

-- Backfill existing profiles with current auth.users emails
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is distinct from u.email);

-- Replace handle_new_user to also store email (keeps role logic)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    case when new.email like '%@admin.test' then 'admin' else 'member' end,
    new.email
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Ensure trigger exists
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end$$;

-- Optional index for faster lookup by email (case-insensitive)
create index if not exists idx_profiles_email_lower on public.profiles (lower(email));