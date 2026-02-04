-- Migration: Add slug column to notes table
-- This enables SEO-friendly URLs for notes

-- Add the slug column (nullable initially to allow migration of existing data)
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on user_id + slug combination
-- This ensures slugs are unique per user (different users can have same slug)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_user_slug
ON public.notes(user_id, slug)
WHERE slug IS NOT NULL;

-- Create an index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_notes_slug
ON public.notes(slug)
WHERE slug IS NOT NULL;

-- Function to generate slug from title
-- This is used as a fallback for existing notes without slugs
CREATE OR REPLACE FUNCTION generate_note_slug(title TEXT, note_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
BEGIN
    -- Convert title to lowercase, replace spaces with hyphens, remove special chars
    base_slug := LOWER(TRIM(title));
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);

    -- Append first 8 characters of the UUID for uniqueness
    IF base_slug = '' OR base_slug IS NULL THEN
        final_slug := SUBSTRING(note_id::TEXT, 1, 8);
    ELSE
        final_slug := base_slug || '-' || SUBSTRING(note_id::TEXT, 1, 8);
    END IF;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing notes to have slugs based on their titles
-- Only update notes that don't already have a slug
UPDATE public.notes
SET slug = generate_note_slug(title, id)
WHERE slug IS NULL AND title IS NOT NULL AND title != '';

-- For notes with empty titles, use just the UUID prefix
UPDATE public.notes
SET slug = SUBSTRING(id::TEXT, 1, 8)
WHERE slug IS NULL;

-- Verify the changes
SELECT id, title, slug, created_at
FROM public.notes
ORDER BY created_at DESC
LIMIT 10;
