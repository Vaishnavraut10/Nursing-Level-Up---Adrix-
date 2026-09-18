'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SampleQuestion() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = {
    id: 1,
    question: 'A patient is receiving heparin therapy for deep vein thrombosis. Which laboratory test should the nurse monitor to assess the effectiveness of heparin therapy?',
    options: [
      'Prothrombin time (PT)',
      'International normalized ratio (INR)',
      'Activated partial thromboplastin time (aPTT)',
      'Platelet count'
    ],
    correctAnswer: 2,
    explanation: 'aPTT is used to monitor heparin therapy. The therapeutic range for aPTT is typically 1.5 to 2.5 times the control value. PT and INR are used to monitor warfarin therapy.'
  };

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-4">
        <span className="text-sm text-muted font-medium">Question 01</span>
      </div>
      
      <h3 className="text-lg md:text-xl font-semibold text-dark mb-6">
        {question.question}
      </h3>
      
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === question.correctAnswer;
          const showResult = selectedOption !== null;
          
          let optionClass = 'border border-border bg-white hover:border-primary/50';
          if (showResult) {
            if (isCorrect) {
              optionClass = 'border-success bg-success/10';
            } else if (isSelected && !isCorrect) {
              optionClass = 'border-error bg-error/10';
            } else {
              optionClass = 'border-border bg-white opacity-60';
            }
          }
          
          return (
            <motion.button
              key={index}
              onClick={() => !showResult && handleOptionClick(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${optionClass}`}
              whileHover={!showResult ? { scale: 1.01 } : {}}
              whileTap={!showResult ? { scale: 0.99 } : {}}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  showResult && isCorrect 
                    ? 'border-success bg-success text-white' 
                    : showResult && isSelected && !isCorrect
                    ? 'border-error bg-error text-white'
                    : 'border-border'
                }`}>
                  {showResult && isCorrect && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {!showResult && (
                    <span className="text-sm font-medium text-muted">{String.fromCharCode(65 + index)}</span>
                  )}
                </div>
                <span className={`text-sm ${showResult && isCorrect ? 'text-dark font-medium' : 'text-muted'}`}>
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4"
        >
          <h4 className="font-semibold text-dark mb-2">Explanation</h4>
          <p className="text-sm text-muted">{question.explanation}</p>
        </motion.div>
      )}
      
      {!showExplanation && (
        <motion.button
          onClick={() => handleOptionClick(question.correctAnswer)}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Try Answering
        </motion.button>
      )}
    </div>
  );
}