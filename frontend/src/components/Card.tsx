import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export default function Card({ children, className = '', title, description }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {(title || description) && (
        <div className="p-6 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>}
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}