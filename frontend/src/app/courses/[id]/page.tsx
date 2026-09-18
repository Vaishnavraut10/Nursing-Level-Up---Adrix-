'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import { getCourseById, getTestsByCourseId } from '@/data';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const course = getCourseById(courseId);
  const courseTests = getTestsByCourseId(courseId);
  const scrollReveal = useScrollReveal();

  if (!course) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted">Course not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
        >
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg aspect-video flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-sm text-muted uppercase tracking-wider">{course.category}</p>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              {course.name}
            </h1>
            <p className="text-lg text-muted mb-6">
              {course.description}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-muted mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{course.mcqCount} MCQs</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{course.testCount} Tests</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-lg p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-muted mb-2">Course Price</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{course.price.toLocaleString()}
                </p>
              </div>
              
              <Button href={`/checkout/${course.id}`} size="lg" className="w-full mb-4">
                Buy Course
              </Button>
              
              <div className="space-y-3 text-sm text-muted">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All MCQs included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Timed tests</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What You'll Practice */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-dark mb-6">What you'll practice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.topics.map((topic, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-lg p-4 flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-dark">{topic}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Course Contents */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-dark mb-6">Course contents</h2>
          <div className="space-y-4">
            {courseTests.map((test, index) => (
              <div
                key={test.id}
                className="bg-surface border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-dark mb-1">{test.title}</h3>
                    <p className="text-sm text-muted">{test.description}</p>
                  </div>
                  <div className="text-right text-sm text-muted">
                    <p>{test.questionCount} questions</p>
                    <p>{test.duration} minutes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Practice Included */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
        >
          <h2 className="text-2xl font-bold text-dark mb-6">Practice included</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-dark mb-2">{course.mcqCount} MCQs</h3>
              <p className="text-sm text-muted">Practice questions with detailed explanations</p>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-dark mb-2">{course.testCount} Timed Tests</h3>
              <p className="text-sm text-muted">Simulate exam conditions with timed assessments</p>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-dark mb-2">Results</h3>
              <p className="text-sm text-muted">Track your progress and review performance</p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}