-- Activity Tracking Migration
-- Enhances study_sessions table to support multiple activity types (flashcard study, note editing, exam attempts)

-- Add activity_type enum for flexible tracking
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM (
      'flashcard_study',
      'note_edit',
      'exam_attempt',
      'flashcard_created',
      'note_created'
    );
  END IF;
END $$;

-- Update study_sessions to support different activity types
-- The session_type column already exists as TEXT, so we just need to add the new columns

-- Add note_id to track note editing sessions
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE;

-- Add exam_id to track exam sessions (only if exam_sets table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_sets' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_sessions' AND column_name = 'exam_id') THEN
      ALTER TABLE public.study_sessions
        ADD COLUMN exam_id UUID REFERENCES public.exam_sets(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Add questions_answered column for exam tracking
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS questions_answered INTEGER DEFAULT 0;

-- Add score column for tracking exam scores
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS score DECIMAL(5,2);

-- Create index for faster activity queries by date
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at_user
  ON public.study_sessions(user_id, started_at DESC);

-- Create index for session type queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_type
  ON public.study_sessions(session_type);

-- RLS Policy for study_sessions (ensure users can only see their own sessions)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update own study sessions" ON public.study_sessions;

-- Create new policies
CREATE POLICY "Users can view own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN public.study_sessions.session_type IS 'Type of activity: flashcard_study, note_edit, exam_attempt, flashcard_created, note_created';
COMMENT ON COLUMN public.study_sessions.note_id IS 'Reference to notes table for note editing sessions';
COMMENT ON COLUMN public.study_sessions.questions_answered IS 'Number of questions answered (for exam sessions)';
COMMENT ON COLUMN public.study_sessions.score IS 'Score achieved (for exam sessions, as percentage)';
