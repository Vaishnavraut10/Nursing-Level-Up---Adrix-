'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';

export default function TestSeriesDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [testSeries, setTestSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setTestSeries({
      id: 1,
      title: 'Test Series 01',
      description: 'Foundation nursing concepts covering basic principles and patient care fundamentals.',
      duration: 45,
      is_free: true,
      price: 0,
      status: 'PUBLISHED',
      question_count: 50
    });
    setLoading(false);
  }, []);

  const handlePublish = async () => {
    // API call to publish
    console.log('Publishing test series');
  };

  const handleUnpublish = async () => {
    // API call to unpublish
    console.log('Unpublishing test series');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Link href="/admin/test-series" className="text-primary hover:underline text-sm">
            ← Back to Test Series
          </Link>
          <h1 className="text-2xl font-bold text-dark mt-2">{testSeries.title}</h1>
        </div>

        {/* Basic Information */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted">Title</p>
              <p className="text-dark">{testSeries.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Duration</p>
              <p className="text-dark">{testSeries.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-muted">Price</p>
              <p className="text-dark">{testSeries.is_free ? 'FREE' : `₹${testSeries.price}`}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Status</p>
              <p className="text-dark">{testSeries.status}</p>
            </div>
          </div>
          <p className="text-muted mt-4">{testSeries.description}</p>
        </div>

        {/* Actions */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/admin/test-series/${testSeries.id}/edit`}
              className="px-4 py-2 border border-border rounded-lg hover:bg-primary/5 transition-colors"
            >
              Edit Details
            </Link>
            <Link
              href={`/admin/test-series/${testSeries.id}/questions`}
              className="px-4 py-2 border border-border rounded-lg hover:bg-primary/5 transition-colors"
            >
              Manage Questions
            </Link>
            <Link
              href={`/admin/test-series/${testSeries.id}/import`}
              className="px-4 py-2 border border-border rounded-lg hover:bg-primary/5 transition-colors"
            >
              Import Questions
            </Link>
            {testSeries.status === 'DRAFT' ? (
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors"
              >
                Publish
              </button>
            ) : (
              <button
                onClick={handleUnpublish}
                className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/80 transition-colors"
              >
                Unpublish
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}