'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminTestSeriesPage() {
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data matching the seed data
    const mockTestSeries = [
      { id: 1, title: 'Test Series 01', description: 'Foundation nursing concepts', duration: 45, is_free: true, price: 0, status: 'PUBLISHED', question_count: 50 },
      { id: 2, title: 'Test Series 02', description: 'Intermediate nursing practice', duration: 45, is_free: true, price: 0, status: 'PUBLISHED', question_count: 50 },
      { id: 3, title: 'Test Series 03', description: 'Advanced nursing concepts', duration: 45, is_free: false, price: 199, status: 'PUBLISHED', question_count: 50 },
      { id: 4, title: 'Test Series 04', description: 'Comprehensive nursing practice', duration: 45, is_free: false, price: 199, status: 'PUBLISHED', question_count: 50 },
      { id: 5, title: 'Test Series 05', description: 'Final preparation test series', duration: 45, is_free: false, price: 199, status: 'DRAFT', question_count: 50 },
    ];
    
    setTestSeries(mockTestSeries);
    setLoading(false);
  }, []);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark">Test Series</h1>
          <Link
            href="/admin/test-series/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Test Series
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Title</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Duration</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Price</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Questions</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testSeries.map((ts) => (
                <tr key={ts.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-4 px-6 text-sm text-dark">{ts.title}</td>
                  <td className="py-4 px-6 text-sm text-muted">{ts.duration} min</td>
                  <td className="py-4 px-6 text-sm text-dark">
                    {ts.is_free ? 'FREE' : `₹${ts.price}`}
                  </td>
                  <td className="py-4 px-6 text-sm text-muted">{ts.question_count}</td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ts.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 
                      ts.status === 'DRAFT' ? 'bg-warning/10 text-warning' : 
                      'bg-muted/10 text-muted'
                    }`}>
                      {ts.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/test-series/${ts.id}`} className="text-primary hover:underline text-sm">
                        View
                      </Link>
                      <Link href={`/admin/test-series/${ts.id}/questions`} className="text-primary hover:underline text-sm">
                        Questions
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}