'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import { getTestSeriesById } from '@/data';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const testSeriesId = params.id as string;
  const testSeries = getTestSeriesById(testSeriesId);
  const scrollReveal = useScrollReveal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'stripe'>('razorpay');

  if (!testSeries) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted">Test series not found.</p>
        </div>
      </MainLayout>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, this would verify payment with backend
      // For now, we'll just redirect back to test details
      router.push(`/test-series/${testSeriesId}`);
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
        >
          <h1 className="text-3xl font-bold text-dark mb-2">Unlock Test Series</h1>
          <p className="text-muted mb-8">Complete your payment to access this test series.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Test Series Info */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">{testSeries.title}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted">Questions</span>
                  <span className="text-dark font-medium">{testSeries.questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Duration</span>
                  <span className="text-dark font-medium">{testSeries.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Difficulty</span>
                  <span className="text-dark font-medium">{testSeries.difficulty}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-dark">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{testSeries.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Payment Method</h2>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedPayment('razorpay')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedPayment === 'razorpay'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <span className="text-dark font-medium">Razorpay</span>
                  </div>
                  {selectedPayment === 'razorpay' && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedPayment('stripe')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedPayment === 'stripe'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-dark font-medium">Stripe</span>
                  </div>
                  {selectedPayment === 'stripe' && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${testSeries.price}`}
              </Button>

              <p className="text-xs text-muted text-center mt-4">
                This is a payment placeholder. No actual payment will be processed.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}