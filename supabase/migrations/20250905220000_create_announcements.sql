-- Create announcements table and RLS policies

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  created_by uuid references profiles(id) default null,
  created_at timestamptz default now()
);

-- Enable row level security
alter table announcements enable row level security;

-- Allow anyone to select announcements
drop policy if exists "announcements_select_public" on announcements;
create policy "announcements_select_public" on announcements
  for select using (true);

-- Allow admins to insert announcements
-- This assumes profiles.role exists and is 'admin' for admins
drop policy if exists "announcements_insert_admin" on announcements;
create policy "announcements_insert_admin" on announcements
  for insert with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Allow admins to update/delete their own announcements (optional)
drop policy if exists "announcements_manage_admin" on announcements;
create policy "announcements_manage_admin" on announcements
  for all using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Index to speed ordering by created_at
create index if not exists announcements_created_at_idx on announcements(created_at desc);
