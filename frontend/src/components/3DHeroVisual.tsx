'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FloatingElement from './FloatingElement';
import { parallaxVariants, scaleGlowVariants } from '@/utilities/animations';

export default function HeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl" />
      
      {/* Floating decorative elements */}
      <FloatingElement delay={0} duration={6} className="absolute top-8 left-8">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </FloatingElement>
      
      <FloatingElement delay={1} duration={8} className="absolute top-12 right-12">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </FloatingElement>
      
      <FloatingElement delay={2} duration={7} className="absolute bottom-8 left-12">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </FloatingElement>
      
      {/* Main MCQ interface mockup */}
      <motion.div
        variants={scaleGlowVariants}
        whileHover="hover"
        className="relative z-10 bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl max-w-md w-full"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-dark">Sample MCQ</p>
            <p className="text-xs text-muted">Medical-Surgical Nursing</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-dark font-medium line-clamp-2">
            A patient is receiving heparin therapy for deep vein thrombosis...
          </p>
          <div className="space-y-2">
            {['Prothrombin time (PT)', 'International normalized ratio (INR)', 'Activated partial thromboplastin time (aPTT)', 'Platelet count'].map((option, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm text-muted">
                <div className="w-5 h-5 rounded border border-primary/30 flex items-center justify-center">
                  <span className="text-xs text-primary">{String.fromCharCode(65 + i)}</span>
                </div>
                <span className="line-clamp-1">{option}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted">Correct: aPTT</span>
          </div>
          <div className="text-xs text-primary font-medium">Try it yourself →</div>
        </div>
      </motion.div>
      
      {/* Achievement badge */}
      <motion.div
        variants={parallaxVariants}
        animate="animate"
        className="absolute bottom-12 right-8 z-20"
      >
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          82% Average Score
        </div>
      </motion.div>
    </div>
  );
}