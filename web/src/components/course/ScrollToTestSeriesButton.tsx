'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface ScrollToTestSeriesButtonProps {
  targetId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function ScrollToTestSeriesButton({
  targetId = 'course-test-series',
  className = 'w-full',
  size = 'md',
  children = 'Access Course & Solve Tests ↓',
}: ScrollToTestSeriesButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const target =
      document.getElementById(targetId) ||
      document.getElementById('course-test-series') ||
      document.getElementById('series-list');

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Fallback if target section is loaded or rendered asynchronously
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el =
        document.getElementById(targetId) ||
        document.getElementById('course-test-series') ||
        document.getElementById('series-list');

      if (el) {
        clearInterval(interval);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts >= 20) {
        clearInterval(interval);
      }
    }, 100);
  };

  return (
    <Button
      type="button"
      size={size}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
