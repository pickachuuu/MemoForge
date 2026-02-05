'use client';

import Header from '@/component/ui/Header';
import { ClayCard } from '@/component/ui/Clay';
import ClayNotebookCover, { NotebookColorKey } from '@/component/ui/ClayNotebookCover';
import CreateNoteButton from '@/component/features/CreateNoteButton';
import { Book02Icon, BookOpen01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { useNoteActions } from '@/hook/useNoteActions';
import { useFlashcardActions } from '@/hook/useFlashcardActions';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import GenerateFlashCardModal from '@/component/features/modal/GenerateFlashCardModal';
import ConfirmDeleteModal from '@/component/features/modal/ConfirmDeleteModal';
import { GeminiResponse } from '@/lib/gemini';

const supabase = createClient();

export default function NotesPage() {
  const { getUserNotes, deleteNote } = useNoteActions();
  const { saveGeneratedFlashcards } = useFlashcardActions();
  const [notes, setNotes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const params = useParams();
  const noteId = params?.noteId as string | undefined;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          window.location.href = '/auth';
          return;
        }

        if (!session) {
          window.location.href = '/auth';
          return;
        }

        const data = await getUserNotes();
        setNotes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error in checkAuth:', error);
        window.location.href = '/auth';
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      (note.title && note.title.trim() !== '') ||
      (note.content && note.content.trim() !== '') ||
      (Array.isArray(note.tags) && note.tags.length > 0)
  );

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        const { data, error } = await supabase
          .from('notes')
          .select('title, content, tags')
          .eq('id', noteId)
          .single();
        if (data) {
          const updatedNotes = notes.map((note) =>
            note.id === noteId ? { ...note, title: data.title, content: data.content, tags: data.tags } : note
          );
          setNotes(updatedNotes);
        }
      }
    };
    fetchNote();
  }, [noteId, notes]);

  const handleGenerateFlashcards = (note: any) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (note: any) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNote) return;

    try {
      await deleteNote(selectedNote.id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNote.id));
      setSaveSuccess('Notebook deleted successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting notebook:', error);
      setSaveSuccess('Error deleting notebook. Please try again.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const handleFlashcardsGenerated = async (geminiResponse: GeminiResponse) => {
    if (!selectedNote) return;

    setSaving(true);
    setSaveSuccess(null);
    try {
      const difficulty = geminiResponse.flashcards[0]?.difficulty || 'medium';
      const setId = await saveGeneratedFlashcards({
        noteId: selectedNote.id,
        noteTitle: selectedNote.title,
        difficulty,
        geminiResponse
      });

      setSaveSuccess(`Successfully saved ${geminiResponse.flashcards.length} flashcards!`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setSaveSuccess('Error saving flashcards. Please try again.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  return (
    <>
      <div className="space-y-6">
        <Header
          title="Your Notebooks"
          description="Your personal collection of study notebooks"
          icon={<Book02Icon className="w-6 h-6 text-accent" />}
        >
          <CreateNoteButton />
        </Header>

        {/* Success/Error Message */}
        {saveSuccess && (
          <ClayCard
            variant="default"
            padding="sm"
            className={`rounded-xl ${
              saveSuccess.includes('Error')
                ? 'border-2 border-red-200 bg-red-50 dark:bg-red-950/20'
                : 'border-2 border-green-200 bg-green-50 dark:bg-green-950/20'
            }`}
          >
            <p className={`text-sm font-medium ${
              saveSuccess.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {saveSuccess}
            </p>
          </ClayCard>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="notebook-card-skeleton" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <ClayCard variant="elevated" padding="lg" className="rounded-2xl">
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-6">
                <BookOpen01Icon className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No notebooks yet</h3>
              <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                Create your first notebook to start organizing your study materials
              </p>
              <CreateNoteButton />
            </div>
          </ClayCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNotes.map((note) => (
              <Link href={`/editor/${note.slug || note.id}`} key={note.id} className="block">
                <ClayNotebookCover
                  mode="card"
                  title={note.title}
                  tags={note.tags || []}
                  updatedAt={note.updated_at}
                  color={(note.cover_color as NotebookColorKey) || 'lavender'}
                  onGenerateFlashcards={() => handleGenerateFlashcards(note)}
                  onDelete={() => handleDeleteNote(note)}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <GenerateFlashCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        noteContent={selectedNote?.content || ''}
        onFlashcardsGenerated={handleFlashcardsGenerated}
        saving={saving}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Notebook"
        description="Are you sure you want to delete this notebook? This action cannot be undone."
        itemName={selectedNote?.title || 'Untitled Notebook'}
        itemType="notebook"
      />
    </>
  );
}
