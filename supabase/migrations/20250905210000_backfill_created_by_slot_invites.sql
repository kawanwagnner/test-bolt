-- Backfill created_by em convites antigos e garantir preenchimento automático

-- Preenche created_by se estiver nulo usando o dono do schedule do slot
update slot_invites si
set created_by = sch.created_by
from slots s
join schedules sch on sch.id = s.schedule_id
where si.slot_id = s.id
  and si.created_by is null;

-- Função para garantir created_by em novos inserts caso a aplicação não envie
create or replace function public.set_slot_invite_created_by()
returns trigger as $$
declare
  v_created_by uuid;
begin
  if NEW.created_by is null then
    select sch.created_by into v_created_by
    from slots s
    join schedules sch on sch.id = s.schedule_id
    where s.id = NEW.slot_id;
    NEW.created_by = v_created_by;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger BEFORE INSERT
create trigger trg_set_slot_invite_created_by
before insert on slot_invites
for each row execute function public.set_slot_invite_created_by();
