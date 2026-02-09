-- Add saved_items table and public note/page access
-- Run in Supabase SQL editor or psql

BEGIN;

CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('note', 'flashcard', 'exam')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_item_type ON public.saved_items(item_type);
CREATE INDEX IF NOT EXISTS idx_saved_items_item_id ON public.saved_items(item_id);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved items" ON public.saved_items;
CREATE POLICY "Users can view own saved items" ON public.saved_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved items" ON public.saved_items;
CREATE POLICY "Users can insert own saved items" ON public.saved_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved items" ON public.saved_items;
CREATE POLICY "Users can delete own saved items" ON public.saved_items
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view public notes" ON public.notes;
CREATE POLICY "Public can view public notes" ON public.notes
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Public can view pages of public notes" ON public.note_pages;
CREATE POLICY "Public can view pages of public notes" ON public.note_pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_pages.note_id
            AND notes.is_public = true
        )
    );

COMMIT;
