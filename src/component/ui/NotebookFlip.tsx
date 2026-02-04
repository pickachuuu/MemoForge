'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface NotebookFlipProps {
  isOpen: boolean;
  cover: ReactNode;
  pages: ReactNode;
  theme?: 'light' | 'dark';
}

/**
 * NotebookFlip - A 3D flip animation wrapper that creates a realistic
 * book opening effect. Designed to work within a paper-sized container.
 */
export default function NotebookFlip({ isOpen, cover, pages, theme = 'light' }: NotebookFlipProps) {
  return (
    <div
      className="notebook-flip-container w-full h-full relative"
      style={{
        perspective: '2500px',
        perspectiveOrigin: 'center center',
      }}
    >
      {/* Pages (always visible as the base layer) */}
      <div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          backfaceVisibility: 'hidden',
        }}
      >
        {pages}
      </div>

      {/* Cover (flips away to reveal pages) */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-lg overflow-hidden"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{
              rotateY: -180,
              transition: {
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1],
              }
            }}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
              zIndex: 10,
            }}
          >
            {/* Cover front face */}
            <div
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              {cover}
            </div>

            {/* Cover back face (page texture visible when flipping) */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #2a2a3a 0%, #1e1e2e 100%)'
                  : 'linear-gradient(135deg, #fffef8 0%, #f5f5f0 100%)',
              }}
            >
              {/* Paper texture on back of cover */}
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 31px,
                    ${theme === 'dark' ? 'rgba(157, 123, 224, 0.1)' : 'rgba(95, 108, 175, 0.08)'} 31px,
                    ${theme === 'dark' ? 'rgba(157, 123, 224, 0.1)' : 'rgba(95, 108, 175, 0.08)'} 32px
                  )`,
                  backgroundSize: '100% 32px',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page edge effect (visible spine) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="absolute left-0 top-2 bottom-2 w-1.5 rounded-l"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.3, delay: 0.3 }
            }}
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(90deg, rgba(50,50,60,0.9) 0%, rgba(40,40,50,0.5) 100%)'
                : 'linear-gradient(90deg, rgba(180,160,140,0.9) 0%, rgba(200,180,160,0.5) 100%)',
              zIndex: 5,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
