'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useState } from 'react';
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  ListViewIcon,
  LeftToRightListNumberIcon,
  QuoteDownIcon,
  SourceCodeIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  PaintBrush04Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  MinusSignIcon,
  Sun01Icon,
  Moon01Icon,
} from 'hugeicons-react';

// ============================================
// Toolbar Button Component
// ============================================
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 rounded-xl transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        ${isActive
          ? 'clay-button-secondary'
          : 'clay-button-ghost'
        }
      `}
    >
      {children}
    </button>
  );
}

// ============================================
// Toolbar Divider
// ============================================
function ToolbarDivider() {
  return <div className="w-px h-6 bg-border/50 mx-0.5" />;
}

// ============================================
// Editor Toolbar
// ============================================
interface EditorToolbarProps {
  editor: Editor | null;
  fullscreen?: boolean;
}

function EditorToolbar({ editor, fullscreen }: EditorToolbarProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Once mounted on client, get the theme
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
    }
  }, []);

  // Apply theme and persist
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }, [theme, mounted]);

  // Listen for theme changes from other parts of the app
  useEffect(() => {
    if (!mounted) return;
    const handleThemeChange = () => {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener("storage", handleThemeChange);
    // Listen for custom theme change events
    window.addEventListener("themechange", handleThemeChange as EventListener);

    // Also check periodically for changes
    const interval = setInterval(() => {
      const stored = localStorage.getItem("theme");
      const isDark = document.documentElement.classList.contains("dark");
      if (stored === "light" && isDark) {
        setTheme("light");
      } else if (stored === "dark" && !isDark) {
        setTheme("dark");
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("themechange", handleThemeChange as EventListener);
      clearInterval(interval);
    };
  }, [mounted]);

  // Listen for system theme changes if user hasn't set a preference
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mounted]);

  if (!editor) return null;

  return (
    <div className={`
      clay-toolbar
      flex flex-wrap items-center gap-0.5 px-3 py-2
      ${fullscreen ? 'justify-start' : 'justify-center'}
    `}>
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <ArrowTurnBackwardIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <ArrowTurnForwardIcon className="w-5 h-5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <TextBoldIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <TextItalicIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <TextUnderlineIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <TextStrikethroughIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <PaintBrush04Icon className="w-5 h-5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading01Icon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading02Icon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading03Icon className="w-5 h-5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <ListViewIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <LeftToRightListNumberIcon className="w-5 h-5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <QuoteDownIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <SourceCodeIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <MinusSignIcon className="w-5 h-5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <TextAlignLeftIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <TextAlignCenterIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <TextAlignRightIcon className="w-5 h-5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Theme Toggle */}
      {mounted && (
        <ToolbarButton
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Sun01Icon className="w-5 h-5" />
          ) : (
            <Moon01Icon className="w-5 h-5" />
          )}
        </ToolbarButton>
      )}
    </div>
  );
}

// ============================================
// Main Rich Text Editor Component
// ============================================
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  autoFocus?: boolean;
  fullscreen?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  editorClassName = '',
  autoFocus = false,
  fullscreen = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: `tiptap-editor prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none prose-headings:mt-6 prose-headings:mb-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 ${editorClassName}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content when prop changes (e.g., loading a note)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Keyboard shortcut for underline (not included by default)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        editor?.chain().focus().toggleUnderline().run();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme
  useEffect(() => {
    setMounted(true);
    const getTheme = (): "light" | "dark" => {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    setTheme(getTheme());

    const handleThemeChange = () => {
      const newTheme = getTheme();
      setTheme(newTheme);
    };

    const handleCustomThemeChange = (e: CustomEvent) => {
      const newTheme = (e.detail as { theme: string }).theme as "light" | "dark";
      if (newTheme === "light" || newTheme === "dark") {
        setTheme(newTheme);
      }
    };

    window.addEventListener("themechange", handleCustomThemeChange as EventListener);
    window.addEventListener("storage", handleThemeChange);

    const interval = setInterval(() => {
      const currentTheme = getTheme();
      const isDark = document.documentElement.classList.contains("dark");
      if ((currentTheme === "dark" && !isDark) || (currentTheme === "light" && isDark)) {
        handleThemeChange();
      }
    }, 100);

    return () => {
      window.removeEventListener("themechange", handleCustomThemeChange as EventListener);
      window.removeEventListener("storage", handleThemeChange);
      clearInterval(interval);
    };
  }, []);

  if (fullscreen) {
    const editorBg = theme === 'dark' ? '#1e1e2e' : '#fffef8';
    const textColor = theme === 'dark' ? '#e8eaed' : '#202124';
    const lineColor = theme === 'dark' ? 'rgba(157, 123, 224, 0.15)' : 'rgba(95, 108, 175, 0.12)';
    const marginColor = theme === 'dark' ? 'rgba(180, 100, 100, 0.2)' : 'rgba(220, 80, 80, 0.25)';

    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Sticky Toolbar */}
        <EditorToolbar editor={editor} fullscreen />

        {/* Document Area - Notebook style */}
        <div
          className="flex-1 overflow-auto"
          style={{ backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f5f0' }}
        >
          <div
            className="max-w-4xl mx-auto my-8 rounded-lg shadow-lg relative overflow-hidden"
            style={{
              backgroundColor: editorBg,
              minHeight: 'calc(100vh - 200px)',
            }}
          >
            {/* Notebook lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 31px,
                  ${lineColor} 31px,
                  ${lineColor} 32px
                )`,
                backgroundSize: '100% 32px',
                backgroundPosition: '0 24px',
              }}
            />

            {/* Red margin line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
              style={{
                left: '72px',
                background: `linear-gradient(180deg, transparent 0%, ${marginColor} 5%, ${marginColor} 95%, transparent 100%)`,
              }}
            />

            {/* Hole punches */}
            <div className="absolute left-4 top-0 bottom-0 w-4 pointer-events-none">
              {[80, 200, 320, 440, 560, 680].map((top) => (
                <div
                  key={top}
                  className="absolute rounded-full"
                  style={{
                    top: `${top}px`,
                    left: '4px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f5f0',
                    boxShadow: `inset 2px 2px 4px ${theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                />
              ))}
            </div>

            {/* Content area */}
            <div
              className="relative z-10 pl-24 pr-12 py-8"
              style={{
                color: textColor,
                lineHeight: '32px',
              }}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular (non-fullscreen) mode
  return (
    <div className={`rich-text-editor-container ${className}`}>
      <EditorToolbar editor={editor} />
      <div className="tiptap-editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditor;
