'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import TestSeriesCard from '@/components/TestSeriesCard';
import SampleQuestion from '@/components/SampleQuestion';
import CreatorSection from '@/components/CreatorSection';
import { testSeries, getFreeTestSeries, getPaidTestSeries } from '@/data';
import { 
  heroTextVariants, 
  fadeUpVariants, 
  staggerContainer, 
  useScrollReveal 
} from '@/utilities/animations';

export default function Home() {
  const scrollReveal = useScrollReveal();
  const freeTests = getFreeTestSeries();
  const paidTests = getPaidTestSeries();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.p
                custom={0}
                variants={heroTextVariants}
                className="text-primary text-sm font-medium uppercase tracking-wider"
              >
                Nursing MCQ Test Series
              </motion.p>
              
              <motion.h1
                custom={1}
                variants={heroTextVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight"
              >
                Practice Smarter. Prepare Better.
              </motion.h1>
              
              <motion.p
                custom={2}
                variants={heroTextVariants}
                className="text-lg text-muted max-w-xl"
              >
                Nursing-focused test series designed to help you practice MCQs, test your preparation, and understand where you need to improve.
              </motion.p>
              
              <motion.div
                custom={3}
                variants={heroTextVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button href="/test-series" size="lg">
                  Explore Test Series
                </Button>
                <Button href="#sample-mcq" variant="outline" size="lg">
                  Try Free Test
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="relative"
            >
              <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg">
                <div className="bg-primary/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted font-medium">Question 12 of 50</span>
                    <span className="text-sm text-muted font-medium">32:18</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted mb-2">Question 12</p>
                    <p className="text-sm text-dark font-medium mb-4">
                      Which of the following is the normal adult respiratory rate?
                    </p>
                    
                    <div className="space-y-2">
                      {['8–10/min', '12–20/min', '22–30/min', '30–40/min'].map((option, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm text-muted p-2 border border-border rounded">
                          <div className="w-5 h-5 rounded border border-border flex items-center justify-center">
                            <span className="text-xs">{String.fromCharCode(65 + i)}</span>
                          </div>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Free Test Series Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Start with Free Tests"
            description="Try the first two test series before unlocking the complete practice experience."
            align="center"
          />
          
          <motion.div
            {...scrollReveal}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {freeTests.map((test) => (
              <motion.div key={test.id} variants={fadeUpVariants}>
                <TestSeriesCard testSeries={test} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Paid Test Series Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="More Tests. More Practice."
            align="center"
          />
          
          <motion.div
            {...scrollReveal}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paidTests.map((test) => (
              <motion.div key={test.id} variants={fadeUpVariants}>
                <TestSeriesCard testSeries={test} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Sample MCQ Section */}
      <section id="sample-mcq" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="See how practice works"
            description="Try a sample question to experience our MCQ interface."
            align="center"
          />
          
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
            className="mt-12"
          >
            <SampleQuestion />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="How it works"
            align="center"
          />
          
          <motion.div
            {...scrollReveal}
            variants={staggerContainer}
            className="mt-12"
          >
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="h-full bg-primary"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { step: '01', title: 'Choose a Test', description: 'Select a nursing test series.' },
                  { step: '02', title: 'Attempt MCQs', description: 'Answer questions in a timed test environment.' },
                  { step: '03', title: 'Submit', description: 'Complete and submit your test.' },
                  { step: '04', title: 'Review Results', description: 'See your score and review your performance.' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUpVariants}
                    className="relative text-center"
                  >
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-dark mb-2">{item.title}</h3>
                    <p className="text-sm text-muted">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-4xl mx-auto">
          <CreatorSection />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Ready to test your preparation?
            </h2>
            <p className="text-lg text-muted mb-8">
              Start with the first two test series for free.
            </p>
            <Button href="/test-series" size="lg">
              Start Free Test
            </Button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}