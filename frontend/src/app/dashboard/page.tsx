'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import ProgressBar from '@/components/ProgressBar';
import { courses } from '@/data';
import { fadeUpVariants, staggerContainer, useScrollReveal, glowPulseVariants } from '@/utilities/animations';

export default function DashboardPage() {
  const scrollReveal = useScrollReveal();
  
  // Mock enrolled course
  const enrolledCourse = courses[0];
  const progress = 65;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-dark mb-2">
            <span className="gradient-text">Welcome back</span>
          </h1>
          <p className="text-muted">Continue your nursing practice journey.</p>
        </motion.div>

        {/* Continue Learning */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Continue learning</h2>
          
          <motion.div
            variants={glowPulseVariants}
            animate="animate"
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-dark mb-1">{enrolledCourse.name}</h3>
                <p className="text-sm text-muted mb-3">Last activity: 2 hours ago</p>
                
                <ProgressBar progress={progress} showLabel={false} />
                
                <div className="mt-4 flex items-center space-x-3">
                  <Button href={`/courses/${enrolledCourse.id}`} size="sm">
                    Continue
                  </Button>
                  <span className="text-sm text-muted">{progress}% complete</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Your Courses */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Your courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 2).map((course) => (
              <GlassCard key={course.id} glow>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">{course.name}</h3>
                    <p className="text-sm text-muted">{course.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <span>{course.mcqCount} MCQs</span>
                  <span>{course.testCount} Tests</span>
                </div>
                
                <Button href={`/courses/${course.id}`} variant="outline" size="sm" className="w-full">
                  View Course
                </Button>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Recent results</h2>
          
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {[
              { testName: 'Medical-Surgical Nursing Assessment', score: 82, date: '2 hours ago' },
              { testName: 'Cardiovascular Nursing Practice', score: 78, date: '1 day ago' },
              { testName: 'Pharmacology Fundamentals', score: 85, date: '3 days ago' }
            ].map((result, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-dark">{result.testName}</h3>
                  <p className="text-sm text-muted">{result.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${result.score >= 80 ? 'text-success' : result.score >= 70 ? 'text-primary' : 'text-error'}`}>
                    {result.score}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          {...scrollReveal}
          variants={staggerContainer}
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Your progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Tests completed', value: '12', icon: '📝' },
              { label: 'Average score', value: '82%', icon: '📊' },
              { label: 'Courses enrolled', value: '2', icon: '📚' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariants}
                className="glass glass-light rounded-2xl p-6 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}