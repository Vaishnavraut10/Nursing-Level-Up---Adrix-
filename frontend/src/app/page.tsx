'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import GradientButton from '@/components/GradientButton';
import SectionHeading from '@/components/SectionHeading';
import CourseCard from '@/components/CourseCard';
import SampleQuestion from '@/components/SampleQuestion';
import HeroVisual from '@/components/3DHeroVisual';
import ParticleBackground from '@/components/ParticleBackground';
import { courses } from '@/data';
import { 
  heroTextVariants, 
  fadeUpVariants, 
  staggerContainer, 
  useScrollReveal,
  glowPulseVariants 
} from '@/utilities/animations';

export default function Home() {
  const scrollReveal = useScrollReveal();

  const featuredCourses = courses.slice(0, 3);

  return (
    <MainLayout>
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.p
                custom={0}
                variants={heroTextVariants}
                className="text-primary text-sm font-medium uppercase tracking-wider"
              >
                Nursing Courses • MCQ Practice
              </motion.p>
              
              <motion.h1
                custom={1}
                variants={heroTextVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight"
              >
                <span className="gradient-text">Study nursing.</span> Practice with confidence.
              </motion.h1>
              
              <motion.p
                custom={2}
                variants={heroTextVariants}
                className="text-lg text-muted max-w-xl"
              >
                Structured nursing courses and practice MCQs designed to help you learn, test yourself and track your progress.
              </motion.p>
              
              <motion.div
                custom={3}
                variants={heroTextVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <GradientButton href="/courses" size="lg" glow>
                  Explore Courses
                </GradientButton>
                <Button href="#sample-mcq" variant="outline" size="lg">
                  Try a Sample MCQ
                </Button>
              </motion.div>
              
              {/* Stats badges */}
              <motion.div
                custom={4}
                variants={heroTextVariants}
                className="flex items-center space-x-6 pt-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">6</p>
                    <p className="text-xs text-muted">Courses</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">2,500+</p>
                    <p className="text-xs text-muted">MCQs</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">30+</p>
                    <p className="text-xs text-muted">Tests</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="relative"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust / Product Intro Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-dark mb-4">
              Everything you need to practice effectively
            </h2>
          </motion.div>
          
          <motion.div
            {...scrollReveal}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
                title: 'Nursing-focused questions',
                description: 'Practice questions organized around nursing subjects.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: 'Structured courses',
                description: 'Learn by subject instead of searching through random questions.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Clear results',
                description: 'See your score and review your performance after each test.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariants}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-dark mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
        
        <div className="max-w-7xl mx-auto relative">
          <SectionHeading
            title="Choose what you want to practice"
            description="Start with a nursing subject and work through focused MCQs and tests."
            align="center"
          />
          
          <motion.div
            {...scrollReveal}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredCourses.map((course) => (
              <motion.div key={course.id} variants={fadeUpVariants}>
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
            className="text-center mt-12"
          >
            <Button href="/courses" variant="outline">
              View All Courses
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Interactive Sample MCQ Section */}
      <section id="sample-mcq" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
        
        <div className="max-w-7xl mx-auto relative">
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
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
        
        <div className="max-w-7xl mx-auto relative">
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
                  className="h-full bg-gradient-to-r from-primary via-primary-light to-primary"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { step: '01', title: 'Choose a course', description: 'Select a nursing subject to begin', icon: '📚' },
                  { step: '02', title: 'Practice MCQs', description: 'Work through focused questions', icon: '✍️' },
                  { step: '03', title: 'Take tests', description: 'Test your knowledge with timed exams', icon: '⏱️' },
                  { step: '04', title: 'Review results', description: 'Analyze your performance', icon: '📊' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUpVariants}
                    className="relative text-center"
                  >
                    <motion.div
                      variants={glowPulseVariants}
                      animate="animate"
                      className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg"
                    >
                      {item.step}
                    </motion.div>
                    <h3 className="font-semibold text-dark mb-2">{item.title}</h3>
                    <p className="text-sm text-muted">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background -z-10" />
        
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            {...scrollReveal}
            variants={fadeUpVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              <span className="gradient-text">Ready to start practicing?</span>
            </h2>
            <p className="text-lg text-muted mb-8">
              Choose a course and start working through nursing MCQs.
            </p>
            <GradientButton href="/courses" size="lg" glow>
              Explore Courses
            </GradientButton>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}