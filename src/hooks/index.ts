// Centralized exports for all custom hooks

// Note hooks
export {
  useUserNotes,
  useNote,
  useNotePages,
  useCreateNote,
  useSaveNote,
  useDeleteNote,
  useCreatePage,
  useSavePage,
  useDeletePage,
  extractH1Title,
  noteKeys,
  type Note,
  type NotePage,
} from './useNotes';

// Dashboard hooks
export {
  useDashboardStats,
  useRecentActivity,
  dashboardKeys,
  type DashboardStats,
  type ActivityItem,
} from './useDashboard';

// Auth hooks
export {
  useUserProfile,
  authKeys,
  type UserProfile,
} from './useAuth';

// Flashcard hooks
export {
  useFlashcardSets,
  useFlashcardSet,
  useStudySetData,
  usePublicFlashcardSet,
  usePublicFlashcards,
  useSaveGeneratedFlashcards,
  useReforgeFlashcards,
  useUpdateFlashcardStatus,
  useDeleteFlashcardSet,
  useTogglePublicStatus,
  flashcardKeys,
  type StudySetData,
  type SaveFlashcardsOptions,
  type ReforgeOptions,
  type UpdateStatusParams,
  type Flashcard,
  type FlashcardSet,
} from './useFlashcards';

// Exam hooks
export {
  useExams,
  useExam,
  useAttemptResults,
  useInProgressAttempt,
  useExamAttempts,
  useCreateExam,
  useDeleteExam,
  useStartExamAttempt,
  useSaveResponse,
  useSubmitExam,
  useAbandonAttempt,
  examKeys,
  type ExamWithQuestions,
  type AttemptWithResponses,
  type ExamListItem,
  type CreateExamParams,
  type SaveResponseParams,
  type SubmitExamParams,
  type ExamSet,
  type ExamQuestion,
  type ExamAttempt,
  type ExamResponse,
} from './useExams';
