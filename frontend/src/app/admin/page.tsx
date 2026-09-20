'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          setError('Admin authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
          headers: {
            'X-Admin-Auth': adminToken
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Failed to fetch dashboard data:', response.status);
          setError('Unable to load dashboard data. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Unable to connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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