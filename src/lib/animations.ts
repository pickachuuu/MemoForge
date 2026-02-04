/**
 * Animation variants and utilities for Framer Motion
 *
 * PERFORMANCE OPTIMIZED:
 * - Only use transform and opacity (GPU accelerated)
 * - Minimal viewport observers
 * - No infinite animations during scroll
 * - Simple spring transitions
 */

import { Variants, Transition } from 'motion/react';

// ==========================================
// Transition Presets (Lightweight)
// ==========================================

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth feel
};

export const quickTransition: Transition = {
  type: 'tween',
  duration: 0.2,
  ease: 'easeOut',
};

// ==========================================
// Simple Fade Animations
// ==========================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

// ==========================================
// Scale Animation
// ==========================================

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: smoothTransition,
  },
};

// ==========================================
// Container for Staggering (Simplified)
// ==========================================

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// ==========================================
// Viewport Settings
// ==========================================

export const viewportOnce = {
  once: true,
  amount: 0.15,
  margin: '-50px',
};

// ==========================================
// Hover/Tap (Only for interactive elements)
// ==========================================

export const hoverScale = {
  scale: 1.02,
};

export const tapScale = {
  scale: 0.98,
};

// ==========================================
// Notebook Flip Animation
// ==========================================

export const notebookFlipTransition: Transition = {
  type: 'tween',
  duration: 0.8,
  ease: [0.4, 0, 0.2, 1], // Custom easing for realistic page flip
};

export const notebookCoverVariants: Variants = {
  closed: {
    rotateY: 0,
    transition: notebookFlipTransition,
  },
  open: {
    rotateY: -180,
    transition: notebookFlipTransition,
  },
};

export const notebookPagesVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.4, // Start appearing midway through the flip
      ease: 'easeOut',
    },
  },
};

export const coverContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Subtle hover animation for the cover
export const coverHover = {
  scale: 1.01,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
};
