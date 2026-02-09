'use client';

import Modal from '@/component/ui/Modal';
import { ClayButton, ClayCard } from '@/component/ui/Clay';
import { Bookmark01Icon, File01Icon, Cancel01Icon, Loading01Icon } from 'hugeicons-react';

interface SaveMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'note' | 'flashcard' | 'exam';
  title: string;
  onSaveReference: () => void;
  onSaveCopy: () => void;
  savingAction?: 'reference' | 'copy' | null;
}

const TYPE_LABELS: Record<SaveMaterialModalProps['itemType'], string> = {
  note: 'note',
  flashcard: 'flashcard set',
  exam: 'exam',
};

export default function SaveMaterialModal({
  isOpen,
  onClose,
  itemType,
  title,
  onSaveReference,
  onSaveCopy,
  savingAction = null,
}: SaveMaterialModalProps) {
  const isSaving = savingAction !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
      <ClayCard variant="elevated" padding="lg" className="rounded-3xl">
        <div className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Save {TYPE_LABELS[itemType]}</h2>
            <p className="text-sm text-foreground-muted">
              Choose how you want to keep <span className="font-semibold text-foreground">{title}</span>.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onSaveReference}
              disabled={isSaving}
              className="w-full text-left px-4 py-3 rounded-2xl border border-border bg-surface hover:shadow-sm transition-all disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-background-muted border border-border">
                  {savingAction === 'reference' ? (
                    <Loading01Icon className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Bookmark01Icon className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Save as reference</p>
                  <p className="text-xs text-foreground-muted">
                    Keeps a bookmark to the original in Saved Materials.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onSaveCopy}
              disabled={isSaving}
              className="w-full text-left px-4 py-3 rounded-2xl border border-border bg-surface hover:shadow-sm transition-all disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-background-muted border border-border">
                  {savingAction === 'copy' ? (
                    <Loading01Icon className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <File01Icon className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Create editable copy</p>
                  <p className="text-xs text-foreground-muted">
                    Adds a personal copy to your Library, Flashcards, or Exams.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-end">
            <ClayButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Cancel01Icon className="w-4 h-4" />
              Cancel
            </ClayButton>
          </div>
        </div>
      </ClayCard>
    </Modal>
  );
}
