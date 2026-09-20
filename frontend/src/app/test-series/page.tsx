'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import TestSeriesCard from '@/components/TestSeriesCard';
import { fadeUpVariants, staggerContainer, useScrollReveal } from '@/utilities/animations';

interface TestSeries {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  isFree: boolean;
  price?: number;
  topics: string[];
}

export default function TestSeriesPage() {
  const scrollReveal = useScrollReveal();
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch test series from backend API
    const fetchTestSeries = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/test-series');
        if (response.ok) {
          const data = await response.json();
          setTestSeries(data);
        } else {
          // Fallback to mock data if backend is not available
          console.log('Backend not available, using mock data');
          // Import mock data as fallback
          const { testSeries: mockTestSeries } = await import('@/data/testSeries');
          setTestSeries(mockTestSeries);
        }
      } catch (error) {
        console.error('Failed to fetch test series:', error);
        // Fallback to mock data
        const { testSeries: mockTestSeries } = await import('@/data/testSeries');
        setTestSeries(mockTestSeries);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, []);

  const freeTests = testSeries.filter(ts => ts.isFree);
  const paidTests = testSeries.filter(ts => !ts.isFree);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted">Loading...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-dark mb-2">Nursing Test Series</h1>
          <p className="text-muted">Choose a test series and start practicing.</p>
        </div>

        {/* Free Test Series */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-dark mb-6">Start with Free Tests</h2>
          <p className="text-muted mb-6">Try the first two test series before unlocking the complete practice experience.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeTests.map((test) => (
              <TestSeriesCard key={test.id} testSeries={test} />
            ))}
          </div>
        </div>

        {/* Paid Test Series */}
        <div>
          <h2 className="text-xl font-semibold text-dark mb-6">More Tests. More Practice.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidTests.map((test) => (
              <TestSeriesCard key={test.id} testSeries={test} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}