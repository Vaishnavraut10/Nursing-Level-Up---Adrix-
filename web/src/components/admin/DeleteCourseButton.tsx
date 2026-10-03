'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface DeleteCourseButtonProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  isFree?: boolean;
  purchaseCount?: number;
  status: string;
  onSuccess?: () => void;
}

export function DeleteCourseButton({
  courseId,
  courseTitle,
  coursePrice,
  isFree = false,
  purchaseCount = 0,
  status,
  onSuccess,
}: DeleteCourseButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'DELETED') {
    return <span className="text-xs font-semibold text-muted italic">Deleted</span>;
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="text-sm font-semibold text-rose-600 hover:text-rose-800 hover:underline transition-colors"
      >
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 text-left backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => !busy && setOpen(false)}
        >
          <Card
            className="animate-fade-up w-full max-w-md p-6 shadow-2xl border-line"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-rose-700 mb-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </span>
              <h2 className="font-serif text-lg font-bold text-ink">Delete this course?</h2>
            </div>

            <p className="mt-2 text-xs text-muted leading-relaxed">
              This course and its associated test series/content will be removed from active student-facing listings.
            </p>

            <div className="mt-4 rounded-xl border border-line bg-paper/60 p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted">Course Name:</span>
                <span className="font-semibold text-ink truncate max-w-[200px]">{courseTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted">Base Price:</span>
                <span className="font-semibold text-ink">{isFree || coursePrice === 0 ? 'FREE' : `₹${coursePrice}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted">Students Enrolled:</span>
                <span className="font-semibold text-ink">{purchaseCount} student{purchaseCount === 1 ? '' : 's'}</span>
              </div>
            </div>

            {purchaseCount > 0 && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <svg className="size-4 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Existing Enrolled Students Notice
                </div>
                <p className="text-[11px] leading-relaxed">
                  This course has {purchaseCount} existing student(s)/purchase(s). Deleting it will remove it from active availability while preserving financial & audit history.
                </p>
              </div>
            )}

            {error && <Alert className="mt-4">{error}</Alert>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={busy}
                className="rounded-xl px-4"
              >
                Delete Course
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
