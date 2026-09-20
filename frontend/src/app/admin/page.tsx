'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from backend
    // For now, use mock data
    setTimeout(() => {
      setStats({
        statistics: {
          totalUsers: 5,
          totalTestSeries: 5,
          paidTestSeries: 3,
          totalPurchases: 3,
          totalAttempts: 4,
          revenue: 597
        },
        recentRegistrations: [
          { id: 5, email: 'student5@example.com', name: 'Vikram Joshi', created_at: '2024-01-15' },
          { id: 4, email: 'student4@example.com', name: 'Sneha Singh', created_at: '2024-01-14' },
          { id: 3, email: 'student3@example.com', name: 'Amit Kumar', created_at: '2024-01-13' },
        ],
        recentPurchases: [
          { id: 3, name: 'Sneha Singh', test_series_title: 'Test Series 04', amount: 199, status: 'SUCCESS' },
          { id: 2, name: 'Amit Kumar', test_series_title: 'Test Series 03', amount: 199, status: 'SUCCESS' },
          { id: 1, name: 'Rahul Sharma', test_series_title: 'Test Series 03', amount: 199, status: 'SUCCESS' },
        ],
        recentAttempts: [
          { id: 4, name: 'Vikram Joshi', test_series_title: 'Test Series 01', score: 40, submitted_at: '2024-01-15' },
          { id: 3, name: 'Sneha Singh', test_series_title: 'Test Series 01', score: 45, submitted_at: '2024-01-14' },
          { id: 2, name: 'Amit Kumar', test_series_title: 'Test Series 01', score: 42, submitted_at: '2024-01-13' },
        ],
        testSeriesOverview: [
          { id: 1, title: 'Test Series 01', is_free: true, price: 0, status: 'PUBLISHED', question_count: 50 },
          { id: 2, title: 'Test Series 02', is_free: true, price: 0, status: 'PUBLISHED', question_count: 50 },
          { id: 3, title: 'Test Series 03', is_free: false, price: 199, status: 'PUBLISHED', question_count: 50 },
          { id: 4, title: 'Test Series 04', is_free: false, price: 199, status: 'PUBLISHED', question_count: 50 },
          { id: 5, title: 'Test Series 05', is_free: false, price: 199, status: 'DRAFT', question_count: 50 },
        ]
      });
      setLoading(false);
    }, 500);
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Users" value={stats.statistics.totalUsers} />
          <StatCard label="Test Series" value={stats.statistics.totalTestSeries} />
          <StatCard label="Paid Series" value={stats.statistics.paidTestSeries} />
          <StatCard label="Purchases" value={stats.statistics.totalPurchases} />
          <StatCard label="Attempts" value={stats.statistics.totalAttempts} />
          <StatCard label="Revenue" value={`₹${stats.statistics.revenue}`} />
        </div>

        {/* Recent Registrations */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Recent Registrations</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted">Name</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Email</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRegistrations.map((user: any) => (
                <tr key={user.id} className="border-b border-border">
                  <td className="py-3 text-sm text-dark">{user.name}</td>
                  <td className="py-3 text-sm text-muted">{user.email}</td>
                  <td className="py-3 text-sm text-muted">{user.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Purchases */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Recent Purchases</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted">Student</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Test Series</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Amount</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPurchases.map((purchase: any) => (
                <tr key={purchase.id} className="border-b border-border">
                  <td className="py-3 text-sm text-dark">{purchase.name}</td>
                  <td className="py-3 text-sm text-muted">{purchase.test_series_title}</td>
                  <td className="py-3 text-sm text-dark">₹{purchase.amount}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      purchase.status === 'SUCCESS' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Attempts */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Recent Attempts</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted">Student</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Test Series</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Score</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAttempts.map((attempt: any) => (
                <tr key={attempt.id} className="border-b border-border">
                  <td className="py-3 text-sm text-dark">{attempt.name}</td>
                  <td className="py-3 text-sm text-muted">{attempt.test_series_title}</td>
                  <td className="py-3 text-sm text-dark font-semibold">{attempt.score}/50</td>
                  <td className="py-3 text-sm text-muted">{attempt.submitted_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Test Series Overview */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Test Series Overview</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted">Title</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Price</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Questions</th>
                <th className="text-left py-2 text-sm font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.testSeriesOverview.map((ts: any) => (
                <tr key={ts.id} className="border-b border-border">
                  <td className="py-3 text-sm text-dark">{ts.title}</td>
                  <td className="py-3 text-sm text-dark">
                    {ts.is_free ? 'FREE' : `₹${ts.price}`}
                  </td>
                  <td className="py-3 text-sm text-muted">{ts.question_count}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ts.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 
                      ts.status === 'DRAFT' ? 'bg-warning/10 text-warning' : 
                      'bg-muted/10 text-muted'
                    }`}>
                      {ts.status}
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <p className="text-sm text-muted mb-2">{label}</p>
      <p className="text-2xl font-bold text-dark">{value}</p>
    </div>
  );
}