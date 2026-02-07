'use client';

import { useRef, useState, useEffect, useCallback, RefObject } from 'react';

/** Canonical notebook page dimensions (in px) */
export const NOTEBOOK_WIDTH = 896;   // 56rem
export const NOTEBOOK_HEIGHT = 1144; // 35 lines × 32px + 24px offset

/**
 * Measures the available space inside `containerRef` and returns a scale factor
 * that fits the canonical notebook size (896 × 1144) within that space.
 *
 * The scale is capped at 1 so the notebook never grows beyond its natural size.
 */
export function useNotebookScale(containerRef: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);

  const recalc = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const availableWidth = el.clientWidth;
    const availableHeight = el.clientHeight;

    const s = Math.min(
      availableWidth / NOTEBOOK_WIDTH,
      availableHeight / NOTEBOOK_HEIGHT,
      1, // never scale up
    );

    setScale(s);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial measurement
    recalc();

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);

    return () => ro.disconnect();
  }, [containerRef, recalc]);

  return scale;
}
