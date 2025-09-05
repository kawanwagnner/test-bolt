export type SlotInvite = {
  id: string;
  slot_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  token: string;
  created_by: string | null;
  accepted_by: string | null;
  created_at: string;
  accepted_at: string | null;
};

export type CreateSlotInviteInput = { slot_id: string; email: string };
export type RespondSlotInviteInput = { invite_id: string; accept: boolean };
