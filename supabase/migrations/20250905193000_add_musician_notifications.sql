-- Add musician role flag and musician notification settings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_musician boolean DEFAULT false;

ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS notify_48h_musician boolean DEFAULT true;

-- Ensure defaults as requested
ALTER TABLE public.schedules
  ALTER COLUMN notify_48h SET DEFAULT true,
  ALTER COLUMN notify_24h SET DEFAULT true;

-- Backfill existing rows
UPDATE public.schedules SET notify_48h = true WHERE notify_48h IS NULL OR notify_48h = false;
UPDATE public.schedules SET notify_48h_musician = true WHERE notify_48h_musician IS NULL;
