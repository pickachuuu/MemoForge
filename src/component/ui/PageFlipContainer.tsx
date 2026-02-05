'use client';

import { motion } from 'motion/react';
import { ReactNode, useRef, useLayoutEffect, useState, useCallback } from 'react';

export type ViewType = 'cover' | 'toc' | 'page';

interface PageFlipContainerProps {
  currentView: ViewType;
  currentPageIndex: number | null;
  totalPages: number;
  cover: ReactNode;
  toc: ReactNode;
  pageContent: ReactNode;
  previousContent?: ReactNode;
  theme?: 'light' | 'dark';
}

export default function PageFlipContainer({
  currentView,
  currentPageIndex,
  totalPages,
  cover,
  toc,
  pageContent,
  previousContent,
  theme = 'light',
}: PageFlipContainerProps) {
  const isDark = theme === 'dark';

  const getPosition = (view: ViewType, pageIdx: number | null): number => {
    if (view === 'cover') return 0;
    if (view === 'toc') return 1;
    return 2 + (pageIdx ?? 0);
  };

  const currentPosition = getPosition(currentView, currentPageIndex);
  const prevPositionRef = useRef(currentPosition);
  const animIdRef = useRef(0);

  // Store what to display - this is the KEY to preventing jitter
  const [displayState, setDisplayState] = useState<{
    baseContent: ReactNode;
    flip: {
      id: number;
      direction: 'forward' | 'backward';
      frontContent: ReactNode;
      targetContent: ReactNode; // Content to show after animation completes
    } | null;
  }>({
    baseContent: currentView === 'cover' ? cover : currentView === 'toc' ? toc : pageContent,
    flip: null,
  });

  const getCurrentContent = () => {
    if (currentView === 'cover') return cover;
    if (currentView === 'toc') return toc;
    return pageContent;
  };

  // Handle animation complete - update base and clear flip atomically
  const handleAnimationComplete = useCallback(() => {
    setDisplayState(prev => {
      if (!prev.flip) return prev;
      return {
        baseContent: prev.flip.targetContent,
        flip: null,
      };
    });
  }, []);

  // useLayoutEffect runs BEFORE browser paint - prevents visual jitter
  useLayoutEffect(() => {
    if (currentPosition !== prevPositionRef.current) {
      // Position changed - trigger flip animation
      const dir = currentPosition > prevPositionRef.current ? 'forward' : 'backward';
      animIdRef.current++;

      const newContent = getCurrentContent();
      const oldContent = previousContent;

      // Set everything in ONE state update - no intermediate renders
      // Forward: base shows NEW (revealed underneath), flip front shows OLD (turning away)
      // Backward: base shows OLD (stays visible), flip front shows NEW (coming back)
      //           When animation completes, base switches to NEW (covered by flip at that moment)
      setDisplayState({
        baseContent: dir === 'forward' ? newContent : oldContent,
        flip: {
          id: animIdRef.current,
          direction: dir,
          // Forward: front shows OLD (turning away)
          // Backward: front shows NEW (coming back)
          frontContent: dir === 'forward' ? oldContent : newContent,
          // Store target content for when animation completes
          targetContent: newContent,
        },
      });

      prevPositionRef.current = currentPosition;
    } else if (!displayState.flip) {
      // No position change and no animation in progress - update base content directly
      // This ensures typing in the cover title or editing page content updates immediately
      const currentContent = getCurrentContent();
      setDisplayState(prev => ({
        ...prev,
        baseContent: currentContent,
      }));
    }
  }, [currentPosition, previousContent, cover, toc, pageContent, currentView]);

  // Colors
  const paperColor = isDark ? '#1e1e2e' : '#fffef8';
  const paperBg = isDark
    ? 'linear-gradient(135deg, #2a2a3a 0%, #1e1e2e 100%)'
    : 'linear-gradient(135deg, #fffef8 0%, #f5f5f0 100%)';
  const lineColor = isDark ? 'rgba(157,123,224,0.1)' : 'rgba(95,108,175,0.08)';
  const marginColor = isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)';

  const leftCount = Math.min(currentPosition > 0 ? currentPosition : 0, 5);
  const rightCount = Math.min(Math.max(0, 2 + totalPages - currentPosition - 1), 4);

  const BlankPaper = () => (
    <div className="absolute inset-0 rounded-lg" style={{ background: paperBg }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${lineColor} 31px, ${lineColor} 32px)`,
        backgroundSize: '100% 32px',
        backgroundPosition: '0 24px',
      }} />
      <div className="absolute top-0 bottom-0 w-px" style={{ left: 48, backgroundColor: marginColor }} />
      <div className="absolute left-3 top-1/4 w-3 h-3 rounded-full"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }} />
      <div className="absolute left-3 top-1/2 w-3 h-3 rounded-full -translate-y-1/2"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }} />
      <div className="absolute left-3 top-3/4 w-3 h-3 rounded-full"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }} />
    </div>
  );

  return (
    <div className="w-full h-full relative" style={{ perspective: '2000px' }}>
      {/* Left stack */}
      {leftCount > 0 && [...Array(leftCount)].map((_, i) => (
        <div
          key={`l${i}`}
          className="absolute inset-0 rounded-lg"
          style={{
            transform: 'rotateY(-180deg)',
            transformOrigin: 'left center',
            left: i * 2,
            top: i,
            background: paperBg,
            zIndex: i,
          }}
        />
      ))}

      {/* Right stack */}
      {rightCount > 0 && [...Array(rightCount)].map((_, i) => (
        <div
          key={`r${i}`}
          className="absolute inset-0 rounded-lg"
          style={{
            top: (i + 1) * 2,
            left: (i + 1) * 2,
            background: paperBg,
            zIndex: -(i + 1),
          }}
        />
      ))}

      {/* Base layer - content controlled by displayState */}
      {/* Note: overflow-visible when on cover to allow color picker dropdown to show */}
      <div
        className={`absolute inset-0 rounded-lg ${currentView === 'cover' ? 'overflow-visible' : 'overflow-hidden'}`}
        style={{ zIndex: 10, backgroundColor: currentView === 'cover' ? 'transparent' : paperColor }}
      >
        {displayState.baseContent}
      </div>

      {/* Flipping page */}
      {displayState.flip && (
        <motion.div
          key={displayState.flip.id}
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            zIndex: 20,
          }}
          initial={{ rotateY: displayState.flip.direction === 'forward' ? 0 : -180 }}
          animate={{ rotateY: displayState.flip.direction === 'forward' ? -180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleAnimationComplete}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              backgroundColor: paperColor,
            }}
          >
            {displayState.flip.frontContent}
          </div>

          {/* Back - blank paper */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: paperColor,
            }}
          >
            <BlankPaper />
          </div>
        </motion.div>
      )}

      {/* Spine */}
      {currentView !== 'cover' && (
        <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-l" style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(50,50,60,0.9), rgba(40,40,50,0.5))'
            : 'linear-gradient(90deg, rgba(180,160,140,0.9), rgba(200,180,160,0.5))',
          zIndex: 25,
        }} />
      )}
    </div>
  );
}
