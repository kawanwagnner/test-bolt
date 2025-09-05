-- Atualiza policy para permitir que um usuário que já criou qualquer convite no slot
-- possa gerenciar (inclusive deletar) todos os convites daquele slot manual.

alter table slot_invites enable row level security;

drop policy if exists "slot_invites_manage_admin" on slot_invites;

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
    or exists (
      select 1 from slot_invites si2
      where si2.slot_id = slot_invites.slot_id
        and si2.created_by = auth.uid()
    )
  ) with check (true);
