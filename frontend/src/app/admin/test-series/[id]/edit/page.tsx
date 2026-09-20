'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';

export default function EditTestSeriesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 45,
    is_free: true,
    price: 199,
    status: 'DRAFT'
  });

  useEffect(() => {
    // Mock initial data
    setFormData({
      title: 'Test Series 01',
      description: 'Foundation nursing concepts covering basic principles and patient care fundamentals.',
      duration: 45,
      is_free: true,
      price: 0,
      status: 'PUBLISHED'
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to update
    console.log('Updating test series:', formData);
    router.push('/admin/test-series');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/admin/test-series/1" className="text-primary hover:underline text-sm">
            ← Back to Test Series
          </Link>
          <h1 className="text-2xl font-bold text-dark mt-2">Edit Test Series</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_free}
                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-dark">Free Test Series</span>
            </label>
          </div>

          {!formData.is_free && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/test-series/1')}
              className="px-6 py-2 border border-border rounded-lg hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}