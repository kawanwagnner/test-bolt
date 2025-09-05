-- Corrige recursão infinita na policy anterior (remoção do subselect na mesma tabela)
-- Nova lógica: only schedule owner OR invite creator

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
  ) with check (true);
