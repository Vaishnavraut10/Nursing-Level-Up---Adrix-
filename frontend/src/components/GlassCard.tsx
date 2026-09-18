'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { glassMorphVariants } from '@/utilities/animations';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  glow?: boolean;
}

export default function GlassCard({ 
  children, 
  className = '', 
  variant = 'light',
  glow = false 
}: GlassCardProps) {
  const baseClasses = variant === 'light' 
    ? 'glass glass-light' 
    : 'glass glass-shadow';
  
  const glowClass = glow ? 'glow-primary' : '';
  
  return (
    <motion.div
      variants={glassMorphVariants}
      whileHover="hover"
      className={`${baseClasses} ${glowClass} rounded-2xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}