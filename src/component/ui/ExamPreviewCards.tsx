'use client';

import { ClayCard, ClayButton, ClayIconBox } from '@/component/ui/Clay';
import { CheckmarkCircle02Icon, BookOpen01Icon } from 'hugeicons-react';

interface MultipleChoiceOption {
  label: string;
  text: string;
  isSelected?: boolean;
}

interface MultipleChoicePreviewProps {
  title?: string;
  questionCount?: number;
  questionNumber?: number;
  question?: string;
  options?: MultipleChoiceOption[];
  timeRemaining?: string;
  className?: string;
}

interface EssayPreviewProps {
  title?: string;
  questionCount?: number;
  questionNumber?: number;
  question?: string;
  placeholder?: string;
  timeRemaining?: string;
  showPlaceholderLines?: boolean;
  className?: string;
}

export function MultipleChoicePreview({
  title = 'Multiple Choice',
  questionCount = 15,
  questionNumber = 1,
  question = 'What organelle is responsible for producing ATP in eukaryotic cells?',
  options = [
    { label: 'A', text: 'Nucleus', isSelected: false },
    { label: 'B', text: 'Mitochondria', isSelected: true },
    { label: 'C', text: 'Ribosome', isSelected: false },
    { label: 'D', text: 'Golgi apparatus', isSelected: false },
  ],
  timeRemaining = '12:34',
  className = '',
}: MultipleChoicePreviewProps) {
  return (
    <ClayCard variant="elevated" padding="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClayIconBox size="sm" variant="accent">
            <CheckmarkCircle02Icon className="w-4 h-4 text-accent" />
          </ClayIconBox>
          <span className="font-semibold text-foreground text-sm">{title}</span>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
          {questionCount} questions
        </span>
      </div>

      <ClayCard variant="pressed" padding="sm" className="mb-4">
        <p className="text-[10px] text-foreground-muted mb-2">
          Question {questionNumber} of {questionCount}
        </p>
        <p className="text-xs font-medium text-foreground mb-4">{question}</p>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                option.isSelected
                  ? 'border-2 border-accent bg-accent-muted'
                  : 'border border-border'
              }`}
            >
              <span className={`text-xs text-foreground ${option.isSelected ? 'font-medium' : ''}`}>
                {option.label}. {option.text}
              </span>
            </div>
          ))}
        </div>
      </ClayCard>

      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-muted">Time: {timeRemaining}</span>
        <ClayButton variant="primary" size="sm">Next</ClayButton>
      </div>
    </ClayCard>
  );
}

export function EssayPreview({
  title = 'Essay',
  questionCount = 5,
  questionNumber = 1,
  question = 'Explain the process of cellular respiration and its importance in living organisms.',
  placeholder = 'Type your answer here...',
  timeRemaining = '25:00',
  showPlaceholderLines = true,
  className = '',
}: EssayPreviewProps) {
  return (
    <ClayCard variant="elevated" padding="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClayIconBox size="sm" variant="accent">
            <BookOpen01Icon className="w-4 h-4 text-accent" />
          </ClayIconBox>
          <span className="font-semibold text-foreground text-sm">{title}</span>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
          {questionCount} questions
        </span>
      </div>

      <ClayCard variant="pressed" padding="sm" className="mb-4">
        <p className="text-[10px] text-foreground-muted mb-2">
          Question {questionNumber} of {questionCount}
        </p>
        <p className="text-xs font-medium text-foreground mb-4">{question}</p>
        <div className="bg-background-muted rounded-lg p-4 min-h-[120px] border border-border">
          <p className="text-xs text-foreground-muted italic">{placeholder}</p>
          {showPlaceholderLines && (
            <div className="mt-3 space-y-2">
              <div className="h-2 bg-border/50 rounded w-full"></div>
              <div className="h-2 bg-border/50 rounded w-4/5"></div>
              <div className="h-2 bg-border/50 rounded w-3/5"></div>
            </div>
          )}
        </div>
      </ClayCard>

      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-muted">Time: {timeRemaining}</span>
        <ClayButton variant="primary" size="sm">Submit</ClayButton>
      </div>
    </ClayCard>
  );
}

interface ExamCardsStackProps {
  multipleChoiceProps?: MultipleChoicePreviewProps;
  essayProps?: EssayPreviewProps;
  className?: string;
}

export function ExamCardsStack({
  multipleChoiceProps = {},
  essayProps = {},
  className = '',
}: ExamCardsStackProps) {
  return (
    <div className={`relative h-[520px] ${className}`}>
      {/* Multiple Choice Card - Behind, on the left side */}
      <div className="absolute top-0 left-0 w-[75%] -rotate-3 z-10">
        <MultipleChoicePreview {...multipleChoiceProps} />
      </div>

      {/* Essay Card - On top, offset to the right */}
      <div className="absolute top-8 right-0 w-[75%] rotate-2 z-20">
        <EssayPreview {...essayProps} />
      </div>
    </div>
  );
}
