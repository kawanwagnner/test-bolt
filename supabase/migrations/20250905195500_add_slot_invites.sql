-- slot_invites: permite convites manuais para slots em modo manual
-- Habilita extensão para tipo case-insensitive
create extension if not exists citext;
create type invite_status as enum ('pending','accepted','declined');

create table if not exists slot_invites (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots(id) on delete cascade,
  email citext not null,
  status invite_status not null default 'pending',
  token uuid not null default gen_random_uuid(),
  created_by uuid references auth.users(id),
  accepted_by uuid references auth.users(id),
  created_at timestamptz default now(),
  accepted_at timestamptz
);

-- Caso não queira usar citext, substitua acima por:
-- email text not null,
-- e crie índice: create unique index ... on slot_invites(slot_id, lower(email)) where status in ('pending','accepted');

-- índice único parcial (não pode estar inline na definição da tabela)
create unique index if not exists slot_invites_unique_active
  on slot_invites(slot_id, email)
  where status in ('pending','accepted');

alter table slot_invites enable row level security;

-- Policies básicas (ajuste conforme regras de negócio)
-- Criador do slot (ou quem criou o convite) pode gerenciar
create policy "slot_invites_manage_admin" on slot_invites
  for all using (
    (
      exists (
        select 1
        from slots s
        join schedules sch on sch.id = s.schedule_id
        where s.id = slot_invites.slot_id
          and s.mode = 'manual'
          and sch.created_by = auth.uid()
      )
    )
    or created_by = auth.uid()
  ) with check (
    true
  );

-- Usuário convidado pode ver seu convite
create policy "slot_invites_view_invited" on slot_invites
  for select using ( email = auth.jwt() ->> 'email' );

-- Usuário convidado pode responder (update status)
create policy "slot_invites_update_invited" on slot_invites
  for update using ( email = auth.jwt() ->> 'email' );

-- Trigger para criar assignment ao aceitar
create or replace function public.create_assignment_on_invite_accept()
returns trigger as $$
declare
  v_slot slots%rowtype;
  v_capacity_ok boolean;
begin
  if TG_OP = 'UPDATE' and NEW.status = 'accepted' and OLD.status <> 'accepted' then
    select * into v_slot from slots where id = NEW.slot_id;
    -- verificar capacidade
    select (count(*) < v_slot.capacity) into v_capacity_ok from assignments where slot_id = NEW.slot_id;
    if v_capacity_ok then
      insert into assignments (slot_id, user_id, assigned_by)
      values (NEW.slot_id, NEW.accepted_by, NEW.created_by)
      on conflict do nothing;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_create_assignment_on_invite_accept
after update on slot_invites
for each row execute function public.create_assignment_on_invite_accept();
