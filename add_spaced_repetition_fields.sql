-- Spaced Repetition (SM-2 Algorithm) Migration
-- Adds fields required for the SM-2 spaced repetition algorithm to flashcards table

-- Add SM-2 algorithm fields to flashcards table
-- ease_factor: Multiplier for interval calculation (default 2.5, min 1.3)
-- interval_days: Current interval in days until next review
-- repetitions: Number of consecutive successful reviews
-- lapses: Number of times card was forgotten (quality < 3)

ALTER TABLE public.flashcards
  ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(4,2) DEFAULT 2.50;

ALTER TABLE public.flashcards
  ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0;

ALTER TABLE public.flashcards
  ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;

ALTER TABLE public.flashcards
  ADD COLUMN IF NOT EXISTS lapses INTEGER DEFAULT 0;

-- Ensure ease_factor has proper constraints
-- Note: We can't easily add CHECK constraints to existing columns, so we'll handle this in application code
-- Minimum ease_factor should be 1.3

-- Create partial index for efficient due card queries
-- This index only includes cards that are actually reviewable (learning or review status)
DROP INDEX IF EXISTS idx_flashcards_due;
CREATE INDEX idx_flashcards_due
  ON public.flashcards(next_review, status)
  WHERE status IN ('learning', 'review');

-- Create index for finding cards by set that are due for review
CREATE INDEX IF NOT EXISTS idx_flashcards_set_due
  ON public.flashcards(set_id, next_review)
  WHERE status IN ('learning', 'review', 'new');

-- Update function to set next_review when a card becomes 'learning' for the first time
-- This ensures new cards get an initial review time
CREATE OR REPLACE FUNCTION set_initial_next_review()
RETURNS TRIGGER AS $$
BEGIN
  -- If card is transitioning to 'learning' and doesn't have a next_review set
  IF NEW.status = 'learning' AND NEW.next_review IS NULL THEN
    NEW.next_review = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for initial next_review
DROP TRIGGER IF EXISTS set_initial_review_trigger ON public.flashcards;
CREATE TRIGGER set_initial_review_trigger
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  WHEN (OLD.status = 'new' AND NEW.status = 'learning')
  EXECUTE FUNCTION set_initial_next_review();

-- Comments for documentation
COMMENT ON COLUMN public.flashcards.ease_factor IS 'SM-2 ease factor (default 2.5, min 1.3). Higher = easier card, longer intervals';
COMMENT ON COLUMN public.flashcards.interval_days IS 'Current review interval in days. Grows with successful reviews';
COMMENT ON COLUMN public.flashcards.repetitions IS 'Number of consecutive successful reviews (quality >= 3). Resets on failure';
COMMENT ON COLUMN public.flashcards.lapses IS 'Total number of times card was forgotten (answered incorrectly)';
