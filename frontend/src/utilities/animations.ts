import { motion, Variants } from 'framer-motion';

export const useScrollReveal = () => {
  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-100px' },
  };
};

// Base animation configuration
export const baseTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
};

export const slowTransition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
};

// Fade up animation
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
};

// Staggered children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Card hover animation
export const cardHoverVariants = {
  hover: {
    y: -3,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  },
};

// Hero text reveal
export const heroTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  }),
};

// Page transition
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: baseTransition,
  },
};

// MCQ transition
export const mcqTransition: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  },
};

// Scale animation for modals
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: baseTransition,
  },
};

// Progress animation
export const progressVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  },
};