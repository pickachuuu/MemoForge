'use client';

import { useState, useCallback, useMemo, useEffect, useRef, forwardRef } from 'react';
import { clsx } from 'clsx';
import { ClayCard } from '@/component/ui/Clay';
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  CheckmarkCircle01Icon,
  PencilEdit01Icon,
  TextIcon,
  Tick01Icon,
} from 'hugeicons-react';

// ============================================
// Types
// ============================================

export interface StepperQuestion {
  id: string;
  question_type: 'multiple_choice' | 'identification' | 'essay';
  question: string;
  options: string[] | null;
  points: number;
  position: number;
}

export interface ExamQuestionStepperProps {
  questions: StepperQuestion[];
  answers: Map<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSaveAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  className?: string;
}

// ============================================
// Main Component
// ============================================

export default function ExamQuestionStepper({
  questions,
  answers,
  onAnswerChange,
  onSaveAnswer,
  onSubmit,
  className,
}: ExamQuestionStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const answeredCount = useMemo(
    () => questions.filter((q) => answers.has(q.id) && answers.get(q.id)?.trim()).length,
    [questions, answers]
  );

  // Auto-focus input when navigating
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Save current answer before navigating away
  const saveCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const answer = answers.get(currentQuestion.id);
    if (answer?.trim()) {
      onSaveAnswer(currentQuestion.id, answer);
    }
  }, [currentQuestion, answers, onSaveAnswer]);

  const goToNext = useCallback(() => {
    saveCurrentAnswer();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, totalQuestions, saveCurrentAnswer]);

  const goToPrev = useCallback(() => {
    saveCurrentAnswer();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, saveCurrentAnswer]);

  const goToQuestion = useCallback(
    (index: number) => {
      saveCurrentAnswer();
      setCurrentIndex(index);
    },
    [saveCurrentAnswer]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (!currentQuestion) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const currentAnswer = answers.get(currentQuestion.id) || '';
  const isAnswered = currentAnswer.trim().length > 0;
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className={clsx('flex flex-col h-full overflow-hidden', className)}>
      {/* Progress bar */}
      <div className="w-full bg-background-muted rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question dots / mini nav */}
      <div className="flex items-center justify-center gap-1.5 mb-6 flex-wrap">
        {questions.map((q, idx) => {
          const qAnswered = answers.has(q.id) && answers.get(q.id)?.trim();
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={clsx(
                'w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center border-2',
                isCurrent
                  ? 'bg-primary text-white border-primary scale-110 shadow-md shadow-primary/30'
                  : qAnswered
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:border-emerald-400'
                    : 'bg-surface text-foreground-muted border-border hover:border-foreground-muted/50'
              )}
              title={`Question ${idx + 1}${qAnswered ? ' (answered)' : ''}`}
            >
              {qAnswered && !isCurrent ? (
                <Tick01Icon className="w-3.5 h-3.5" />
              ) : (
                idx + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Question card — wrapped in ClayCard for visual separation */}
      <ClayCard variant="elevated" padding="lg" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Question type badge + status — fixed row */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <QuestionTypeBadge type={currentQuestion.question_type} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted font-medium">
              {currentQuestion.points} pt{currentQuestion.points !== 1 ? 's' : ''}
            </span>
            {isAnswered && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckmarkCircle01Icon className="w-3.5 h-3.5" />
                Answered
              </span>
            )}
          </div>
        </div>

        {/* Question text — generous height, scrolls only for very long questions */}
        <div className="mb-6 shrink-0 max-h-[200px] overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
            <span className="text-foreground-muted font-bold mr-2">{currentIndex + 1}.</span>
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer area — takes remaining space, content scrolls inside */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-2">
          {currentQuestion.question_type === 'multiple_choice' && (
            <MultipleChoiceInput
              question={currentQuestion}
              value={currentAnswer}
              onChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
            />
          )}
          {currentQuestion.question_type === 'identification' && (
            <IdentificationInput
              ref={inputRef as React.Ref<HTMLInputElement>}
              value={currentAnswer}
              onChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
              onSubmit={goToNext}
            />
          )}
          {currentQuestion.question_type === 'essay' && (
            <EssayInput
              ref={inputRef as React.Ref<HTMLTextAreaElement>}
              value={currentAnswer}
              onChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
            />
          )}
        </div>

        {/* Navigation — always pinned to the bottom */}
        <div className="flex items-center justify-between mt-4 pt-6 border-t border-border shrink-0">
          <button
            onClick={goToPrev}
            disabled={isFirst}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              isFirst
                ? 'opacity-40 cursor-not-allowed text-foreground-muted'
                : 'text-foreground hover:bg-background-muted active:scale-95'
            )}
          >
            <ArrowLeft02Icon className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-foreground-muted font-medium">
            {answeredCount} of {totalQuestions} answered
          </span>

          {isLast ? (
            <button
              onClick={() => {
                saveCurrentAnswer();
                onSubmit();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Submit
              <CheckmarkCircle01Icon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Next
              <ArrowRight02Icon className="w-4 h-4" />
            </button>
          )}
        </div>
      </ClayCard>
    </div>
  );
}

// ============================================
// Question Type Badge
// ============================================

function QuestionTypeBadge({ type }: { type: StepperQuestion['question_type'] }) {
  const config = {
    multiple_choice: {
      label: 'Multiple Choice',
      icon: Tick01Icon,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    identification: {
      label: 'Identification',
      icon: PencilEdit01Icon,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    essay: {
      label: 'Essay',
      icon: TextIcon,
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  const { label, icon: Icon, className: badgeClass } = config[type];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border',
        badgeClass
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

// ============================================
// Multiple Choice Input
// ============================================

function MultipleChoiceInput({
  question,
  value,
  onChange,
}: {
  question: StepperQuestion;
  value: string;
  onChange: (answer: string) => void;
}) {
  if (!question.options) return null;

  return (
    <div className="space-y-3">
      {question.options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const isSelected = value.toUpperCase() === letter;
        // Strip the "A) " prefix if present
        const optionText = opt.replace(/^[A-D]\)\s*/, '');

        return (
          <button
            key={idx}
            onClick={() => onChange(letter)}
            className={clsx(
              'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-surface hover:border-foreground-muted/40 hover:bg-background-muted/50'
            )}
          >
            {/* Letter circle */}
            <span
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200',
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-background-muted text-foreground-muted border border-border'
              )}
            >
              {letter}
            </span>

            {/* Option text */}
            <span
              className={clsx(
                'text-sm font-medium transition-colors',
                isSelected ? 'text-foreground' : 'text-foreground-muted'
              )}
            >
              {optionText}
            </span>

            {/* Check indicator */}
            {isSelected && (
              <CheckmarkCircle01Icon className="w-5 h-5 text-primary ml-auto shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Identification Input
// ============================================

const IdentificationInput = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (answer: string) => void;
    onSubmit: () => void;
  }
>(function IdentificationInput({ value, onChange, onSubmit }, ref) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground-muted">
        Type your answer below
      </label>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Your answer..."
        className="w-full px-5 py-4 rounded-2xl bg-surface border-2 border-border text-foreground placeholder:text-foreground-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
      />
      <p className="text-xs text-foreground-muted/70">
        Press Enter to go to the next question
      </p>
    </div>
  );
});

// ============================================
// Essay Input
// ============================================

const EssayInput = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (answer: string) => void;
  }
>(function EssayInput({ value, onChange }, ref) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground-muted">
        Write your answer below
      </label>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here..."
        rows={8}
        className="w-full px-5 py-4 rounded-2xl bg-surface border-2 border-border text-foreground placeholder:text-foreground-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base resize-y min-h-[200px]"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-muted/70">
          Provide a thorough, well-structured answer
        </p>
        <span className="text-xs text-foreground-muted font-medium">
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
});
