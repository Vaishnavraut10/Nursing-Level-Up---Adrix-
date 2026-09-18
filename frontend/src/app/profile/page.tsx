'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import { courses } from '@/data';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function ProfilePage() {
  const scrollReveal = useScrollReveal();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-dark mb-2">My Profile</h1>
          <p className="text-muted">Manage your account and view your activity.</p>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="bg-surface border border-border rounded-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Name</label>
              <p className="text-dark">Student Name</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Email</label>
              <p className="text-dark">student@example.com</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Member since</label>
              <p className="text-dark">September 2024</p>
            </div>
          </div>
        </motion.div>

        {/* Courses */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">My Courses</h2>
          
          <div className="space-y-4">
            {courses.slice(0, 2).map((course) => (
              <div
                key={course.id}
                className="bg-surface border border-border rounded-lg p-4 flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-dark">{course.name}</h3>
                  <p className="text-sm text-muted">{course.category}</p>
                </div>
                
                <Button href={`/courses/${course.id}`} variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Test History */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Test History</h2>
          
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            {[
              { testName: 'Medical-Surgical Nursing Assessment', score: 82, date: 'Sep 15, 2024' },
              { testName: 'Cardiovascular Nursing Practice', score: 78, date: 'Sep 12, 2024' },
              { testName: 'Pharmacology Fundamentals', score: 85, date: 'Sep 10, 2024' }
            ].map((result, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-dark">{result.testName}</h3>
                  <p className="text-sm text-muted">{result.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${result.score >= 80 ? 'text-success' : result.score >= 70 ? 'text-primary' : 'text-error'}`}>
                    {result.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
        >
          <Button variant="outline" className="text-error border-error hover:bg-error/5">
            Logout
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}