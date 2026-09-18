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

// Image zoom animation
export const imageZoomVariants = {
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.3,
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
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// Progress animation
export const progressVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0],
    }
  },
};

// NEW: Floating animation
export const floatVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 2, 0],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// NEW: Gradient shift animation
export const gradientShiftVariants: Variants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 5,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// NEW: Glow pulse animation
export const glowPulseVariants: Variants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(15, 118, 110, 0.2)",
      "0 0 40px rgba(15, 118, 110, 0.4)",
      "0 0 20px rgba(15, 118, 110, 0.2)"
    ],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// NEW: 3D rotate animation
export const rotate3dVariants: Variants = {
  hover: {
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// NEW: Scale with glow animation
export const scaleGlowVariants: Variants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 0 40px rgba(15, 118, 110, 0.4)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// NEW: Particle burst animation
export const particleBurstVariants: Variants = {
  tap: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// NEW: Glassmorphism transition
export const glassMorphVariants: Variants = {
  hover: {
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(16px)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// NEW: Parallax variants
export const parallaxVariants: Variants = {
  animate: {
    y: [0, -30, 0],
    transition: {
      duration: 10,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// Export motion components for convenience
export { motion };