import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ 
  eyebrow, 
  title, 
  description, 
  align = 'left' 
}: SectionHeadingProps) {
  const alignClasses = align === 'center' 
    ? 'text-center' 
    : 'text-left';

  return (
    <div className={`mb-12 ${alignClasses}`}>
      {eyebrow && (
        <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-muted text-lg max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}