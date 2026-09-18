'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Course } from '@/data';
import { cardHoverVariants, imageZoomVariants, scaleGlowVariants } from '@/utilities/animations';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // Unsplash source URLs for nursing/medical imagery
  const imageUrls = {
    '1': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', // Medical-surgical
    '2': 'https://images.unsplash.com/photo-158785469253606-bad439897259?w=800&auto=format&fit=crop&q=80', // Pharmacology
    '3': 'https://images.unsplash.com/photo-1559757175-0eb30cd8e063?w=800&auto=format&fit=crop&q=80', // Community health
    '4': 'https://images.unsplash.com/photo-1559757175-3f4e59d3378e?w=800&auto=format&fit=crop&q=80', // Pediatric
    '5': 'https://images.unsplash.com/photo-1628268695304-69cfa339e690?w=800&auto=format&fit=crop&q=80', // Mental health
    '6': 'https://images.unsplash.com/photo-1587351021755-663d4fe5f76c?w=800&auto=format&fit=crop&q=80', // Maternal
  };

  const courseImage = imageUrls[course.id as keyof typeof imageUrls] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      className="relative"
    >
      <Link href={`/courses/${course.id}`} className="block">
        <motion.div
          variants={scaleGlowVariants}
          whileHover="hover"
          className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          <div className="relative overflow-hidden">
            <motion.div
              variants={imageZoomVariants}
              className="aspect-video relative"
            >
              <img
                src={courseImage}
                alt={course.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Floating badge */}
              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium"
              >
                {course.category}
              </motion.div>
            </motion.div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold text-dark mb-2 line-clamp-2">
              {course.name}
            </h3>
            <p className="text-muted text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted mb-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{course.mcqCount}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{course.testCount}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">
                ₹{course.price.toLocaleString()}
              </span>
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className="text-primary font-medium text-sm flex items-center"
              >
                View Course
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}