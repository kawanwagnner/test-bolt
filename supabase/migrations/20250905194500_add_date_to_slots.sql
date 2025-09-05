-- Add date column to slots to allow multi-day schedules
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS date date;

-- Backfill existing rows using start_time when possible
UPDATE public.slots SET date = (start_time AT TIME ZONE 'utc')::date WHERE date IS NULL AND start_time IS NOT NULL;

-- (Optional) If you want to enforce not null after backfill uncomment:
-- ALTER TABLE public.slots ALTER COLUMN date SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_slots_date ON public.slots(date);
