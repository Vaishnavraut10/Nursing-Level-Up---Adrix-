'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { testSeries, getFreeTestSeries } from '@/data';
import { mockResults } from '@/data';
import { fadeUpVariants, staggerContainer, useScrollReveal } from '@/utilities/animations';

export default function DashboardPage() {
  const scrollReveal = useScrollReveal();
  const freeTests = getFreeTestSeries();
  const recentResults = mockResults.slice(0, 3);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-dark mb-2">Welcome back</h1>
          <p className="text-muted">Continue your preparation.</p>
        </motion.div>

        {/* Continue Test */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Continue Test</h2>
          
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-dark mb-1">Test Series 02</h3>
                <p className="text-sm text-muted mb-3">Last activity: 2 hours ago</p>
                
                <ProgressBar progress={65} showLabel={false} />
                
                <div className="mt-4 flex items-center space-x-3">
                  <Button href="/tests/ts2" size="sm">
                    Continue
                  </Button>
                  <span className="text-sm text-muted">65% complete</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Available Test Series */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Available Test Series</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeTests.map((test) => (
              <div
                key={test.id}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">{test.title}</h3>
                    <p className="text-sm text-muted">{test.difficulty}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <span>{test.questionCount} Questions</span>
                  <span>{test.duration} min</span>
                </div>
                
                <Button href={`/tests/${test.id}`} variant="outline" size="sm" className="w-full">
                  Start Test
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Recent Results</h2>
          
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            {recentResults.map((result) => (
              <div key={result.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-dark">{result.testSeriesTitle}</h3>
                  <p className="text-sm text-muted">{result.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${result.percentage >= 80 ? 'text-success' : result.percentage >= 70 ? 'text-primary' : 'text-error'}`}>
                    {result.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Your Progress */}
        <motion.div
          {...scrollReveal}
          variants={staggerContainer}
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Your Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Tests completed', value: '3' },
              { label: 'Average score', value: '83%' },
              { label: 'Test series unlocked', value: '2' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariants}
                className="bg-surface border border-border rounded-lg p-6 text-center"
              >
                <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}