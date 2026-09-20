'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUpVariants, useScrollReveal } from '@/utilities/animations';

export default function CreatorSection() {
  const scrollReveal = useScrollReveal();

  return (
    <motion.div
      {...scrollReveal}
      variants={fadeUpVariants}
      className="bg-surface border border-border rounded-lg p-8"
    >
      <h2 className="text-xl font-semibold text-dark mb-6">Created by a Nursing Professional</h2>
      
      <div className="flex items-start space-x-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-primary">DT</span>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-dark mb-2">Dhruva Thakre</h3>
          <p className="text-muted mb-1">Nursing Officer, GMCH Nagpur</p>
          <p className="text-muted mb-1">B.Sc. Nursing</p>
          <p className="text-muted">Batch 2018, GMC Nagpur</p>
        </div>
      </div>
    </motion.div>
  );
}