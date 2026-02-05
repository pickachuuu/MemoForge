-- Migration: Add position column to flashcards for proper ordering
-- This enables consistent card traversal and reordering

-- Add position column (nullable first to avoid issues with existing data)
ALTER TABLE public.flashcards
ADD COLUMN IF NOT EXISTS position INTEGER;

-- Update existing flashcards with position based on created_at order within each set
WITH ranked_cards AS (
  SELECT
    id,
    set_id,
    ROW_NUMBER() OVER (PARTITION BY set_id ORDER BY created_at ASC) - 1 as new_position
  FROM public.flashcards
)
UPDATE public.flashcards f
SET position = rc.new_position
FROM ranked_cards rc
WHERE f.id = rc.id;

-- Now make position NOT NULL with a default
ALTER TABLE public.flashcards
ALTER COLUMN position SET NOT NULL,
ALTER COLUMN position SET DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_flashcards_set_position
ON public.flashcards(set_id, position);

-- Function to auto-assign position on new flashcard insert
CREATE OR REPLACE FUNCTION set_flashcard_position()
RETURNS TRIGGER AS $$
BEGIN
  -- If position is not provided or is 0, set it to the next available position
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(position) + 1, 0) INTO NEW.position
    FROM public.flashcards
    WHERE set_id = NEW.set_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS before_flashcard_insert ON public.flashcards;

-- Create trigger to auto-set position on insert
CREATE TRIGGER before_flashcard_insert
  BEFORE INSERT ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION set_flashcard_position();

-- Function to reorder positions after delete (optional, keeps positions compact)
CREATE OR REPLACE FUNCTION reorder_flashcard_positions_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement position of all cards after the deleted one in the same set
  UPDATE public.flashcards
  SET position = position - 1
  WHERE set_id = OLD.set_id
    AND position > OLD.position;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS after_flashcard_delete ON public.flashcards;

-- Create trigger to reorder after delete
CREATE TRIGGER after_flashcard_delete
  AFTER DELETE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION reorder_flashcard_positions_after_delete();
