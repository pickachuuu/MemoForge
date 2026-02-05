'use client';

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ClayCard, ClayButton, ClayBadge } from "@/component/ui/Clay";
import { useExamActions, ExamWithQuestions } from "@/hook/useExamActions";
import { ExamQuestion } from "@/lib/database.types";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  TestTube01Icon,
  Target01Icon
} from "hugeicons-react";
import { clsx } from "clsx";

// Question type colors
const questionTypeStyles = {
  multiple_choice: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Multiple Choice'
  },
  identification: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    label: 'Identification'
  },
  essay: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    label: 'Essay'
  }
};

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  // State
  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [gradingStatus, setGradingStatus] = useState<string>('');
  const [gradingError, setGradingError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Map<string, string>>(new Map());

  const {
    getExamById,
    startExamAttempt,
    getInProgressAttempt,
    getAttemptResponses,
    saveResponse,
    submitExam
  } = useExamActions();

  // Load exam and start/resume attempt
  useEffect(() => {
    const loadExam = async () => {
      setIsLoading(true);
      try {
        const examData = await getExamById(examId);
        if (!examData) {
          router.push('/exams');
          return;
        }
        setExam(examData);

        // Check for in-progress attempt
        const existingAttempt = await getInProgressAttempt(examId);
        if (existingAttempt) {
          setAttemptId(existingAttempt.id);
          // Load existing responses
          const responses = await getAttemptResponses(existingAttempt.id);
          setAnswers(responses);

          // Calculate remaining time if timed
          if (examData.time_limit_minutes) {
            const elapsed = Math.floor((Date.now() - new Date(existingAttempt.started_at).getTime()) / 1000);
            const remaining = examData.time_limit_minutes * 60 - elapsed;
            setTimeRemaining(Math.max(0, remaining));
          }
        } else {
          // Start new attempt
          const newAttemptId = await startExamAttempt(examId);
          setAttemptId(newAttemptId);

          if (examData.time_limit_minutes) {
            setTimeRemaining(examData.time_limit_minutes * 60);
          }
        }
      } catch (error) {
        console.error('Error loading exam:', error);
        router.push('/exams');
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [examId, getExamById, startExamAttempt, getInProgressAttempt, getAttemptResponses, router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  // Current question
  const currentQuestion = useMemo(() => {
    if (!exam?.questions || currentQuestionIndex < 0 || currentQuestionIndex >= exam.questions.length) {
      return null;
    }
    return exam.questions[currentQuestionIndex];
  }, [exam?.questions, currentQuestionIndex]);

  // Progress stats
  const progress = useMemo(() => {
    if (!exam?.questions) return { answered: 0, total: 0, percentage: 0 };
    const answered = exam.questions.filter(q => answers.has(q.id) && answers.get(q.id)?.trim()).length;
    return {
      answered,
      total: exam.questions.length,
      percentage: Math.round((answered / exam.questions.length) * 100)
    };
  }, [exam?.questions, answers]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change - local state only, no auto-save on keystroke
  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, answer);
      return newAnswers;
    });
  }, []);

  // Save current answer to database (called on navigation)
  const saveCurrentAnswer = useCallback(async () => {
    if (!attemptId || !exam) return;

    const currentQuestion = exam.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const answer = answers.get(currentQuestion.id);
    if (answer === undefined) return;

    // Skip if already saved
    if (lastSavedRef.current.get(currentQuestion.id) === answer) return;

    try {
      await saveResponse(attemptId, currentQuestion.id, answer);
      lastSavedRef.current.set(currentQuestion.id, answer);
    } catch (error) {
      console.error('Error saving response:', error);
    }
  }, [attemptId, exam, currentQuestionIndex, answers, saveResponse]);

  // Navigation - save answer before moving to next question
  const handleNext = useCallback(async () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      await saveCurrentAnswer();
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [exam, currentQuestionIndex, saveCurrentAnswer]);

  const handlePrevious = useCallback(async () => {
    if (currentQuestionIndex > 0) {
      await saveCurrentAnswer();
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex, saveCurrentAnswer]);

  const handleGoToQuestion = useCallback(async (index: number) => {
    await saveCurrentAnswer();
    setCurrentQuestionIndex(index);
  }, [saveCurrentAnswer]);

  // Submit exam with progress tracking
  const handleSubmitExam = useCallback(async () => {
    if (!attemptId || !exam) return;

    setIsSubmitting(true);
    setGradingError(null);

    // Save all answers before grading
    setGradingStatus('Saving final answers...');
    for (const question of exam.questions) {
      const answer = answers.get(question.id);
      if (answer !== undefined && lastSavedRef.current.get(question.id) !== answer) {
        try {
          await saveResponse(attemptId, question.id, answer);
          lastSavedRef.current.set(question.id, answer);
        } catch (e) {
          console.error('Error saving answer:', e);
        }
      }
    }

    // Count question types
    const mcCount = exam.questions.filter(q => q.question_type === 'multiple_choice').length;
    const idCount = exam.questions.filter(q => q.question_type === 'identification').length;
    const essayCount = exam.questions.filter(q => q.question_type === 'essay').length;

    try {
      // Show what we're doing
      setGradingStatus(`Grading ${mcCount} multiple choice...`);
      await new Promise(r => setTimeout(r, 300)); // Brief pause so user sees it

      if (idCount > 0) {
        setGradingStatus(`Grading ${idCount} identification...`);
        await new Promise(r => setTimeout(r, 300));
      }

      if (essayCount > 0) {
        setGradingStatus(`AI grading ${essayCount} essay${essayCount > 1 ? 's' : ''}... (this may take a few seconds)`);
      }

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      console.log('[Exam] Submitting attempt:', attemptId, 'Time spent:', timeSpent);

      const result = await submitExam(attemptId, timeSpent);
      console.log('[Exam] Grading complete! Score:', result?.percentage, '%');

      if (timerRef.current) clearInterval(timerRef.current);

      setGradingStatus('Done! Redirecting to results...');
      await new Promise(r => setTimeout(r, 500));

      // Navigate to results
      router.push(`/exams/${examId}/results/${attemptId}`);
    } catch (error) {
      console.error('[Exam] Error submitting exam:', error);
      setGradingError(error instanceof Error ? error.message : 'Failed to grade exam. Please try again.');
      setIsSubmitting(false);
    }
  }, [attemptId, exam, startTime, submitExam, examId, router, answers, saveResponse]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-background-muted rounded mb-6 w-1/3"></div>
            <div className="h-4 bg-background-muted rounded mb-8 w-1/2"></div>
            <div className="h-96 bg-background-muted rounded-xl mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // No exam found
  if (!exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">Exam Not Found</h2>
          <ClayButton onClick={() => router.push('/exams')}>
            Back to Exams
          </ClayButton>
        </div>
      </div>
    );
  }

  const questionStyle = questionTypeStyles[currentQuestion.question_type];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/exams')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft01Icon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold text-foreground">{exam.title}</h1>
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <span>{progress.answered}/{progress.total} answered</span>
                  <span>·</span>
                  <span>{progress.percentage}% complete</span>
                </div>
              </div>
            </div>

            {/* Timer */}
            {timeRemaining !== null && (
              <div className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg',
                timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-foreground'
              )}>
                <Clock01Icon className="w-5 h-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-secondary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Question navigation pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {exam.questions.map((q, idx) => {
            const isAnswered = answers.has(q.id) && answers.get(q.id)?.trim();
            const isCurrent = idx === currentQuestionIndex;
            const style = questionTypeStyles[q.question_type];

            return (
              <button
                key={q.id}
                onClick={() => handleGoToQuestion(idx)}
                className={clsx(
                  'w-10 h-10 rounded-xl text-sm font-medium transition-all',
                  isCurrent && 'ring-2 ring-secondary ring-offset-2',
                  isAnswered ? style.badge : 'bg-gray-100 text-gray-500'
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Test Paper Card */}
        <div className={clsx(
          'rounded-3xl border-2 overflow-hidden shadow-lg',
          questionStyle.border,
          questionStyle.bg
        )}>
          {/* Question header */}
          <div className="px-8 py-5 border-b border-gray-200/50 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">
                  Q{currentQuestionIndex + 1}
                </span>
                <span className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  questionStyle.badge
                )}>
                  {questionStyle.label}
                </span>
              </div>
              <span className="text-sm text-foreground-muted">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </div>
          </div>

          {/* Question content */}
          <div className="px-8 py-8">
            {/* Paper lines background */}
            <div
              className="relative"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                backgroundPosition: '0 8px'
              }}
            >
              {/* Question text */}
              <p className="text-lg text-foreground leading-relaxed mb-8 whitespace-pre-wrap">
                {currentQuestion.question}
              </p>

              {/* Answer section */}
              {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    const isSelected = answers.get(currentQuestion.id)?.toUpperCase() === letter;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(currentQuestion.id, letter)}
                        className={clsx(
                          'w-full text-left p-4 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className={clsx(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          )}>
                            {letter}
                          </span>
                          <span className="text-foreground pt-1">{option.replace(/^[A-D]\)\s*/, '')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.question_type === 'identification' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground-muted">Your Answer:</label>
                  <input
                    type="text"
                    value={answers.get(currentQuestion.id) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-0 outline-none transition-colors bg-white"
                  />
                </div>
              )}

              {currentQuestion.question_type === 'essay' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground-muted">Your Answer:</label>
                  <textarea
                    value={answers.get(currentQuestion.id) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Write your essay answer here..."
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 outline-none transition-colors bg-white resize-none"
                  />
                  <div className="text-right text-sm text-foreground-muted">
                    {(answers.get(currentQuestion.id) || '').length} characters
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <ClayButton
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft01Icon className="w-4 h-4 mr-2" />
            Previous
          </ClayButton>

          <div className="flex items-center gap-2">
            {currentQuestionIndex === exam.questions.length - 1 ? (
              <ClayButton
                variant="primary"
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-secondary hover:bg-secondary/90"
              >
                <CheckmarkCircle01Icon className="w-4 h-4 mr-2" />
                Submit Exam
              </ClayButton>
            ) : (
              <ClayButton
                variant="primary"
                onClick={handleNext}
                className="bg-secondary hover:bg-secondary/90"
              >
                Next
                <ArrowRight01Icon className="w-4 h-4 ml-2" />
              </ClayButton>
            )}
          </div>
        </div>

        {/* Submit warning for unanswered questions */}
        {progress.answered < progress.total && (
          <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
            <AlertCircleIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {progress.total - progress.answered} question{progress.total - progress.answered > 1 ? 's' : ''} unanswered
              </p>
              <p className="text-sm text-yellow-700">
                Make sure to answer all questions before submitting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit confirmation modal */}
      {showConfirmSubmit && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setShowConfirmSubmit(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              {isSubmitting ? (
                <div className="text-center py-4">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-secondary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TestTube01Icon className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Grading Your Exam...</h3>
                  <p className="text-foreground-muted text-sm mb-3">
                    {gradingStatus || 'Processing your answers...'}
                  </p>
                  <div className="text-xs text-foreground-muted/60 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                    Check console (F12) for detailed logs
                  </div>
                </div>
              ) : gradingError ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircleIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Grading Failed</h3>
                  <p className="text-red-600 text-sm mb-4">{gradingError}</p>
                  <div className="flex gap-3">
                    <ClayButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowConfirmSubmit(false);
                        setGradingError(null);
                      }}
                    >
                      Cancel
                    </ClayButton>
                    <ClayButton
                      variant="primary"
                      className="flex-1 bg-secondary hover:bg-secondary/90"
                      onClick={handleSubmitExam}
                    >
                      Retry
                    </ClayButton>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <TestTube01Icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Submit Exam?</h3>
                  <p className="text-foreground-muted mb-4">
                    You have answered <span className="font-semibold text-foreground">{progress.answered}</span> of <span className="font-semibold text-foreground">{progress.total}</span> questions.
                  </p>
                  {progress.answered < progress.total && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded-xl mb-4">
                      You still have {progress.total - progress.answered} unanswered question{progress.total - progress.answered > 1 ? 's' : ''}!
                    </p>
                  )}
                  <div className="flex gap-3 mt-6">
                    <ClayButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowConfirmSubmit(false)}
                    >
                      Go Back
                    </ClayButton>
                    <ClayButton
                      variant="primary"
                      className="flex-1 bg-secondary hover:bg-secondary/90"
                      onClick={handleSubmitExam}
                    >
                      <Target01Icon className="w-4 h-4 mr-2" />
                      Submit
                    </ClayButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
