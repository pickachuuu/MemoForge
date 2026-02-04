'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNoteActions } from '@/hook/useNoteActions';
import { createClient } from '@/utils/supabase/client';
import RichTextEditor from '@/component/ui/RichTextEditor';
import PageFlipContainer, { ViewType } from '@/component/ui/PageFlipContainer';
import NotebookCover from '@/component/ui/NotebookCover';
import TableOfContents, { NotePage } from '@/component/ui/TableOfContents';
import NotebookPage from '@/component/ui/NotebookPage';
import Link from 'next/link';
import {
  ArrowLeft02Icon,
  Tick01Icon,
  Loading03Icon,
  AlertCircleIcon,
  Home01Icon,
  Cancel01Icon,
  Tag01Icon,
  Book02Icon,
  Menu01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Add01Icon,
} from 'hugeicons-react';

const supabase = createClient();

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteIdOrSlug = params?.noteId as string | undefined;
  const {
    createNote,
    saveNote,
    getNoteBySlug,
    createPage,
    savePage,
    getPages,
    deletePage,
    extractH1Title,
  } = useNoteActions();

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('cover');
  const [currentPageIndex, setCurrentPageIndex] = useState<number | null>(null);

  // Note data
  const [id, setId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [loading, setLoading] = useState(!!noteIdOrSlug && noteIdOrSlug !== 'new');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Pages data
  const [pages, setPages] = useState<NotePage[]>([]);
  const [currentPageContent, setCurrentPageContent] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');

  // Store the actual previous content component for flip animation
  const previousContentRef = useRef<ReactNode>(null);

  // Determine if this is a new note
  const isNewNote = !noteIdOrSlug || noteIdOrSlug === 'new';

  // Sync theme with toolbar and other parts of the app
  useEffect(() => {
    const getTheme = (): 'light' | 'dark' => {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (newTheme: 'light' | 'dark') => {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      setTheme(newTheme);
    };

    const initialTheme = getTheme();
    applyTheme(initialTheme);

    const handleCustomThemeChange = (e: CustomEvent) => {
      const newTheme = (e.detail as { theme: string }).theme as 'light' | 'dark';
      if (newTheme === 'light' || newTheme === 'dark') {
        applyTheme(newTheme);
      }
    };

    const handleStorageChange = () => {
      const newTheme = getTheme();
      applyTheme(newTheme);
    };

    window.addEventListener('themechange', handleCustomThemeChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const currentTheme = getTheme();
      const isDark = document.documentElement.classList.contains('dark');
      if ((currentTheme === 'dark' && !isDark) || (currentTheme === 'light' && isDark)) {
        applyTheme(currentTheme);
      }
    }, 100);

    return () => {
      window.removeEventListener('themechange', handleCustomThemeChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch note and pages
  useEffect(() => {
    const fetchNote = async () => {
      if (!noteIdOrSlug || noteIdOrSlug === 'new') return;

      setLoading(true);

      try {
        const note = await getNoteBySlug(noteIdOrSlug);

        if (note) {
          setId(note.id);
          setSlug(note.slug);
          setTitle(note.title || '');
          setTags(note.tags || []);

          // Fetch pages for this note
          const notePages = await getPages(note.id);

          // Migration: If note has content but no pages, create first page
          if (notePages.length === 0 && note.content && note.content.trim()) {
            const pageId = await createPage(note.id, 0);
            if (pageId) {
              const pageTitle = extractH1Title(note.content);
              await savePage(pageId, { title: pageTitle, content: note.content });
              const updatedPages = await getPages(note.id);
              setPages(updatedPages);
            }
          } else {
            setPages(notePages);
          }

          // Go directly to TOC for existing notes
          setCurrentView('toc');

          if (note.slug && noteIdOrSlug === note.id) {
            router.replace(`/editor/${note.slug}`, { scroll: false });
          }
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteIdOrSlug]);

  // Capture current content before navigation - creates a snapshot
  const captureCurrentState = () => {
    if (currentView === 'cover') {
      previousContentRef.current = (
        <NotebookCover
          title={title}
          onTitleChange={() => {}}
          onOpen={() => {}}
          theme={theme}
        />
      );
    } else if (currentView === 'toc') {
      previousContentRef.current = (
        <TableOfContents
          notebookTitle={title}
          pages={pages}
          onPageClick={() => {}}
          onAddPage={() => {}}
          onDeletePage={() => {}}
          theme={theme}
        />
      );
    } else if (currentView === 'page' && currentPageIndex !== null) {
      previousContentRef.current = (
        <NotebookPage
          content={currentPageContent}
          onChange={() => {}}
          theme={theme}
        />
      );
    }
  };

  // Handle opening the notebook (from cover)
  const handleOpenNotebook = async () => {
    if (!title.trim()) return;

    // Capture current state (cover)
    captureCurrentState();

    // Create the note when opening
    if (!id && isNewNote) {
      try {
        const newId = await createNote();
        if (newId) {
          setId(newId);
          setSaveStatus('saved');

          // Save the title immediately
          await saveNote(newId, { title, content: '', tags: [] });

          // Go to TOC
          setCurrentView('toc');
        }
      } catch (error) {
        setSaveStatus('error');
        return;
      }
    } else {
      setCurrentView('toc');
    }
  };

  // Handle adding a new page
  const handleAddPage = async () => {
    if (!id) return;

    // Capture current state (TOC)
    captureCurrentState();

    try {
      const pageId = await createPage(id);
      if (pageId) {
        const updatedPages = await getPages(id);
        setPages(updatedPages);

        // Navigate to the new page
        const newPageIndex = updatedPages.length - 1;
        setCurrentPageIndex(newPageIndex);
        setCurrentPageContent('');
        setLastSavedContent('');
        setCurrentView('page');
      }
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  // Handle clicking a page in TOC
  const handlePageClick = (pageIndex: number) => {
    const page = pages[pageIndex];
    if (page) {
      // Capture current state (TOC)
      captureCurrentState();

      setCurrentPageIndex(pageIndex);
      setCurrentPageContent(page.content || '');
      setLastSavedContent(page.content || '');
      setCurrentView('page');
    }
  };

  // Handle going back to TOC
  const handleBackToContents = async () => {
    // Capture current state before navigation
    captureCurrentState();

    // Save current page content before going back
    if (currentPageIndex !== null && pages[currentPageIndex]) {
      const page = pages[currentPageIndex];
      if (currentPageContent !== lastSavedContent) {
        try {
          const pageTitle = extractH1Title(currentPageContent);
          await savePage(page.id, { title: pageTitle, content: currentPageContent });

          // Update local pages state
          const updatedPages = [...pages];
          updatedPages[currentPageIndex] = {
            ...updatedPages[currentPageIndex],
            title: pageTitle,
            content: currentPageContent,
          };
          setPages(updatedPages);
        } catch (error) {
          console.error('Error saving page:', error);
        }
      }
    }

    setCurrentView('toc');
    setCurrentPageIndex(null);
  };

  // Handle deleting a page
  const handleDeletePage = async (pageId: string) => {
    if (pages.length <= 1) return; // Keep at least one page

    try {
      await deletePage(pageId);
      const updatedPages = await getPages(id!);
      setPages(updatedPages);
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  // Save current page and navigate to another
  const saveAndNavigate = async (targetIndex: number) => {
    // Capture current state before navigation
    captureCurrentState();

    if (currentPageIndex !== null && pages[currentPageIndex]) {
      const page = pages[currentPageIndex];
      if (currentPageContent !== lastSavedContent) {
        try {
          const pageTitle = extractH1Title(currentPageContent);
          await savePage(page.id, { title: pageTitle, content: currentPageContent });
          const updatedPages = [...pages];
          updatedPages[currentPageIndex] = {
            ...updatedPages[currentPageIndex],
            title: pageTitle,
            content: currentPageContent,
          };
          setPages(updatedPages);
          setLastSavedContent(currentPageContent);
        } catch (error) {
          console.error('Error saving page:', error);
        }
      }
    }

    // Navigate to target page
    const targetPage = pages[targetIndex];
    if (targetPage) {
      setCurrentPageIndex(targetIndex);
      setCurrentPageContent(targetPage.content || '');
      setLastSavedContent(targetPage.content || '');
    }
  };

  // Page navigation handlers - includes TOC as position 0
  const handleNextPage = async () => {
    if (currentView === 'toc') {
      // From TOC, go to first page
      if (pages.length > 0) {
        handlePageClick(0);
      }
    } else if (currentPageIndex !== null && currentPageIndex < pages.length - 1) {
      saveAndNavigate(currentPageIndex + 1);
    }
  };

  const handlePrevPage = async () => {
    if (currentView === 'page' && currentPageIndex === 0) {
      // From first page, go back to TOC
      await handleBackToContents();
    } else if (currentPageIndex !== null && currentPageIndex > 0) {
      saveAndNavigate(currentPageIndex - 1);
    }
  };

  const handleFirstPage = async () => {
    if (currentView === 'page') {
      // Go to TOC (which is the "first" in the sequence)
      await handleBackToContents();
    }
  };

  const handleLastPage = () => {
    if (currentView === 'toc' && pages.length > 0) {
      // From TOC, go to last page
      handlePageClick(pages.length - 1);
    } else if (currentPageIndex !== null && currentPageIndex !== pages.length - 1) {
      saveAndNavigate(pages.length - 1);
    }
  };

  // Add page while viewing pages
  const handleAddPageFromEditor = async () => {
    if (!id) return;

    // Save current page first
    if (currentPageIndex !== null && pages[currentPageIndex]) {
      const page = pages[currentPageIndex];
      if (currentPageContent !== lastSavedContent) {
        try {
          const pageTitle = extractH1Title(currentPageContent);
          await savePage(page.id, { title: pageTitle, content: currentPageContent });
        } catch (error) {
          console.error('Error saving page:', error);
        }
      }
    }

    try {
      const pageId = await createPage(id);
      if (pageId) {
        const updatedPages = await getPages(id);
        setPages(updatedPages);
        const newPageIndex = updatedPages.length - 1;
        setCurrentPageIndex(newPageIndex);
        setCurrentPageContent('');
        setLastSavedContent('');
      }
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  // Auto-save page content
  useEffect(() => {
    if (currentView !== 'page' || currentPageIndex === null || !pages[currentPageIndex]) return;
    if (currentPageContent === lastSavedContent) return;

    setSaveStatus('saving');
    const timeoutId = setTimeout(async () => {
      try {
        const page = pages[currentPageIndex];
        const pageTitle = extractH1Title(currentPageContent);
        await savePage(page.id, { title: pageTitle, content: currentPageContent });

        // Update local pages state
        const updatedPages = [...pages];
        updatedPages[currentPageIndex] = {
          ...updatedPages[currentPageIndex],
          title: pageTitle,
          content: currentPageContent,
        };
        setPages(updatedPages);
        setLastSavedContent(currentPageContent);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [currentPageContent, currentPageIndex, pages, lastSavedContent, savePage, extractH1Title, currentView]);

  // Auto-save note metadata (title, tags)
  useEffect(() => {
    if (!id || !title.trim() || currentView === 'cover') return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveNote(id, { title, content: '', tags });

        const { data: updatedNote } = await supabase
          .from('notes')
          .select('slug')
          .eq('id', id)
          .single();

        if (updatedNote?.slug && updatedNote.slug !== slug) {
          setSlug(updatedNote.slug);
          router.replace(`/editor/${updatedNote.slug}`, { scroll: false });
        }
      } catch {
        // Silent fail for metadata save
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [id, title, tags, saveNote, slug, router, currentView]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setTagInput('');
    }
  };

  // Loading state
  if (loading) {
    const loadingBg = theme === 'dark' ? '#1a1a2e' : '#f9f9f6';
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: loadingBg }}>
        <div className="flex flex-col items-center gap-4">
          <Loading03Icon className="w-10 h-10 text-accent animate-spin" />
          <p style={{ color: theme === 'dark' ? '#b5b5b5' : '#4c4c4c' }}>Loading notebook...</p>
        </div>
      </div>
    );
  }

  const bgColor = theme === 'dark' ? '#1e1e2e' : '#ffffff';
  const bgMuted = theme === 'dark' ? '#1a1a2e' : '#f5f5f0';
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const textColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
  const iconColor = theme === 'dark' ? '#9ca3af' : '#4b5563';

  // Cover component
  const coverComponent = (
    <NotebookCover
      title={title}
      onTitleChange={setTitle}
      onOpen={handleOpenNotebook}
      theme={theme}
    />
  );

  // TOC component
  const tocComponent = (
    <TableOfContents
      notebookTitle={title}
      pages={pages}
      onPageClick={handlePageClick}
      onAddPage={handleAddPage}
      onDeletePage={handleDeletePage}
      theme={theme}
    />
  );

  // Current page component
  const pageComponent =
    currentPageIndex !== null && pages[currentPageIndex] ? (
      <NotebookPage
        content={currentPageContent}
        onChange={setCurrentPageContent}
        theme={theme}
      />
    ) : null;

  // Previous content - just return what was captured
  const getPreviousContentComponent = (): ReactNode => {
    return previousContentRef.current;
  };

  const showHeader = currentView !== 'cover';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Header - visible when not on cover */}
      {showHeader && (
        <header
          className="border-b flex-shrink-0"
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
          }}
        >
          {/* Top row - Title and Actions */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-b"
            style={{ borderColor: borderColor }}
          >
            {/* Back button - to notebooks or to TOC */}
            {currentView === 'page' ? (
              <button
                onClick={handleBackToContents}
                className={`p-1.5 rounded transition-colors flex items-center gap-1.5 ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                title="Back to Contents"
              >
                <Menu01Icon className="w-5 h-5" style={{ color: iconColor }} />
                <span className="text-xs font-medium" style={{ color: textColor }}>Contents</span>
              </button>
            ) : (
              <Link
                href="/notes"
                className={`p-1.5 rounded transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                title="Back to Notebooks"
              >
                <ArrowLeft02Icon className="w-5 h-5" style={{ color: iconColor }} />
              </Link>
            )}

            {/* Notebook icon indicator */}
            <div className={`p-1 rounded ${theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-100/50'}`}>
              <Book02Icon
                className="w-4 h-4"
                style={{ color: theme === 'dark' ? '#d4a574' : '#8b6914' }}
              />
            </div>

            {/* Page indicator when viewing a page */}
            {currentView === 'page' && currentPageIndex !== null && (
              <span className="text-xs font-medium px-2 py-1 rounded" style={{
                color: textColor,
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }}>
                Page {currentPageIndex + 1} of {pages.length}
              </span>
            )}

            {/* Document title */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled notebook"
                className={`w-full text-sm font-normal bg-transparent border-none focus:outline-none focus:ring-0 ${
                  theme === 'dark'
                    ? 'placeholder:text-gray-500 text-gray-100'
                    : 'placeholder:text-gray-400 text-gray-900'
                }`}
                style={{
                  color: theme === 'dark' ? '#f3f3f3' : '#171717',
                }}
              />
            </div>

            {/* Save status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: textColor }}>
                  <Loading03Icon className="w-3.5 h-3.5 animate-spin" style={{ color: textColor }} />
                  <span>Saving...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: textColor }}>
                  <Tick01Icon className="w-3.5 h-3.5" style={{ color: textColor }} />
                  <span>Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs">
                  <AlertCircleIcon className="w-3.5 h-3.5" />
                  <span>Error</span>
                </div>
              )}

              {/* Tags button */}
              <div className="relative">
                {showTagInput ? (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) handleAddTag();
                      setTimeout(() => setShowTagInput(false), 150);
                    }}
                    placeholder="Add tag..."
                    className="w-24 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f3f3f3' : '#171717',
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                      theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    title="Add tags"
                  >
                    <Tag01Icon className="w-4 h-4" style={{ color: iconColor }} />
                    {tags.length > 0 && (
                      <span
                        className={`text-xs px-1.5 rounded ${
                          theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {tags.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Dashboard link */}
              <Link
                href="/dashboard"
                className={`p-1.5 rounded transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                title="Dashboard"
              >
                <Home01Icon className="w-5 h-5" style={{ color: iconColor }} />
              </Link>
            </div>
          </div>

          {/* Tags row (if any) */}
          {tags.length > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-1.5 overflow-x-auto border-b"
              style={{ borderColor: borderColor }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={`rounded p-0.5 transition-colors ${
                      theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-100'
                    }`}
                  >
                    <Cancel01Icon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </header>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex" style={{ backgroundColor: bgMuted }}>
        {/* Main notebook area */}
        <div className="flex-1 overflow-auto py-8 px-4">
          <div
            className="max-w-4xl mx-auto relative"
            style={{
              height: currentView === 'cover' ? 'calc(100vh - 64px)' : 'calc(100vh - 140px)',
              minHeight: '500px',
            }}
          >
            {/* Stacked pages effect (only when viewing pages) */}
            {currentView === 'page' && pages.length > 1 && (
              <>
                {/* Page stack layers */}
                {[...Array(Math.min(pages.length - 1, 4))].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-lg"
                    style={{
                      top: `${(i + 1) * 3}px`,
                      right: `${-(i + 1) * 3}px`,
                      bottom: `${-(i + 1) * 3}px`,
                      left: `${(i + 1) * 3}px`,
                      background: theme === 'dark'
                        ? `linear-gradient(135deg, ${i % 2 === 0 ? '#2a2a3a' : '#252535'} 0%, ${i % 2 === 0 ? '#1e1e2e' : '#1a1a2a'} 100%)`
                        : `linear-gradient(135deg, ${i % 2 === 0 ? '#f8f8f3' : '#f5f5f0'} 0%, ${i % 2 === 0 ? '#f0f0eb' : '#eaeae5'} 100%)`,
                      boxShadow: `0 ${2 + i}px ${4 + i * 2}px rgba(0,0,0,${theme === 'dark' ? 0.3 - i * 0.05 : 0.1 - i * 0.02})`,
                      zIndex: -i - 1,
                    }}
                  />
                ))}
              </>
            )}

            {/* Main notebook */}
            <div className="relative h-full rounded-lg shadow-xl">
              <PageFlipContainer
                currentView={currentView}
                currentPageIndex={currentPageIndex}
                totalPages={pages.length}
                cover={coverComponent}
                toc={tocComponent}
                pageContent={pageComponent}
                previousContent={getPreviousContentComponent()}
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Right side control panel (visible on TOC and pages) */}
        {(currentView === 'toc' || currentView === 'page') && (
          <div
            className="w-16 flex-shrink-0 flex flex-col items-center py-8 gap-2"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
              borderLeft: `1px solid ${borderColor}`,
            }}
          >
            {/* Current position indicator */}
            <div
              className={`w-10 px-1 py-2 rounded-lg flex flex-col items-center justify-center text-xs font-medium ${
                theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {currentView === 'toc' ? (
                <>
                  <Menu01Icon className="w-4 h-4 mb-1" />
                  <span className="text-[10px]">TOC</span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-handwritten)' }}>
                    {(currentPageIndex ?? 0) + 1}
                  </span>
                  <span className="opacity-60">of {pages.length}</span>
                </>
              )}
            </div>

            <div className="h-2" />

            {/* First / TOC */}
            <button
              onClick={handleFirstPage}
              disabled={currentView === 'toc'}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                currentView === 'toc'
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
              title="Back to Contents"
            >
              <ArrowDownLeft01Icon className="w-5 h-5" />
            </button>

            {/* Previous page */}
            <button
              onClick={handlePrevPage}
              disabled={currentView === 'toc'}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                currentView === 'toc'
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
              title={currentView === 'page' && currentPageIndex === 0 ? 'Back to Contents' : 'Previous page'}
            >
              <ArrowLeft01Icon className="w-5 h-5" />
            </button>

            {/* Next page */}
            <button
              onClick={handleNextPage}
              disabled={currentView === 'page' && currentPageIndex === pages.length - 1}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                currentView === 'page' && currentPageIndex === pages.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
              title={currentView === 'toc' ? 'Go to first page' : 'Next page'}
            >
              <ArrowRight01Icon className="w-5 h-5" />
            </button>

            {/* Last page */}
            <button
              onClick={handleLastPage}
              disabled={currentView === 'page' && currentPageIndex === pages.length - 1}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                currentView === 'page' && currentPageIndex === pages.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
              title="Last page"
            >
              <ArrowUpRight01Icon className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            {/* Add new page */}
            <button
              onClick={handleAddPageFromEditor}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 shadow-sm'
              }`}
              title="Add new page"
            >
              <Add01Icon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
