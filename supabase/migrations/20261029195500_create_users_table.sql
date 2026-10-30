create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text unique,
  preferred_language text not null default 'en',
  signed_up_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can read their own account" on public.users;
create policy "Users can read their own account"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, full_name, email, preferred_language, signed_up_at)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), ''),
    new.email,
    case
      when new.raw_user_meta_data ->> 'preferred_language' = 'ta' then 'ta'
      else 'en'
    end,
    coalesce(new.created_at, now())
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

insert into public.users (id, full_name, email, preferred_language, signed_up_at)
select
  id,
  coalesce(nullif(btrim(raw_user_meta_data ->> 'full_name'), ''), ''),
  email,
  case
    when raw_user_meta_data ->> 'preferred_language' = 'ta' then 'ta'
    else 'en'
  end,
  coalesce(created_at, now())
from auth.users
on conflict (id) do nothing;
