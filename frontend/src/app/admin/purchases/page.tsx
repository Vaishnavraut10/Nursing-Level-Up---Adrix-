'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock purchase data
    const mockPurchases = [
      { id: 1, user_name: 'Rahul Sharma', user_email: 'student1@example.com', test_series_title: 'Test Series 03', amount: 199, provider: 'MOCK', payment_id: 'pay_mock_123', order_id: 'order_mock_123', status: 'SUCCESS', created_at: '2024-01-12' },
      { id: 2, user_name: 'Amit Kumar', user_email: 'student3@example.com', test_series_title: 'Test Series 03', amount: 199, provider: 'MOCK', payment_id: 'pay_mock_124', order_id: 'order_mock_124', status: 'SUCCESS', created_at: '2024-01-13' },
      { id: 3, user_name: 'Sneha Singh', user_email: 'student4@example.com', test_series_title: 'Test Series 04', amount: 199, provider: 'MOCK', payment_id: 'pay_mock_125', order_id: 'order_mock_125', status: 'SUCCESS', created_at: '2024-01-14' },
    ];
    
    setPurchases(mockPurchases);
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
        <h1 className="text-2xl font-bold text-dark">Purchases</h1>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Student</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Test Series</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Provider</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-4 px-6 text-sm text-dark">{purchase.user_name}</td>
                  <td className="py-4 px-6 text-sm text-muted">{purchase.user_email}</td>
                  <td className="py-4 px-6 text-sm text-dark">{purchase.test_series_title}</td>
                  <td className="py-4 px-6 text-sm text-dark">₹{purchase.amount}</td>
                  <td className="py-4 px-6 text-sm text-muted">{purchase.provider}</td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2 py-1 rounded ${
                      purchase.status === 'SUCCESS' ? 'bg-success/10 text-success' : 
                      purchase.status === 'PENDING' ? 'bg-warning/10 text-warning' : 
                      purchase.status === 'FAILED' ? 'bg-error/10 text-error' : 
                      'bg-muted/10 text-muted'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted">{purchase.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}