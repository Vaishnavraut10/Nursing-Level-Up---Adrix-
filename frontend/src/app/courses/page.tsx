'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import CourseCard from '@/components/CourseCard';
import SectionHeading from '@/components/SectionHeading';
import { courses } from '@/data';
import { fadeUpVariants, staggerContainer, useScrollReveal } from '@/utilities/animations';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollReveal = useScrollReveal();

  const categories = ['All', ...Array.from(new Set(courses.map(course => course.category)))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeading
          title="Nursing Courses"
          description="Choose a subject and start practicing."
        />
        
        {/* Search and Filters */}
        <motion.div
          {...scrollReveal}
          variants={fadeUpVariants}
          className="mb-8 space-y-4"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-border rounded-lg bg-surface text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-surface text-muted border border-border hover:border-primary hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          {...scrollReveal}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <motion.div key={course.id} variants={fadeUpVariants}>
                <CourseCard course={course} />
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={fadeUpVariants}
              className="col-span-full text-center py-12"
            >
              <p className="text-muted">No courses found matching your criteria.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}