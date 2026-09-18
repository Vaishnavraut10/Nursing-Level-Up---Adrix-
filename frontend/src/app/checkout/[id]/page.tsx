'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { getCourseById } from '@/data';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function CheckoutPage() {
  const params = useParams();
  const courseId = params.id as string;
  const course = getCourseById(courseId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-dark mb-2">Checkout</h1>
          <p className="text-muted">Complete your purchase to access the course.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Information */}
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Course Information</h2>
              
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-dark mb-2">{course.name}</h3>
                  <p className="text-sm text-muted mb-3">{course.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted">
                    <span>{course.mcqCount} MCQs</span>
                    <span>{course.testCount} Tests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    id="razorpay"
                    defaultChecked
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <label htmlFor="razorpay" className="flex-grow cursor-pointer">
                    <span className="font-medium text-dark">Razorpay</span>
                    <p className="text-sm text-muted">Pay using UPI, cards, or net banking</p>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    id="stripe"
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <label htmlFor="stripe" className="flex-grow cursor-pointer">
                    <span className="font-medium text-dark">Stripe</span>
                    <p className="text-sm text-muted">International cards and payments</p>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
            className="lg:col-span-1"
          >
            <div className="bg-surface border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted">{course.name}</span>
                  <span className="text-dark font-medium">₹{course.price.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-dark">₹{course.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-dark">Total</span>
                    <span className="text-lg font-bold text-primary">₹{course.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
              
              <p className="text-xs text-muted text-center mt-4">
                Secure payment powered by Razorpay/Stripe
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Payment Successful"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-muted">
            You have successfully purchased {course.name}. You can now access the course from your dashboard.
          </p>
          <Button href="/dashboard" className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
}