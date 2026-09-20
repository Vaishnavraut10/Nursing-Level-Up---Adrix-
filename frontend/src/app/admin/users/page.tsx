'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Mock data for now
    const mockUsers = [
      { id: 2, email: 'student1@example.com', name: 'Rahul Sharma', role: 'STUDENT', created_at: '2024-01-10', testsAttempted: 2, purchases: 1 },
      { id: 3, email: 'student2@example.com', name: 'Priya Patel', role: 'STUDENT', created_at: '2024-01-11', testsAttempted: 1, purchases: 1 },
      { id: 4, email: 'student3@example.com', name: 'Amit Kumar', role: 'STUDENT', created_at: '2024-01-12', testsAttempted: 1, purchases: 1 },
      { id: 5, email: 'student4@example.com', name: 'Sneha Singh', role: 'STUDENT', created_at: '2024-01-13', testsAttempted: 1, purchases: 1 },
      { id: 6, email: 'student5@example.com', name: 'Vikram Joshi', role: 'STUDENT', created_at: '2024-01-14', testsAttempted: 0, purchases: 0 },
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-dark">Users</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Tests Attempted</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Purchases</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Registered</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-4 px-6 text-sm text-dark">{user.name}</td>
                  <td className="py-4 px-6 text-sm text-muted">{user.email}</td>
                  <td className="py-4 px-6 text-sm text-dark">{user.testsAttempted}</td>
                  <td className="py-4 px-6 text-sm text-dark">{user.purchases}</td>
                  <td className="py-4 px-6 text-sm text-muted">{user.created_at}</td>
                  <td className="py-4 px-6">
                    <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline text-sm">
                      View Details
                    </Link>
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