'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import { scaleVariants } from '@/utilities/animations';

export default function LoginPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <h1 className="text-3xl font-bold text-dark mb-2">Welcome to Nursing Level Up</h1>
            <p className="text-muted">Select your role to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Login Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-surface border border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push('/login/student')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-dark mb-2">Student</h2>
                <p className="text-sm text-muted mb-4">Access test series, take tests, and track your progress</p>
                <Button size="sm" className="w-full">
                  Student Login
                </Button>
              </div>
            </motion.div>

            {/* Admin Login Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-surface border border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push('/login/admin')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-dark mb-2">Admin</h2>
                <p className="text-sm text-muted mb-4">Manage users, test series, questions, and platform data</p>
                <Button size="sm" className="w-full">
                  Admin Login
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted">
              Development mode: Use your seeded credentials
            </p>
            <p className="text-xs text-muted mt-1">
              Students: student1@example.com | Admin: admin@nursinglevelup.com
            </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
