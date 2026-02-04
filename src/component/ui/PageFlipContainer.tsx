'use client';

import { motion } from 'motion/react';
import { ReactNode, useRef, useEffect, useState } from 'react';

export type ViewType = 'cover' | 'toc' | 'page';

interface PageFlipContainerProps {
  currentView: ViewType;
  currentPageIndex: number | null;
  totalPages: number;
  cover: ReactNode;
  toc: ReactNode;
  pageContent: ReactNode;
  theme?: 'light' | 'dark';
}

/**
 * PageFlipContainer - Manages 3D flip animations with stacked pages
 */
export default function PageFlipContainer({
  currentView,
  currentPageIndex,
  totalPages,
  cover,
  toc,
  pageContent,
  theme = 'light',
}: PageFlipContainerProps) {
  const isDark = theme === 'dark';

  // Convert view + page index to position: Cover=0, TOC=1, Pages start at 2
  const getPosition = (view: ViewType, pageIdx: number | null): number => {
    if (view === 'cover') return 0;
    if (view === 'toc') return 1;
    return 2 + (pageIdx ?? 0);
  };

  const currentPosition = getPosition(currentView, currentPageIndex);

  // Track position changes with refs to avoid state timing issues
  const prevPositionRef = useRef<number | null>(null);
  const animationCounterRef = useRef(0);

  // Animation state
  const [activeFlip, setActiveFlip] = useState<{
    id: number;
    direction: 'forward' | 'backward';
  } | null>(null);

  // Detect position changes
  useEffect(() => {
    // On first render, just store the position
    if (prevPositionRef.current === null) {
      prevPositionRef.current = currentPosition;
      return;
    }

    // Check if position actually changed
    if (currentPosition !== prevPositionRef.current) {
      const direction = currentPosition > prevPositionRef.current ? 'forward' : 'backward';
      animationCounterRef.current += 1;

      setActiveFlip({
        id: animationCounterRef.current,
        direction,
      });

      prevPositionRef.current = currentPosition;
    }
  }, [currentPosition]);

  // Clear animation after it completes
  useEffect(() => {
    if (activeFlip) {
      const timer = setTimeout(() => {
        setActiveFlip(null);
      }, 550); // Slightly longer than animation duration
      return () => clearTimeout(timer);
    }
  }, [activeFlip]);

  // Calculate stacks
  const leftStackCount = currentPosition > 0 ? currentPosition : 0;
  const totalPositions = 2 + totalPages;
  const rightStackCount = Math.max(0, totalPositions - currentPosition - 1);

  // Paper styles
  const paperColor = isDark ? '#1e1e2e' : '#fffef8';
  const paperColorAlt = isDark ? '#1a1a2a' : '#f5f5f0';
  const paperBg = isDark
    ? 'linear-gradient(135deg, #2a2a3a 0%, #1e1e2e 100%)'
    : 'linear-gradient(135deg, #fffef8 0%, #f5f5f0 100%)';
  const paperBgAlt = isDark
    ? 'linear-gradient(135deg, #252535 0%, #1a1a2a 100%)'
    : 'linear-gradient(135deg, #f5f5f0 0%, #eaeae5 100%)';
  const lineColor = isDark ? 'rgba(157, 123, 224, 0.1)' : 'rgba(95, 108, 175, 0.08)';

  // Left stack (flipped pages)
  const renderLeftStack = () => {
    if (leftStackCount <= 0) return null;
    const layers = Math.min(leftStackCount, 5);

    return [...Array(layers)].map((_, i) => {
      const ri = layers - 1 - i;
      const offset = ri * 2;
      return (
        <div
          key={`l${i}`}
          className="absolute rounded-lg"
          style={{
            top: offset, left: offset, right: -offset + 6, bottom: offset,
            background: i % 2 === 0 ? paperBg : paperBgAlt,
            boxShadow: isDark ? 'inset -2px 0 4px rgba(0,0,0,0.3)' : 'inset -2px 0 4px rgba(0,0,0,0.05)',
            zIndex: i,
            transform: 'rotateY(-180deg)',
            transformOrigin: 'left center',
          }}
        >
          <div className="absolute inset-0 rounded-lg" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${lineColor} 31px, ${lineColor} 32px)`,
            backgroundSize: '100% 32px', backgroundPosition: '0 24px',
          }} />
        </div>
      );
    });
  };

  // Right stack (unread pages)
  const renderRightStack = () => {
    if (rightStackCount <= 0) return null;
    const layers = Math.min(rightStackCount, 4);

    return [...Array(layers)].map((_, i) => {
      const offset = (i + 1) * 2;
      return (
        <div
          key={`r${i}`}
          className="absolute rounded-lg"
          style={{
            top: offset, left: offset, right: -offset, bottom: -offset,
            background: i % 2 === 0 ? paperBgAlt : paperBg,
            boxShadow: isDark ? `0 ${2+i}px ${4+i*2}px rgba(0,0,0,0.2)` : `0 ${2+i}px ${4+i*2}px rgba(0,0,0,0.08)`,
            zIndex: -(i + 1),
          }}
        />
      );
    });
  };

  return (
    <div className="w-full h-full relative" style={{ perspective: '2500px', transformStyle: 'preserve-3d' }}>
      {/* Left stack */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {renderLeftStack()}
      </div>

      {/* Right stack */}
      {renderRightStack()}

      {/* Current content */}
      <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ zIndex: 5, backgroundColor: paperColor }}>
        {currentView === 'cover' && cover}
        {currentView === 'toc' && toc}
        {currentView === 'page' && pageContent}
      </div>

      {/* Flip animation */}
      {activeFlip && (
        <motion.div
          key={activeFlip.id}
          className="absolute inset-0 rounded-lg"
          initial={{ rotateY: activeFlip.direction === 'forward' ? 0 : -180 }}
          animate={{ rotateY: activeFlip.direction === 'forward' ? -180 : 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center', zIndex: 20 }}
        >
          <div className="absolute inset-0 rounded-lg" style={{ backfaceVisibility: 'hidden', background: paperBg }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${lineColor} 31px, ${lineColor} 32px)`,
              backgroundSize: '100% 32px', backgroundPosition: '0 24px',
            }} />
          </div>
          <div className="absolute inset-0 rounded-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: paperBg }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${lineColor} 31px, ${lineColor} 32px)`,
              backgroundSize: '100% 32px', backgroundPosition: '0 24px',
            }} />
          </div>
        </motion.div>
      )}

      {/* Spine */}
      {currentView !== 'cover' && (
        <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-l" style={{
          background: isDark ? 'linear-gradient(90deg, rgba(50,50,60,0.9), rgba(40,40,50,0.5))' : 'linear-gradient(90deg, rgba(180,160,140,0.9), rgba(200,180,160,0.5))',
          zIndex: 25,
        }} />
      )}
    </div>
  );
}
