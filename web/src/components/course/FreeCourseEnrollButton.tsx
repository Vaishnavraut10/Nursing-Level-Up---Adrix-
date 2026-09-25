'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface FreeCourseEnrollButtonProps {
  courseId: string;
}

export function FreeCourseEnrollButton({ courseId }: FreeCourseEnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleEnroll() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to enroll');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-center">
      <div className="rounded-lg bg-emerald-50/80 p-3 text-xs text-emerald-800 border border-emerald-200">
        ✓ Students can access this course without payment
      </div>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      <Button
        onClick={handleEnroll}
        disabled={loading}
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
      >
        {loading ? 'Enrolling...' : 'Access Course / Start Course'}
      </Button>
    </div>
  );
}
