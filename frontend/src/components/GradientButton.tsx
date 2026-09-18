'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { particleBurstVariants } from '@/utilities/animations';

interface GradientButtonProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  glow?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function GradientButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  glow = false,
  className = '',
  href,
  onClick,
  disabled = false
}: GradientButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variantStyles = {
    primary: 'gradient-animated text-white',
    secondary: 'gradient-bg-secondary text-white',
    accent: 'gradient-bg-accent text-white'
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const glowClass = glow ? 'glow-primary' : '';
  
  const MotionLink = motion(Link);
  const MotionButton = motion.button;

  const motionProps = {
    variants: particleBurstVariants,
    whileTap: 'tap',
    className: `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${glowClass} ${className}`,
    disabled
  };

  if (href && !disabled) {
    return (
      <MotionLink href={href} {...motionProps}>
        {children}
      </MotionLink>
    );
  }

  return (
    <MotionButton
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </MotionButton>
  );
}