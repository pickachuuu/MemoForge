'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import SaveMaterialModal from '@/component/features/modal/SaveMaterialModal';
import { useCopyPublicNote, useSaveReference } from '@/hooks/useSavedMaterials';
import { ArrowLeft01Icon, Bookmark01Icon } from 'hugeicons-react';

const supabase = createClient();

interface PublicNote {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  updated_at: string;
  created_at: string;
}

interface PublicNotePage {
  id: string;
  title: string;
  content: string;
  page_order: number;
}

export default function PublicNotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params?.noteId as string;

  const [note, setNote] = useState<PublicNote | null>(null);
  const [pages, setPages] = useState<PublicNotePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savingAction, setSavingAction] = useState<'reference' | 'copy' | null>(null);

  const saveReferenceMutation = useSaveReference();
  const copyNoteMutation = useCopyPublicNote();

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      setLoading(true);

      try {
        const { data: noteData, error: noteError } = await supabase
          .from('notes')
          .select('id, title, content, tags, updated_at, created_at')
          .eq('id', noteId)
          .eq('is_public', true)
          .single();

        if (noteError || !noteData) {
          setError('Note not found or not public');
          setLoading(false);
          return;
        }

        setNote(noteData);

        const { data: pagesData, error: pagesError } = await supabase
          .from('note_pages')
          .select('id, title, content, page_order')
          .eq('note_id', noteId)
          .order('page_order', { ascending: true });

        if (pagesError) {
          console.error('Error loading note pages:', pagesError);
        }

        setPages(pagesData || []);
        setLoading(false);
      } catch (err) {
        setError('An error occurred while loading this note');
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  const hasPages = pages.length > 0;
  const updatedLabel = useMemo(() => {
    if (!note) return '';
    const date = new Date(note.updated_at || note.created_at);
    return date.toLocaleDateString();
  }, [note]);

  const handleSaveReference = async () => {
    if (!note) return;
    setSavingAction('reference');
    try {
      await saveReferenceMutation.mutateAsync({ itemType: 'note', itemId: note.id });
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('Error saving note reference:', error);
    } finally {
      setSavingAction(null);
    }
  };

  const handleSaveCopy = async () => {
    if (!note) return;
    setSavingAction('copy');
    try {
      const result = await copyNoteMutation.mutateAsync(note.id);
      setIsSaveModalOpen(false);
      router.push(`/library/${result.slug}`);
    } catch (error) {
      console.error('Error copying note:', error);
    } finally {
      setSavingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground-muted">Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
        <Card variant="elevated" className="text-center py-12">
          <p className="text-foreground-muted">{error || 'This note is not available for public viewing.'}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/community">
              <Button variant="outline">
                <ArrowLeft01Icon className="w-4 h-4 mr-2" />
                Back to Community
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/community" className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
          <ArrowLeft01Icon className="w-4 h-4" />
          <span className="text-sm font-medium">Community</span>
        </Link>
        <Button variant="outline" size="sm" onClick={() => setIsSaveModalOpen(true)}>
          <Bookmark01Icon className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <Card variant="elevated" className="space-y-4">
        <Card.Header>
          <h1 className="text-2xl font-bold text-foreground">{note.title || 'Untitled Note'}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
            <span>Updated {updatedLabel}</span>
            {note.tags && note.tags.length > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{note.tags.map((tag) => `#${tag}`).join(' ')}</span>
              </>
            )}
          </div>
        </Card.Header>
      </Card>

      {hasPages ? (
        <div className="space-y-4">
          {pages.map((page) => (
            <Card key={page.id} variant="default" className="space-y-3">
              <Card.Header>
                <h2 className="text-lg font-semibold text-foreground">{page.title || 'Untitled Page'}</h2>
              </Card.Header>
              <Card.Content>
                <div className="tiptap-editor prose prose-sm sm:prose lg:prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: page.content || '' }} />
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="default" className="space-y-3">
          <Card.Content>
            <div className="tiptap-editor prose prose-sm sm:prose lg:prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: note.content || '' }} />
            </div>
          </Card.Content>
        </Card>
      )}

      <SaveMaterialModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        itemType="note"
        title={note.title || 'Note'}
        onSaveReference={handleSaveReference}
        onSaveCopy={handleSaveCopy}
        savingAction={savingAction}
      />
    </div>
  );
}
