'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import CircularProgress from '@/components/CircularProgress';
import { getTestSeriesById } from '@/data';
import { mockResults } from '@/data';
import { fadeUpVariants, useScrollReveal, progressVariants } from '@/utilities/animations';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testSeriesId = params.id as string;
  const testSeries = getTestSeriesById(testSeriesId);
  const scrollReveal = useScrollReveal();
  
  // Mock result data
  const result = mockResults[0] || {
    score: 38,
    totalQuestions: 50,
    percentage: 76,
    correct: 38,
    incorrect: 8,
    unanswered: 4,
    timeTaken: '34:12',
    date: 'Just now'
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
        >
          <h1 className="text-3xl font-bold text-dark mb-2">Test Completed</h1>
          <p className="text-muted mb-8">{testSeries?.title || 'Test Series'}</p>

          {/* Score Display */}
          <div className="bg-surface border border-border rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
              <motion.div
                variants={progressVariants}
                initial="hidden"
                animate="visible"
              >
                <CircularProgress 
                  progress={result.percentage} 
                  size={200}
                  strokeWidth={12}
                />
              </motion.div>
              
              <div className="text-center md:text-left">
                <div className="text-5xl font-bold text-dark mb-2">
                  {result.score} / {result.totalQuestions}
                </div>
                <div className="text-2xl font-semibold text-primary mb-6">
                  {result.percentage}%
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Correct:</span>
                    <span className="text-success font-medium">{result.correct}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Incorrect:</span>
                    <span className="text-error font-medium">{result.incorrect}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Unanswered:</span>
                    <span className="text-muted font-medium">{result.unanswered}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Time Taken:</span>
                    <span className="text-dark font-medium">{result.timeTaken}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mb-8">
            <Button href="/dashboard" variant="outline">
              Back to Dashboard
            </Button>
            <Button href={`/test-series/${testSeriesId}`}>
              Review Answers
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}