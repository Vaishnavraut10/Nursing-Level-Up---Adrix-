'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { fetchWithAdminAuth } from '@/lib/adminAuth';

export default function AdminAttemptsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await fetchWithAdminAuth('http://localhost:5000/api/admin/attempts');
        
        if (response.ok) {
          const data = await response.json();
          setAttempts(data);
        } else {
          console.error('Failed to fetch attempts:', response.status);
          setError('Unable to load attempts. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching attempts:', error);
        setError(error instanceof Error ? error.message : 'Unable to connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
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

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-dark">Attempts / Results</h1>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Student</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Test Series</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Score</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Started</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Submitted</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-4 px-6 text-sm text-dark">{attempt.user_name}</td>
                  <td className="py-4 px-6 text-sm text-muted">{attempt.user_email}</td>
                  <td className="py-4 px-6 text-sm text-dark">{attempt.test_series_title}</td>
                  <td className="py-4 px-6 text-sm text-dark font-semibold">{attempt.score}/{attempt.total_questions}</td>
                  <td className="py-4 px-6 text-sm text-muted">{attempt.started_at}</td>
                  <td className="py-4 px-6 text-sm text-muted">{attempt.submitted_at}</td>
                  <td className="py-4 px-6">
                    <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                      {attempt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <a href={`/admin/attempts/${attempt.id}`} className="text-primary hover:underline text-sm">
                      View Details
                    </a>
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