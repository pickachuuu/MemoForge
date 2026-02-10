'use client';

import Modal from '@/component/ui/Modal';
import { ClayCard } from '@/component/ui/Clay';
import { FlashcardIcon, ExamIcon, NotebookIcon } from '@/component/icons';

export type StudyMaterialType = 'flashcards' | 'exam';

interface GenerateStudyMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: StudyMaterialType) => void;
  noteTitle?: string | null;
}

export default function GenerateStudyMaterialModal({
  isOpen,
  onClose,
  onSelect,
  noteTitle,
}: GenerateStudyMaterialModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ClayCard variant="elevated" padding="lg" className="w-full max-w-md rounded-3xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-background-muted border border-border flex items-center justify-center">
            <NotebookIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Generate from notebook</h3>
            <p className="text-xs text-foreground-muted">
              {noteTitle ? `From "${noteTitle}"` : 'Choose what to create'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onSelect('flashcards')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:bg-background-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FlashcardIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Create flashcards</p>
              <p className="text-xs text-foreground-muted">Generate a study set from this notebook</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect('exam')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:bg-background-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <ExamIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Create an exam</p>
              <p className="text-xs text-foreground-muted">Generate practice questions from this notebook</p>
            </div>
          </button>
        </div>
      </ClayCard>
    </Modal>
  );
}
