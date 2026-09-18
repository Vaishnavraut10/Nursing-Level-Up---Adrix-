'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import CircularProgress from '@/components/CircularProgress';
import { getTestById, getQuestionsByTestId } from '@/data';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const test = getTestById(testId);
  const questions = getQuestionsByTestId(testId);
  const scrollReveal = useScrollReveal();

  // Mock results
  const score = 82;
  const correct = 41;
  const incorrect = 7;
  const unanswered = 2;
  const timeTaken = '45:32';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-dark mb-2">Test Results</h1>
          <p className="text-muted">{test?.title}</p>
        </motion.div>

        {/* Score Display */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="bg-surface border border-border rounded-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            <CircularProgress progress={score} size={160} />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-8">
                <span className="text-muted">Correct</span>
                <span className="text-xl font-bold text-success">{correct}</span>
              </div>
              <div className="flex items-center justify-between space-x-8">
                <span className="text-muted">Incorrect</span>
                <span className="text-xl font-bold text-error">{incorrect}</span>
              </div>
              <div className="flex items-center justify-between space-x-8">
                <span className="text-muted">Unanswered</span>
                <span className="text-xl font-bold text-muted">{unanswered}</span>
              </div>
              <div className="flex items-center justify-between space-x-8">
                <span className="text-muted">Time Taken</span>
                <span className="text-xl font-bold text-dark">{timeTaken}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review Answers */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Review Answers</h2>
          
          <div className="space-y-4">
            {questions.slice(0, 5).map((question, index) => {
              const isCorrect = index % 3 !== 0; // Mock correct/incorrect
              
              return (
                <div
                  key={question.id}
                  className={`bg-surface border rounded-lg p-6 ${
                    isCorrect ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
                  }`}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-success text-white' : 'bg-error text-white'
                    }`}>
                      {isCorrect ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-muted mb-1">Question {index + 1}</p>
                      <p className="text-dark font-medium">{question.question}</p>
                    </div>
                  </div>
                  
                  <div className="pl-9">
                    <button className="text-sm text-primary hover:text-primary-dark font-medium">
                      {isCorrect ? 'View explanation' : 'See correct answer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More Questions
            </Button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="flex justify-center space-x-4"
        >
          <Button href="/dashboard" variant="outline">
            Back to Dashboard
          </Button>
          <Button href="/courses">
            Explore More Courses
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}