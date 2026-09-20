'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { mockResults } from '@/data';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function ProfilePage() {
  const scrollReveal = useScrollReveal();
  const { user, logout } = useAuth();
  const recentResults = mockResults.slice(0, 5);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-dark mb-1">{user?.name || 'User'}</h1>
                <p className="text-muted">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test History */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">Test History</h2>
          
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

        {/* Logout */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
        >
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}