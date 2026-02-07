'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { DOMSerializer } from '@tiptap/pm/model';

// ============================================
// Auto Page Break Hook
// ============================================
// Monitors the TipTap editor for content overflow.
// When the content exceeds the visible notebook page,
// it splits the document at a clean top-level node boundary
// and emits the overflow HTML so the parent can create a new page.

interface UseAutoPageBreakOptions {
  /** The TipTap editor instance */
  editor: Editor | null;
  /** Whether auto-pagination is enabled (only on page view) */
  enabled: boolean;
  /** Called when overflow is detected. Receives the overflow HTML and the trimmed current-page HTML. */
  onOverflow: (overflowHTML: string, trimmedHTML: string) => void;
}

export function useAutoPageBreak({
  editor,
  enabled,
  onOverflow,
}: UseAutoPageBreakOptions) {
  const isProcessingRef = useRef(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkOverflow = useCallback(() => {
    if (!editor || editor.isDestroyed || isProcessingRef.current || !enabled) return;

    const proseDom = editor.view.dom;

    // The wrapper is the scroll container (.tiptap-editor-wrapper)
    // It has a fixed height equal to the notebook page and overflow:hidden
    const wrapper = proseDom.closest('.tiptap-editor-wrapper') as HTMLElement | null;
    if (!wrapper) return;

    const availableHeight = wrapper.clientHeight;

    // Check if ProseMirror content actually overflows the wrapper.
    // scrollHeight includes all content even when clipped by overflow:hidden.
    if (wrapper.scrollHeight <= availableHeight + 4) return; // 4px buffer for rounding

    // Get the editor's JSON document
    const json = editor.getJSON();
    const nodes = json.content || [];

    // Need at least 2 top-level nodes to split (keep at least 1 on current page)
    if (nodes.length <= 1) return;

    // Walk ProseMirror's direct children (top-level block nodes) to find
    // the first node whose bottom extends past the visible page area.
    // offsetTop/offsetHeight are in CSS pixels (unaffected by CSS transform: scale).
    const children = Array.from(proseDom.children) as HTMLElement[];
    let splitIndex = nodes.length;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childBottom = child.offsetTop + child.offsetHeight;

      if (childBottom > availableHeight) {
        // This node overflows — split BEFORE it (keep at least 1 node)
        splitIndex = Math.max(1, i);
        break;
      }
    }

    // If everything fits after all, bail
    if (splitIndex >= nodes.length) return;

    // ── Prevent re-entrancy ──
    isProcessingRef.current = true;

    try {
      const keepNodes = nodes.slice(0, splitIndex);
      const overflowNodes = nodes.slice(splitIndex);

      if (overflowNodes.length === 0) return;

      // ── Serialize overflow nodes to HTML ──
      // Use ProseMirror's DOMSerializer so we don't touch the live editor.
      const schema = editor.schema;
      const serializer = DOMSerializer.fromSchema(schema);
      const overflowDoc = schema.nodeFromJSON({ type: 'doc', content: overflowNodes });
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(serializer.serializeFragment(overflowDoc.content));
      const overflowHTML = tempDiv.innerHTML;

      // ── Trim the current editor to only the fitting content ──
      // Using setContent with emitUpdate:false to avoid triggering
      // another overflow check while we're still processing.
      editor.commands.setContent({ type: 'doc', content: keepNodes }, { emitUpdate: false });
      const trimmedHTML = editor.getHTML();

      // ── Notify parent ──
      onOverflow(overflowHTML, trimmedHTML);
    } finally {
      // Allow re-processing after a cooldown so state can settle
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 800);
    }
  }, [editor, enabled, onOverflow]);

  // ── Listen for editor updates and check overflow (debounced) ──
  useEffect(() => {
    if (!editor || !enabled) return;

    const handler = () => {
      // Clear any pending check
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);

      // Short debounce — fast enough to feel instant, but avoids
      // checking on every keystroke during rapid typing.
      checkTimeoutRef.current = setTimeout(() => {
        // Use requestAnimationFrame to ensure DOM measurements
        // are taken after the browser has laid out the new content.
        requestAnimationFrame(checkOverflow);
      }, 250);
    };

    editor.on('update', handler);

    // Also run an initial check (e.g., after AI inserts a large block)
    requestAnimationFrame(checkOverflow);

    return () => {
      editor.off('update', handler);
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [editor, enabled, checkOverflow]);
}
