'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminUserDetailPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user data
    setUserData({
      user: {
        id: 2,
        email: 'student1@example.com',
        name: 'Rahul Sharma',
        role: 'STUDENT',
        created_at: '2024-01-10',
        last_activity: '2024-01-15'
      },
      purchases: [
        { id: 1, test_series_title: 'Test Series 03', amount: 199, status: 'SUCCESS', created_at: '2024-01-12' }
      ],
      attempts: [
        { id: 1, test_series_title: 'Test Series 01', score: 42, total_questions: 50, started_at: '2024-01-13', submitted_at: '2024-01-13', status: 'COMPLETED' },
        { id: 2, test_series_title: 'Test Series 02', score: 38, total_questions: 50, started_at: '2024-01-14', submitted_at: '2024-01-14', status: 'COMPLETED' }
      ],
      progress: {
        totalAttempts: 2,
        completedAttempts: 2,
        averageScore: 40,
        bestScore: 42
      }
    });
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
      <div className="space-y-8">
        <div>
          <Link href="/admin/users" className="text-primary hover:underline text-sm">
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-dark mt-2">{userData.user.name}</h1>
          <p className="text-muted">{userData.user.email}</p>
        </div>

        {/* User Information */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Student Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted">Name</p>
              <p className="text-dark">{userData.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Email</p>
              <p className="text-dark">{userData.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Registered</p>
              <p className="text-dark">{userData.user.created_at}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Last Activity</p>
              <p className="text-dark">{userData.user.last_activity}</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Overall Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted">Total Attempts</p>
              <p className="text-2xl font-bold text-dark">{userData.progress.totalAttempts}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Completed</p>
              <p className="text-2xl font-bold text-dark">{userData.progress.completedAttempts}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Average Score</p>
              <p className="text-2xl font-bold text-dark">{userData.progress.averageScore}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Best Score</p>
              <p className="text-2xl font-bold text-dark">{userData.progress.bestScore}</p>
            </div>
          </div>
        </div>

        {/* Purchased Test Series */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Purchased Test Series</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted">Test Series</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Amount</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Status</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {userData.purchases.map((purchase: any) => (
                <tr key={purchase.id} className="border-b border-border">
                  <td className="py-3 text-sm text-dark">{purchase.test_series_title}</td>
                  <td className="py-3 text-sm text-dark">₹{purchase.amount}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                      {purchase.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-muted">{purchase.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Test Activity */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Test Activity</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted">Test Series</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Started</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Submitted</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Score</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {userData.attempts.map((attempt: any) => (
                <tr key={attempt.id} className="border-b border-border">
                  <td className="py-3 text-sm text-dark">{attempt.test_series_title}</td>
                  <td className="py-3 text-sm text-muted">{attempt.started_at}</td>
                  <td className="py-3 text-sm text-muted">{attempt.submitted_at}</td>
                  <td className="py-3 text-sm text-dark font-semibold">{attempt.score}/{attempt.total_questions}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                      {attempt.status}
                    </span>
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