-- Migration: Create exam tables for practice exam functionality
-- This enables users to generate AI-powered exams from their notes

-- Create custom types for exams
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_difficulty') THEN
    CREATE TYPE exam_difficulty AS ENUM ('easy', 'medium', 'hard', 'mixed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'identification', 'essay');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attempt_status') THEN
    CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');
  END IF;
END $$;

-- Exam sets table - stores exam metadata
CREATE TABLE IF NOT EXISTS public.exam_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty exam_difficulty DEFAULT 'medium',
    total_questions INTEGER DEFAULT 0,
    time_limit_minutes INTEGER,
    include_multiple_choice BOOLEAN DEFAULT TRUE,
    include_identification BOOLEAN DEFAULT TRUE,
    include_essay BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam questions table - stores individual questions
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES public.exam_sets(id) ON DELETE CASCADE NOT NULL,
    question_type question_type NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSONB,
    points INTEGER DEFAULT 1,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam attempts table - tracks each exam taking session
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exam_sets(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER DEFAULT 0,
    total_score DECIMAL(10, 2) DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    percentage DECIMAL(5, 2) DEFAULT 0,
    status attempt_status DEFAULT 'in_progress'
);

-- Exam responses table - stores user answers for each question
CREATE TABLE IF NOT EXISTS public.exam_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.exam_questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    score DECIMAL(10, 2) DEFAULT 0,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_exam_sets_user_id ON public.exam_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sets_note_id ON public.exam_sets(note_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id_position ON public.exam_questions(exam_id, position);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_exam ON public.exam_attempts(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON public.exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_responses_attempt_id ON public.exam_responses(attempt_id);

-- Trigger for auto-updating updated_at on exam_sets
CREATE TRIGGER update_exam_sets_updated_at
    BEFORE UPDATE ON public.exam_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-assign position on new question insert
CREATE OR REPLACE FUNCTION set_exam_question_position()
RETURNS TRIGGER AS $$
BEGIN
  -- If position is not provided or is 0, set it to the next available position
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(position) + 1, 0) INTO NEW.position
    FROM public.exam_questions
    WHERE exam_id = NEW.exam_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS before_exam_question_insert ON public.exam_questions;

-- Create trigger to auto-set position on insert
CREATE TRIGGER before_exam_question_insert
  BEFORE INSERT ON public.exam_questions
  FOR EACH ROW
  EXECUTE FUNCTION set_exam_question_position();

-- Function to update exam_sets total_questions count
CREATE OR REPLACE FUNCTION update_exam_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.exam_sets
    SET total_questions = (
      SELECT COUNT(*) FROM public.exam_questions WHERE exam_id = NEW.exam_id
    ),
    updated_at = NOW()
    WHERE id = NEW.exam_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.exam_sets
    SET total_questions = (
      SELECT COUNT(*) FROM public.exam_questions WHERE exam_id = OLD.exam_id
    ),
    updated_at = NOW()
    WHERE id = OLD.exam_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_exam_question_change ON public.exam_questions;

-- Create trigger to update question count
CREATE TRIGGER on_exam_question_change
  AFTER INSERT OR UPDATE OR DELETE ON public.exam_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_exam_question_count();

-- Enable Row Level Security
ALTER TABLE public.exam_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_sets
CREATE POLICY "Users can view their own exam sets"
  ON public.exam_sets FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own exam sets"
  ON public.exam_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sets"
  ON public.exam_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam sets"
  ON public.exam_sets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exam_questions
CREATE POLICY "Users can view questions of their exams or public exams"
  ON public.exam_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_sets
      WHERE id = exam_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can create questions for their exams"
  ON public.exam_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exam_sets
      WHERE id = exam_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions of their exams"
  ON public.exam_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_sets
      WHERE id = exam_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions of their exams"
  ON public.exam_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_sets
      WHERE id = exam_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for exam_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON public.exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
  ON public.exam_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attempts"
  ON public.exam_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exam_responses
CREATE POLICY "Users can view their own responses"
  ON public.exam_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own responses"
  ON public.exam_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exam_attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own responses"
  ON public.exam_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own responses"
  ON public.exam_responses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );
