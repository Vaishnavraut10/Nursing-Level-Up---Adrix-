'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import { scaleVariants } from '@/utilities/animations';
import { motion } from 'framer-motion';

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { user, completeProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic phone validation
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        setError('Please enter a valid Indian phone number (10 digits starting with 6-9)');
        setIsLoading(false);
        return;
      }

      await completeProfile(phone);
      router.push(redirect);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete profile');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-background">
      <motion.div
        variants={scaleVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        <div className="bg-surface border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <h1 className="text-2xl font-bold text-dark mb-2">Complete Your Profile</h1>
            <p className="text-muted">Please provide your phone number to continue</p>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted">Name</p>
              <p className="text-dark font-medium">{user.name}</p>
              <p className="text-sm text-muted mt-2">Email</p>
              <p className="text-dark font-medium">{user.email}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 98765 43210"
                required
              />
              <p className="text-xs text-muted mt-1">
                Enter your 10-digit Indian mobile number
              </p>
            </div>

            {error && (
              <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}