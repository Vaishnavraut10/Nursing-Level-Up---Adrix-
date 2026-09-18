'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { floatVariants } from '@/utilities/animations';

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function FloatingElement({ 
  children, 
  className = '', 
  delay = 0,
  duration = 6
}: FloatingElementProps) {
  return (
    <motion.div
      variants={floatVariants}
      animate="animate"
      transition={{
        duration,
        delay,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}