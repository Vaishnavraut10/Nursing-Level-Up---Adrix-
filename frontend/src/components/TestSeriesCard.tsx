'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TestSeries } from '@/data';
import { cardHoverVariants } from '@/utilities/animations';

interface TestSeriesCardProps {
  testSeries: TestSeries;
}

export default function TestSeriesCard({ testSeries }: TestSeriesCardProps) {
  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <Link href={`/test-series/${testSeries.id}`} className="block">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-dark mb-1">{testSeries.title}</h3>
              <p className="text-sm text-muted">{testSeries.description}</p>
            </div>
            {testSeries.isFree && (
              <span className="bg-success/10 text-success text-xs font-medium px-2 py-1 rounded">
                FREE
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted mb-4">
            <span>{testSeries.questionCount} Questions</span>
            <span>•</span>
            <span>{testSeries.duration} Minutes</span>
            <span>•</span>
            <span>{testSeries.difficulty}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">
              {!testSeries.isFree && (
                <span className="text-primary font-semibold">₹{testSeries.price}</span>
              )}
            </div>
            <span className="text-primary font-medium text-sm flex items-center">
              {testSeries.isFree ? 'Start Test' : 'View Details'}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}