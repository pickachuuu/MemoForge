'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'motion/react';

interface NotebookCoverProps {
  title: string;
  onTitleChange: (title: string) => void;
  onOpen: () => void;
  theme?: 'light' | 'dark';
}

/**
 * NotebookCover - A premium journal cover with modern aesthetic.
 * Inspired by Moleskine notebooks with clean, elegant design.
 */
export default function NotebookCover({
  title,
  onTitleChange,
  onOpen,
  theme = 'light'
}: NotebookCoverProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title.trim()) {
      onOpen();
    }
  };

  const handleOpenClick = () => {
    if (title.trim()) {
      onOpen();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`notebook-cover ${isDark ? 'notebook-cover--dark' : 'notebook-cover--light'}`}>
      {/* Subtle texture overlay */}
      <div className="notebook-cover__texture" />

      {/* Rounded corners overlay for realistic book effect */}
      <div className="notebook-cover__edge notebook-cover__edge--top" />
      <div className="notebook-cover__edge notebook-cover__edge--bottom" />

      {/* Spine binding */}
      <div className={`notebook-cover__spine ${isDark ? 'notebook-cover__spine--dark' : ''}`}>
        <div className="notebook-cover__spine-line" />
        <div className="notebook-cover__spine-line" />
        <div className="notebook-cover__spine-line" />
      </div>

      {/* Elastic band detail */}
      <div className={`notebook-cover__band ${isDark ? 'notebook-cover__band--dark' : ''}`} />

      {/* Main content */}
      <div className="notebook-cover__content">
        <motion.div
          className="notebook-cover__inner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Label area */}
          <div className={`notebook-cover__label ${isFocused ? 'notebook-cover__label--focused' : ''} ${isDark ? 'notebook-cover__label--dark' : ''}`}>
            {/* Label texture */}
            <div className="notebook-cover__label-texture" />

            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Untitled Notebook"
              className={`notebook-cover__input ${isDark ? 'notebook-cover__input--dark' : ''}`}
              autoFocus
            />
          </div>

          {/* Open button */}
          <motion.button
            onClick={handleOpenClick}
            disabled={!title.trim()}
            className={`notebook-cover__button ${title.trim() ? 'notebook-cover__button--active' : ''} ${isDark ? 'notebook-cover__button--dark' : ''}`}
            whileHover={title.trim() ? { y: -2 } : {}}
            whileTap={title.trim() ? { scale: 0.98 } : {}}
          >
            {title.trim() ? (
              <>
                <span>Open Notebook</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            ) : (
              <span>Enter a title to begin</span>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom branding area */}
      <div className={`notebook-cover__footer ${isDark ? 'notebook-cover__footer--dark' : ''}`}>
        <div className="notebook-cover__footer-line" />
        <span>REVISEA</span>
        <div className="notebook-cover__footer-line" />
      </div>
    </div>
  );
}
