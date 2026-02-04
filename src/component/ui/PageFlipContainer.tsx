'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, useState, useEffect } from 'react';

export type ViewType = 'cover' | 'toc' | 'page';

interface PageFlipContainerProps {
  currentView: ViewType;
  currentPageIndex: number | null;
  totalPages: number;
  cover: ReactNode;
  toc: ReactNode;
  pageContent: ReactNode;
  theme?: 'light' | 'dark';
  onAnimationComplete?: () => void;
}

/**
 * PageFlipContainer - Manages 3D flip animations with stacked pages
 * TOC and all pages are flippable, creating a realistic book feel
 */
export default function PageFlipContainer({
  currentView,
  currentPageIndex,
  totalPages,
  cover,
  toc,
  pageContent,
  theme = 'light',
  onAnimationComplete,
}: PageFlipContainerProps) {
  // Track animation state
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');
  const [flipKey, setFlipKey] = useState(0);

  // Track previous position for comparison
  const [prevPosition, setPrevPosition] = useState(() => getPosition(currentView, currentPageIndex));

  const isDark = theme === 'dark';

  // Convert view + page index to a single position number
  // Cover = 0, TOC = 1, Page 0 = 2, Page 1 = 3, etc.
  function getPosition(view: ViewType, pageIdx: number | null): number {
    if (view === 'cover') return 0;
    if (view === 'toc') return 1;
    return 2 + (pageIdx ?? 0);
  }

  const currentPosition = getPosition(currentView, currentPageIndex);

  // Detect navigation and trigger animation
  useEffect(() => {
    if (currentPosition !== prevPosition) {
      const direction = currentPosition > prevPosition ? 'forward' : 'backward';
      setFlipDirection(direction);
      setIsFlipping(true);
      setFlipKey(k => k + 1);
      setPrevPosition(currentPosition);
    }
  }, [currentPosition, prevPosition]);

  const handleAnimationComplete = () => {
    setIsFlipping(false);
    onAnimationComplete?.();
  };

  // Calculate stack counts
  // Left stack = pages that have been flipped (position - 1, since cover doesn't stack)
  const leftStackCount = currentPosition > 0 ? currentPosition : 0;

  // Right stack = remaining pages
  // Total positions = 1 (cover) + 1 (toc) + totalPages
  const totalPositions = 2 + totalPages;
  const rightStackCount = totalPositions - currentPosition - 1;

  // Flip transition
  const flipTransition = {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  };

  // Paper colors
  const paperColor = isDark ? '#1e1e2e' : '#fffef8';
  const paperColorAlt = isDark ? '#1a1a2a' : '#f5f5f0';

  const paperBg = isDark
    ? 'linear-gradient(135deg, #2a2a3a 0%, #1e1e2e 100%)'
    : 'linear-gradient(135deg, #fffef8 0%, #f5f5f0 100%)';

  const paperBgAlt = isDark
    ? 'linear-gradient(135deg, #252535 0%, #1a1a2a 100%)'
    : 'linear-gradient(135deg, #f5f5f0 0%, #eaeae5 100%)';

  const lineColor = isDark ? 'rgba(157, 123, 224, 0.1)' : 'rgba(95, 108, 175, 0.08)';

  // Render left stack (flipped pages)
  const renderLeftStack = () => {
    if (leftStackCount <= 0) return null;
    const stackLayers = Math.min(leftStackCount, 5);

    return (
      <>
        {[...Array(stackLayers)].map((_, i) => {
          const reverseIndex = stackLayers - 1 - i;
          const offset = reverseIndex * 2;

          return (
            <div
              key={`left-${i}`}
              className="absolute rounded-lg pointer-events-none"
              style={{
                top: `${offset}px`,
                left: `${offset}px`,
                right: `${-offset + 6}px`,
                bottom: `${offset}px`,
                backgroundColor: i % 2 === 0 ? paperColor : paperColorAlt,
                background: i % 2 === 0 ? paperBg : paperBgAlt,
                boxShadow: isDark
                  ? `inset -2px 0 4px rgba(0,0,0,0.3)`
                  : `inset -2px 0 4px rgba(0,0,0,0.05)`,
                zIndex: i,
                transform: 'rotateY(-180deg)',
                transformOrigin: 'left center',
              }}
            >
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${lineColor} 31px, ${lineColor} 32px)`,
                  backgroundSize: '100% 32px',
                  backgroundPosition: '0 24px',
                }}
              />
            </div>
          );
        })}
      </>
    );
  };

  // Render right stack (unread pages)
  const renderRightStack = () => {
    if (rightStackCount <= 0) return null;
    const stackLayers = Math.min(rightStackCount, 4);

    return (
      <>
        {[...Array(stackLayers)].map((_, i) => {
          const offset = (i + 1) * 2;

          return (
            <div
              key={`right-${i}`}
              className="absolute rounded-lg pointer-events-none"
              style={{
                top: `${offset}px`,
                left: `${offset}px`,
                right: `${-offset}px`,
                bottom: `${-offset}px`,
                backgroundColor: i % 2 === 0 ? paperColorAlt : paperColor,
                background: i % 2 === 0 ? paperBgAlt : paperBg,
                boxShadow: isDark
                  ? `0 ${2 + i}px ${4 + i * 2}px rgba(0,0,0,0.2)`
                  : `0 ${2 + i}px ${4 + i * 2}px rgba(0,0,0,0.08)`,
                zIndex: -(i + 1),
              }}
            />
          );
        })}
      </>
    );
  };

  // Solid paper component for flipping
  const SolidPaper = () => (
    <div
      className="absolute inset-0 rounded-lg"
      style={{
        backgroundColor: paperColor,
        background: paperBg,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${lineColor} 31px, ${lineColor} 32px)`,
          backgroundSize: '100% 32px',
          backgroundPosition: '0 24px',
        }}
      />
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: isDark
            ? 'inset 0 0 20px rgba(0,0,0,0.15)'
            : 'inset 0 0 20px rgba(0,0,0,0.02)',
        }}
      />
    </div>
  );

  return (
    <div
      className="page-flip-container w-full h-full relative"
      style={{
        perspective: '2500px',
        perspectiveOrigin: 'center center',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Left stack (flipped pages) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {renderLeftStack()}
      </div>

      {/* Right stack (unread pages) */}
      {renderRightStack()}

      {/* Current content */}
      <div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          zIndex: 5,
          backgroundColor: paperColor,
        }}
      >
        {currentView === 'cover' && cover}
        {currentView === 'toc' && toc}
        {currentView === 'page' && pageContent}
      </div>

      {/* Flipping page animation */}
      <AnimatePresence onExitComplete={handleAnimationComplete}>
        {isFlipping && (
          <motion.div
            key={flipKey}
            className="absolute inset-0 rounded-lg"
            initial={{ rotateY: flipDirection === 'forward' ? 0 : -180 }}
            animate={{ rotateY: flipDirection === 'forward' ? -180 : 0 }}
            exit={{ opacity: 0 }}
            transition={flipTransition}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
              zIndex: 20,
            }}
          >
            {/* Front face */}
            <div
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              <SolidPaper />
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <SolidPaper />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spine edge */}
      {currentView !== 'cover' && (
        <div
          className="absolute left-0 top-2 bottom-2 w-1.5 rounded-l pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, rgba(50,50,60,0.9) 0%, rgba(40,40,50,0.5) 100%)'
              : 'linear-gradient(90deg, rgba(180,160,140,0.9) 0%, rgba(200,180,160,0.5) 100%)',
            zIndex: 25,
          }}
        />
      )}
    </div>
  );
}
