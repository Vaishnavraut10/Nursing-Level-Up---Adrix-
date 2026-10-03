'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, cx } from '@/components/ui';
import { formatDate } from '@/lib/format';
import type { FreeAccessGrantRow } from '@/lib/server/services/freeAccessService';
import type { Course } from '@/types';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface FreeAccessManagerProps {
  initialGrants: FreeAccessGrantRow[];
  courses: Course[];
  page: number;
  totalPages: number;
  total: number;
  queryParam: string;
  statusParam?: 'ACTIVE' | 'REVOKED';
}

export function FreeAccessManager({
  initialGrants,
  courses,
  page,
  totalPages,
  total,
  queryParam,
  statusParam,
}: FreeAccessManagerProps) {
  const router = useRouter();

  // Search student states
  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Selected course state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revokeGrantTarget, setRevokeGrantTarget] = useState<FreeAccessGrantRow | null>(null);

  // Submitting states & notices
  const [isGranting, setIsGranting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Table filter search
  const [tableSearch, setTableSearch] = useState(queryParam || '');

  // Debounced search for students
  const studentSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!studentQuery.trim()) {
      setStudentResults([]);
      setIsSearchingStudents(false);
      return;
    }

    setIsSearchingStudents(true);
    if (studentSearchTimeout.current) clearTimeout(studentSearchTimeout.current);

    studentSearchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/free-access/search-students?q=${encodeURIComponent(studentQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setStudentResults(data.students || []);
        }
      } catch (err) {
        console.error('Failed to search students', err);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 250);

    return () => {
      if (studentSearchTimeout.current) clearTimeout(studentSearchTimeout.current);
    };
  }, [studentQuery]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;

  async function handleGrantSubmit() {
    if (!selectedStudent || !selectedCourse) return;
    setIsGranting(true);
    setNotice(null);

    try {
      const res = await fetch('/api/admin/free-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent.id,
          courseId: selectedCourse.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to grant free access');
      }

      setNotice({
        type: 'success',
        message: `Successfully granted free access for ${selectedStudent.name} on "${selectedCourse.title}".`,
      });

      // Reset selection
      setSelectedStudent(null);
      setStudentQuery('');
      setShowConfirmModal(false);
      router.refresh();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsGranting(false);
    }
  }

  async function handleRevokeSubmit() {
    if (!revokeGrantTarget) return;
    setIsRevoking(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/free-access/${revokeGrantTarget.id}/revoke`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke free access');
      }

      setNotice({
        type: 'success',
        message: `Free access for ${revokeGrantTarget.student_name} on "${revokeGrantTarget.course_title}" has been revoked.`,
      });

      setRevokeGrantTarget(null);
      router.refresh();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to revoke grant.' });
    } finally {
      setIsRevoking(false);
    }
  }

  function handleSearchApply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tableSearch.trim()) params.set('q', tableSearch.trim());
    if (statusParam) params.set('status', statusParam);
    router.push(`/admin/free-access?${params.toString()}`);
  }

  function handleStatusFilter(status?: 'ACTIVE' | 'REVOKED') {
    const params = new URLSearchParams();
    if (tableSearch.trim()) params.set('q', tableSearch.trim());
    if (status) params.set('status', status);
    router.push(`/admin/free-access?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      {/* ── Banner Notice ── */}
      {notice && (
        <div
          className={cx(
            'flex items-center justify-between rounded-xl p-4 text-sm font-medium border shadow-xs',
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200',
          )}
        >
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} className="ml-4 opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* ── Grant Free Access Tool Card ── */}
      <Card className="p-6 border-brand-200/70 bg-surface shadow-sm">
        <div className="flex items-center gap-2 border-b border-line pb-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">Grant Free Course Access</h2>
            <p className="text-xs text-muted">Select a student and a course to grant full course access without charging.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* 1. Student Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
              1. Select Student
            </label>

            {selectedStudent ? (
              <div className="flex items-center justify-between rounded-xl border border-brand-300 bg-brand-50/40 p-3.5">
                <div>
                  <div className="font-semibold text-ink text-sm">{selectedStudent.name}</div>
                  <div className="text-xs text-muted">{selectedStudent.email} {selectedStudent.phone ? `· ${selectedStudent.phone}` : ''}</div>
                  <div className="text-[11px] font-mono text-faint mt-0.5">ID: {selectedStudent.id}</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentQuery('');
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search student by Name, Email, Phone, or User ID..."
                  className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand-500 focus:outline-hidden"
                />

                {isSearchingStudents && (
                  <div className="absolute right-3 top-3 text-xs text-muted">Searching...</div>
                )}

                {/* Dropdown list */}
                {studentQuery.trim() && studentResults.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg">
                    {studentResults.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(st);
                          setStudentResults([]);
                        }}
                        className="w-full text-left rounded-lg p-2.5 hover:bg-sunken transition-colors"
                      >
                        <div className="font-semibold text-ink text-sm">{st.name}</div>
                        <div className="text-xs text-muted">{st.email} {st.phone ? `· ${st.phone}` : ''}</div>
                      </button>
                    ))}
                  </div>
                )}

                {studentQuery.trim() && !isSearchingStudents && studentResults.length === 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-line bg-surface p-3 text-center text-xs text-muted shadow-lg">
                    No matching student found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Course Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
              2. Select Course
            </label>

            {courses.length > 0 ? (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm font-medium text-ink focus:border-brand-500 focus:outline-hidden"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — Normal Price: ₹{c.price} {c.is_free ? '(Free Course)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-muted p-2">No courses available.</div>
            )}

            {selectedCourse && (
              <div className="mt-2 rounded-xl bg-paper/60 p-3 text-xs text-ink-2 border border-line/60 flex items-center justify-between">
                <span>Normal Course Price:</span>
                <span className="font-bold text-ink">₹{selectedCourse.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 border-t border-line pt-4 flex justify-end">
          <Button
            type="button"
            size="md"
            disabled={!selectedStudent || !selectedCourse}
            onClick={() => setShowConfirmModal(true)}
            className="rounded-xl px-6"
          >
            Grant Free Access →
          </Button>
        </div>
      </Card>

      {/* ── Active & Past Grants Table Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">Free Access Grants</h2>
            <p className="text-xs text-muted">List of students currently or previously granted free course access.</p>
          </div>

          {/* Filter Status Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStatusFilter(undefined)}
              className={cx(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                !statusParam ? 'bg-brand-700 text-white' : 'bg-surface border border-line text-muted hover:text-ink',
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilter('ACTIVE')}
              className={cx(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                statusParam === 'ACTIVE' ? 'bg-brand-700 text-white' : 'bg-surface border border-line text-muted hover:text-ink',
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilter('REVOKED')}
              className={cx(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                statusParam === 'REVOKED' ? 'bg-brand-700 text-white' : 'bg-surface border border-line text-muted hover:text-ink',
              )}
            >
              Revoked
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchApply} className="flex gap-2">
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Filter grants by student name, email, phone, or course title..."
            className="flex-1 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-brand-500 focus:outline-hidden"
          />
          <Button type="submit" variant="secondary" size="sm" className="rounded-xl px-4">
            Search
          </Button>
          {queryParam && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl px-3"
              onClick={() => {
                setTableSearch('');
                router.push('/admin/free-access');
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-sunken/60 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Student</th>
                <th className="px-4 py-3.5 font-semibold">Email</th>
                <th className="px-4 py-3.5 font-semibold">Course</th>
                <th className="px-4 py-3.5 font-semibold text-right">Normal Price</th>
                <th className="px-4 py-3.5 font-semibold text-center">Access</th>
                <th className="px-4 py-3.5 font-semibold">Granted By</th>
                <th className="px-4 py-3.5 font-semibold">Granted Date</th>
                <th className="px-4 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {initialGrants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    No free access grants found.
                  </td>
                </tr>
              ) : (
                initialGrants.map((grant) => (
                  <tr key={grant.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-ink">
                      <Link href={`/admin/users/${grant.user_id}`} className="hover:text-brand-600 transition-colors">
                        {grant.student_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-ink-2">{grant.student_email}</td>
                    <td className="px-4 py-3.5 font-medium text-ink max-w-[200px] truncate">{grant.course_title}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-ink tabular-nums">₹{grant.course_price}</td>
                    <td className="px-4 py-3.5 text-center">
                      {grant.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 ring-1 ring-inset ring-emerald-600/30">
                          FREE
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-300">
                          REVOKED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted text-xs">{grant.admin_name || 'Admin'}</td>
                    <td className="px-4 py-3.5 text-muted text-xs tabular-nums">{formatDate(grant.granted_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {grant.status === 'ACTIVE' ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setRevokeGrantTarget(grant)}
                          className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                        >
                          Revoke Access
                        </Button>
                      ) : (
                        <span className="text-xs text-muted italic">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted pt-2">
            <span>{total} total records</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (queryParam) params.set('q', queryParam);
                  if (statusParam) params.set('status', statusParam);
                  params.set('page', String(page - 1));
                  router.push(`/admin/free-access?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (queryParam) params.set('q', queryParam);
                  if (statusParam) params.set('status', statusParam);
                  params.set('page', String(page + 1));
                  router.push(`/admin/free-access?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Grant Confirmation Modal ── */}
      {showConfirmModal && selectedStudent && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-scale-in">
            <div className="border-b border-line bg-sunken/60 p-5">
              <h3 className="font-serif text-lg font-bold text-ink">Grant free access to this course?</h3>
              <p className="mt-1 text-xs text-muted">Confirming will entitle this student to full course access without payment.</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-line bg-paper/60 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider">Student:</span>
                  <span className="font-semibold text-ink">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider">Email:</span>
                  <span className="text-ink-2">{selectedStudent.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-line/50 pt-2">
                  <span className="font-bold text-muted uppercase tracking-wider">Course:</span>
                  <span className="font-semibold text-ink">{selectedCourse.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider">Normal Price:</span>
                  <span className="font-semibold text-ink line-through">₹{selectedCourse.price}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span>Access Price:</span>
                  <span className="text-sm">₹0 (FREE)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-line p-4 flex justify-end gap-2 bg-paper/30">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isGranting}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isGranting}
                onClick={handleGrantSubmit}
                className="rounded-xl px-5"
              >
                {isGranting ? 'Granting...' : 'Grant Free Access'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Revoke Confirmation Modal ── */}
      {revokeGrantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-scale-in">
            <div className="border-b border-line bg-rose-50/60 p-5">
              <h3 className="font-serif text-lg font-bold text-rose-900">Revoke free course access?</h3>
              <p className="mt-1 text-xs text-rose-700">The student will lose their free course entitlement and return to standard paid pricing.</p>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-muted leading-relaxed">
                Are you sure you want to revoke free access for <strong className="text-ink">{revokeGrantTarget.student_name}</strong> on <strong className="text-ink">&quot;{revokeGrantTarget.course_title}&quot;</strong>?
              </p>
              <div className="rounded-xl border border-line bg-paper/60 p-3 text-xs space-y-1.5">
                <div><strong>Email:</strong> {revokeGrantTarget.student_email}</div>
                <div><strong>Granted On:</strong> {formatDate(revokeGrantTarget.granted_at)}</div>
              </div>
            </div>

            <div className="border-t border-line p-4 flex justify-end gap-2 bg-paper/30">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isRevoking}
                onClick={() => setRevokeGrantTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isRevoking}
                onClick={handleRevokeSubmit}
                className="rounded-xl px-5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isRevoking ? 'Revoking...' : 'Revoke Access'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
