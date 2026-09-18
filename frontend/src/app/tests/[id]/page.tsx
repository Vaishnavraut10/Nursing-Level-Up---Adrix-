'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import GlassCard from '@/components/GlassCard';
import ProgressBar from '@/components/ProgressBar';
import { getTestById, getQuestionsByTestId } from '@/data';
import { mcqTransition, useScrollReveal, glowPulseVariants } from '@/utilities/animations';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const test = getTestById(testId);
  const questions = getQuestionsByTestId(testId);
  const scrollReveal = useScrollReveal();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(test?.duration || 60 * 60); // in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (!test) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    router.push(`/results/${testId}`);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  if (!test || !questions.length) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted">Test not found.</p>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Test Header */}
        <motion.div
          {...scrollReveal}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-dark">
              <span className="gradient-text">{test.title}</span>
            </h1>
            <motion.div
              variants={glowPulseVariants}
              animate={timeRemaining < 300 ? "animate" : ""}
              className={`px-6 py-3 rounded-xl font-mono text-lg font-bold shadow-lg ${
                timeRemaining < 300 
                  ? 'bg-gradient-to-br from-error/20 to-error/10 text-error border border-error/30' 
                  : 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/30'
              }`}>
              {formatTime(timeRemaining)}
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <ProgressBar progress={((currentQuestionIndex + 1) / questions.length) * 100} showLabel={false} size="sm" />
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            variants={mcqTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass rounded-2xl p-6 md:p-8 mb-6"
          >
            <div className="mb-6">
              <span className="text-sm text-muted font-medium">Question {currentQuestionIndex + 1}</span>
            </div>
            
            <h3 className="text-lg md:text-xl font-semibold text-dark mb-6">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === index;
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg' 
                        : 'border-border bg-white/50 backdrop-blur-sm hover:border-primary/50 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div
                        animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-white shadow-md' : 'border-border'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </motion.div>
                      <span className={`text-sm ${isSelected ? 'text-dark font-medium' : 'text-muted'}`}>
                        {option}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          {...scrollReveal}
          className="flex items-center justify-between"
        >
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            {/* Question Navigator */}
            <div className="hidden md:flex items-center space-x-1">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentQuestionIndex === index
                      ? 'bg-primary text-white'
                      : selectedAnswers[questions[index].id] !== undefined
                      ? 'bg-success/10 text-success border border-success'
                      : 'bg-surface border border-border text-muted hover:border-primary'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Test
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </motion.div>

        {/* Submit Modal */}
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit this test?"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted">Answered</span>
              <span className="font-semibold text-dark">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted">Unanswered</span>
              <span className="font-semibold text-dark">{unansweredCount}</span>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setShowSubmitModal(false)}
                variant="outline"
                className="flex-1"
              >
                Continue Test
              </Button>
              <Button
                onClick={confirmSubmit}
                className="flex-1"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}