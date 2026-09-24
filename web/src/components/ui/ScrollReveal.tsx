'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function ScrollReveal({
  children,
  className = '',
  stagger = 0,
  threshold = 0.12,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('revealed');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (stagger) {
            setTimeout(() => el.classList.add('revealed'), stagger);
          } else {
            el.classList.add('revealed');
          }
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, threshold]);

  const cls = ['reveal', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={cls}>
      {children}
    </div>
  );
}
