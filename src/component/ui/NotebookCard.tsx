'use client';

import { motion } from 'motion/react';
import { Clock01Icon, GoogleGeminiIcon, Delete01Icon } from 'hugeicons-react';

interface NotebookCardProps {
  title: string;
  tags?: string[];
  updatedAt?: string;
  onGenerateFlashcards?: () => void;
  onDelete?: () => void;
}

/**
 * NotebookCard - A 3D notebook display for the notebooks gallery.
 * Features realistic page edges and depth effect.
 */
export default function NotebookCard({
  title,
  tags = [],
  updatedAt,
  onGenerateFlashcards,
  onDelete,
}: NotebookCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className="notebook-card-3d group"
      whileHover={{
        rotateY: -8,
        rotateX: 2,
        y: -8,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Page edges (visible from the side) */}
      <div className="notebook-card-3d__pages">
        {/* Multiple page layers for depth */}
        <div className="notebook-card-3d__page-edge notebook-card-3d__page-edge--1" />
        <div className="notebook-card-3d__page-edge notebook-card-3d__page-edge--2" />
        <div className="notebook-card-3d__page-edge notebook-card-3d__page-edge--3" />
        <div className="notebook-card-3d__page-edge notebook-card-3d__page-edge--4" />
        <div className="notebook-card-3d__page-edge notebook-card-3d__page-edge--5" />
      </div>

      {/* Bottom edge (thickness) */}
      <div className="notebook-card-3d__bottom" />

      {/* Main cover */}
      <div className="notebook-card-3d__cover">
        {/* Texture */}
        <div className="notebook-card-3d__texture" />

        {/* Spine */}
        <div className="notebook-card-3d__spine">
          <div className="notebook-card-3d__spine-detail" />
          <div className="notebook-card-3d__spine-detail" />
          <div className="notebook-card-3d__spine-detail" />
          <div className="notebook-card-3d__spine-detail" />
        </div>

        {/* Elastic band */}
        <div className="notebook-card-3d__band" />

        {/* Content */}
        <div className="notebook-card-3d__content">
          {/* Title label */}
          <div className="notebook-card-3d__label">
            <h3 className="notebook-card-3d__title">
              {title || 'Untitled Notebook'}
            </h3>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="notebook-card-3d__tags">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="notebook-card-3d__tag">
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="notebook-card-3d__tag-more">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notebook-card-3d__footer">
          <div className="notebook-card-3d__date">
            <Clock01Icon className="w-3.5 h-3.5" />
            <span>{formatDate(updatedAt)}</span>
          </div>
        </div>

        {/* Hover overlay with actions */}
        <div className="notebook-card-3d__overlay">
          <div className="notebook-card-3d__actions">
            {onGenerateFlashcards && (
              <button
                className="notebook-card-3d__action notebook-card-3d__action--primary"
                title="Generate flashcards"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onGenerateFlashcards();
                }}
              >
                <GoogleGeminiIcon className="w-5 h-5" />
                <span>Flashcards</span>
              </button>
            )}
            {onDelete && (
              <button
                className="notebook-card-3d__action notebook-card-3d__action--danger"
                title="Delete notebook"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete();
                }}
              >
                <Delete01Icon className="w-5 h-5" />
              </button>
            )}
          </div>
          <span className="notebook-card-3d__open-hint">Click to open</span>
        </div>
      </div>

      {/* Ambient shadow */}
      <div className="notebook-card-3d__shadow" />
    </motion.div>
  );
}
