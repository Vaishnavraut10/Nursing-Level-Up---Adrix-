'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Badge, Button, Card, Field, Input, Table, Td, Th } from '@/components/ui';
import { formatBytes, formatDate } from '@/lib/format';
import { COMMON_NOTE_SUBJECTS, COMMON_PYQ_EXAMS } from '@/lib/notes';
import type { Note, NoteFileType, NoteMaterialType } from '@/types';

interface CourseOption {
  id: string;
  title: string;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const d = data as { error?: string | { message?: string } | unknown };
  if (typeof d.error === 'string') return d.error;
  if (d.error && typeof d.error === 'object' && 'message' in d.error && typeof (d.error as { message?: unknown }).message === 'string') {
    return (d.error as { message: string }).message;
  }
  return fallback;
}

function MaterialBadge({ type }: { type: NoteMaterialType }) {
  if (type === 'PYQ') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-200">
        <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        PYQ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
      Note
    </span>
  );
}

function FileTypeBadge({ type }: { type: NoteFileType }) {
  if (type === 'PDF') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
        <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        PDF
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
      <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
      {type === 'DOCX' ? 'Word (.docx)' : 'Word (.doc)'}
    </span>
  );
}

export function AdminNotesClient({
  notes,
  courses,
}: {
  notes: Note[];
  courses: CourseOption[];
}) {
  const router = useRouter();

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<NoteMaterialType>('NOTE');
  const [examName, setExamName] = useState('');
  const [examYear, setExamYear] = useState('');
  const [subject, setSubject] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editMaterialType, setEditMaterialType] = useState<NoteMaterialType>('NOTE');
  const [editExamName, setEditExamName] = useState('');
  const [editExamYear, setEditExamYear] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublished, setEditPublished] = useState(true);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openUploadModal() {
    setFile(null);
    setTitle('');
    setMaterialType('NOTE');
    setExamName('');
    setExamYear('');
    setSubject('');
    setCourseId('');
    setDescription('');
    setIsPublished(true);
    setUploadError(null);
    setIsUploadOpen(true);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (!title.trim()) {
      const baseName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' ');
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a PDF or Word document file');
      return;
    }
    if (!title.trim()) {
      setUploadError('Please enter a title');
      return;
    }

    setUploadBusy(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('materialType', materialType);
      if (materialType === 'PYQ') {
        if (examName.trim()) formData.append('examName', examName.trim());
        if (examYear.trim()) formData.append('examYear', examYear.trim());
      }
      if (subject.trim()) formData.append('subject', subject.trim());
      if (courseId) formData.append('courseId', courseId);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('isPublished', String(isPublished));

      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Failed to upload document'));
      }

      setIsUploadOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadBusy(false);
    }
  }

  function openEditModal(note: Note) {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditMaterialType(note.material_type || 'NOTE');
    setEditExamName(note.exam_name || '');
    setEditExamYear(note.exam_year ? String(note.exam_year) : '');
    setEditSubject(note.subject || '');
    setEditCourseId(note.course_id || '');
    setEditDescription(note.description || '');
    setEditPublished(note.is_published);
    setEditError(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNote) return;
    if (!editTitle.trim()) {
      setEditError('Title is required');
      return;
    }

    setEditBusy(true);
    setEditError(null);

    try {
      const payload: {
        title: string;
        materialType: NoteMaterialType;
        examName: string | null;
        examYear: number | null;
        subject: string | null;
        courseId: string | null;
        description: string | null;
        isPublished: boolean;
      } = {
        title: editTitle.trim(),
        materialType: editMaterialType,
        examName: editMaterialType === 'PYQ' && editExamName.trim() ? editExamName.trim() : null,
        examYear: editMaterialType === 'PYQ' && editExamYear.trim() && !isNaN(Number(editExamYear)) ? Number(editExamYear) : null,
        subject: editSubject.trim() || null,
        courseId: editCourseId || null,
        description: editDescription.trim() || null,
        isPublished: editPublished,
      };

      const res = await fetch(`/api/admin/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Failed to update document'));
      }

      setEditingNote(null);
      router.refresh();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete() {
    if (!deletingNote) return;
    setDeleteBusy(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/notes/${deletingNote.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Failed to delete note'));
      }

      setDeletingNote(null);
      router.refresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          Upload and manage study notes, revision materials, and Previous Year Question papers (PYQs) in PDF or Word format.
        </p>
        <Button onClick={openUploadModal}>
          + Upload Note / PYQ
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Type</Th>
            <Th>Title & Details</Th>
            <Th>Subject / Exam</Th>
            <Th>Course</Th>
            <Th>File</Th>
            <Th className="text-right">Size</Th>
            <Th className="text-right">Downloads</Th>
            <Th>Status</Th>
            <Th>Uploaded</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n.id} className="hover:bg-sunken/40">
              <Td>
                <MaterialBadge type={n.material_type} />
              </Td>
              <Td className="max-w-xs">
                <div className="font-medium text-ink">{n.title}</div>
                {n.material_type === 'PYQ' && (n.exam_name || n.exam_year) && (
                  <div className="mt-0.5 text-xs font-semibold text-purple-700">
                    {[n.exam_name, n.exam_year].filter(Boolean).join(' · ')}
                  </div>
                )}
                {n.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{n.description}</p>
                )}
              </Td>
              <Td>
                {n.subject ? (
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {n.subject}
                  </span>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </Td>
              <Td className="max-w-[150px] truncate">
                {n.course_title ? (
                  <span className="text-xs font-medium text-ink-2">{n.course_title}</span>
                ) : (
                  <span className="text-xs text-muted">All Students</span>
                )}
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <FileTypeBadge type={n.file_type} />
                  <span className="max-w-[120px] truncate text-xs text-muted" title={n.file_name}>
                    {n.file_name}
                  </span>
                </div>
              </Td>
              <Td className="text-right tabular-nums text-xs text-muted">{formatBytes(n.size_bytes)}</Td>
              <Td className="text-right tabular-nums font-medium text-ink">
                <span className="inline-flex items-center gap-1">
                  <svg className="size-3 text-muted" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v7.586l-2.293-2.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 11.586V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {n.download_count}
                </span>
              </Td>
              <Td>
                {n.is_published ? (
                  <Badge tone="ok">Published</Badge>
                ) : (
                  <Badge tone="warn">Draft</Badge>
                )}
              </Td>
              <Td className="whitespace-nowrap text-xs text-muted">{formatDate(n.created_at)}</Td>
              <Td className="whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={`/api/notes/${n.id}/download`}
                    download
                    className="rounded p-1 text-muted hover:bg-sunken hover:text-brand-600 transition-colors"
                    title="Download File"
                  >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditModal(n)}
                    className="rounded p-1 text-muted hover:bg-sunken hover:text-ink transition-colors"
                    title="Edit Details"
                  >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeletingNote(n); setDeleteError(null); }}
                    className="rounded p-1 text-muted hover:bg-sunken hover:text-rose-600 transition-colors"
                    title="Delete Note"
                  >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </Td>
            </tr>
          ))}
          {notes.length === 0 && (
            <tr>
              <Td colSpan={10} className="py-12 text-center text-muted">
                No study notes or PYQs found. Click &quot;Upload Note / PYQ&quot; to upload your first material.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 text-left"
          role="dialog"
          aria-modal="true"
          onClick={() => !uploadBusy && setIsUploadOpen(false)}
        >
          <Card className="animate-fade-up w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h2 className="text-lg font-semibold text-ink">Upload Study Note / PYQ</h2>
              <button
                type="button"
                onClick={() => !uploadBusy && setIsUploadOpen(false)}
                className="text-muted hover:text-ink text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpload} className="mt-4 space-y-4">
              {uploadError && <Alert>{uploadError}</Alert>}

              {/* Material Type Selection: Study Note vs PYQ */}
              <Field label="Material Category" htmlFor="material-category" required>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMaterialType('NOTE')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      materialType === 'NOTE'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-line bg-surface text-ink-2 hover:bg-sunken'
                    }`}
                  >
                    <span>📖 Study Note / Handout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType('PYQ')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      materialType === 'PYQ'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                        : 'border-line bg-surface text-ink-2 hover:bg-sunken'
                    }`}
                  >
                    <span>📝 Previous Year Question (PYQ)</span>
                  </button>
                </div>
              </Field>

              {/* File Input */}
              <Field label="Document File (.pdf, .docx, .doc)" htmlFor="note-file" required>
                <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-line-strong px-6 py-5 hover:border-brand-300 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto size-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="flex text-sm text-ink-2">
                      <label htmlFor="note-file" className="relative cursor-pointer font-semibold text-brand-600 hover:text-brand-700">
                        <span>Select a file</span>
                        <input
                          id="note-file"
                          name="note-file"
                          type="file"
                          accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                          className="sr-only"
                          onChange={handleFileSelected}
                          disabled={uploadBusy}
                        />
                      </label>
                      <p className="pl-1 text-muted">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted">PDF or Word files up to 50 MB</p>
                  </div>
                </div>
                {file && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-sunken px-3 py-2 text-xs">
                    <span className="font-medium text-ink truncate max-w-[280px]">{file.name}</span>
                    <span className="text-muted tabular-nums">{formatBytes(file.size)}</span>
                  </div>
                )}
              </Field>

              {/* Title */}
              <Field label="Title" htmlFor="note-title" required>
                <Input
                  id="note-title"
                  type="text"
                  required
                  placeholder={
                    materialType === 'PYQ'
                      ? 'e.g. NORCET 2024 Stage 1 Question Paper with Key'
                      : 'e.g. Pharmacology - Cardiovascular Drugs Summary'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploadBusy}
                />
              </Field>

              {/* PYQ-Specific Details (Exam Name & Year) */}
              {materialType === 'PYQ' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-purple-200 bg-purple-50/40 p-3.5">
                  <Field label="Exam Name" htmlFor="note-exam">
                    <input
                      id="note-exam"
                      list="exams-list"
                      type="text"
                      placeholder="e.g. NORCET (AIIMS), GMCH"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-surface px-3 py-2 text-sm text-ink focus:border-purple-500 focus:outline-none"
                      disabled={uploadBusy}
                    />
                    <datalist id="exams-list">
                      {COMMON_PYQ_EXAMS.map((ex) => (
                        <option key={ex} value={ex} />
                      ))}
                    </datalist>
                  </Field>

                  <Field label="Exam Year" htmlFor="note-year">
                    <input
                      id="note-year"
                      type="number"
                      min={1990}
                      max={2050}
                      placeholder="e.g. 2024"
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-surface px-3 py-2 text-sm text-ink focus:border-purple-500 focus:outline-none"
                      disabled={uploadBusy}
                    />
                  </Field>
                </div>
              )}

              {/* Subject */}
              <Field label="Subject / Topic" htmlFor="note-subject">
                <input
                  id="note-subject"
                  list="subjects-list"
                  type="text"
                  placeholder="e.g. Pharmacology, Anatomy, Comprehensive"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={uploadBusy}
                />
                <datalist id="subjects-list">
                  {COMMON_NOTE_SUBJECTS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>

              {/* Course */}
              <Field label="Link to Course (Optional)" htmlFor="note-course">
                <select
                  id="note-course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={uploadBusy}
                >
                  <option value="">General (All students)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Description */}
              <Field label="Description (Optional)" htmlFor="note-desc">
                <textarea
                  id="note-desc"
                  rows={2}
                  placeholder="Brief summary or question paper notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={uploadBusy}
                />
              </Field>

              {/* Published checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="size-4 rounded border-line text-brand-600 focus:ring-brand-500"
                  disabled={uploadBusy}
                />
                <span className="text-sm font-medium text-ink">Publish immediately for students</span>
              </label>

              <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="secondary" type="button" onClick={() => setIsUploadOpen(false)} disabled={uploadBusy}>
                  Cancel
                </Button>
                <Button type="submit" loading={uploadBusy}>
                  Upload Material
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 text-left"
          role="dialog"
          aria-modal="true"
          onClick={() => !editBusy && setEditingNote(null)}
        >
          <Card className="animate-fade-up w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h2 className="text-lg font-semibold text-ink">Edit Material Details</h2>
              <button
                type="button"
                onClick={() => !editBusy && setEditingNote(null)}
                className="text-muted hover:text-ink text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              {editError && <Alert>{editError}</Alert>}

              <Field label="Category" htmlFor="edit-material-category" required>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditMaterialType('NOTE')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2 text-xs font-semibold ${
                      editMaterialType === 'NOTE'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-line bg-surface text-ink-2'
                    }`}
                  >
                    <span>📖 Study Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaterialType('PYQ')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2 text-xs font-semibold ${
                      editMaterialType === 'PYQ'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                        : 'border-line bg-surface text-ink-2'
                    }`}
                  >
                    <span>📝 PYQ</span>
                  </button>
                </div>
              </Field>

              <Field label="Title" htmlFor="edit-title" required>
                <Input
                  id="edit-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={editBusy}
                />
              </Field>

              {editMaterialType === 'PYQ' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-purple-200 bg-purple-50/40 p-3.5">
                  <Field label="Exam Name" htmlFor="edit-exam">
                    <input
                      id="edit-exam"
                      list="edit-exams-list"
                      type="text"
                      value={editExamName}
                      onChange={(e) => setEditExamName(e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-surface px-3 py-2 text-sm text-ink focus:border-purple-500 focus:outline-none"
                      disabled={editBusy}
                    />
                    <datalist id="edit-exams-list">
                      {COMMON_PYQ_EXAMS.map((ex) => (
                        <option key={ex} value={ex} />
                      ))}
                    </datalist>
                  </Field>

                  <Field label="Exam Year" htmlFor="edit-year">
                    <input
                      id="edit-year"
                      type="number"
                      min={1990}
                      max={2050}
                      value={editExamYear}
                      onChange={(e) => setEditExamYear(e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-surface px-3 py-2 text-sm text-ink focus:border-purple-500 focus:outline-none"
                      disabled={editBusy}
                    />
                  </Field>
                </div>
              )}

              <Field label="Subject / Topic" htmlFor="edit-subject">
                <input
                  id="edit-subject"
                  list="edit-subjects-list"
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={editBusy}
                />
                <datalist id="edit-subjects-list">
                  {COMMON_NOTE_SUBJECTS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>

              <Field label="Link to Course (Optional)" htmlFor="edit-course">
                <select
                  id="edit-course"
                  value={editCourseId}
                  onChange={(e) => setEditCourseId(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={editBusy}
                >
                  <option value="">General (All students)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Description (Optional)" htmlFor="edit-desc">
                <textarea
                  id="edit-desc"
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={editBusy}
                />
              </Field>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="size-4 rounded border-line text-brand-600 focus:ring-brand-500"
                  disabled={editBusy}
                />
                <span className="text-sm font-medium text-ink">Published (visible to students)</span>
              </label>

              <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="secondary" type="button" onClick={() => setEditingNote(null)} disabled={editBusy}>
                  Cancel
                </Button>
                <Button type="submit" loading={editBusy}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 text-left"
          role="dialog"
          aria-modal="true"
          onClick={() => !deleteBusy && setDeletingNote(null)}
        >
          <Card className="animate-fade-up w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Delete this material?</h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to permanently delete &quot;<strong className="text-ink">{deletingNote.title}</strong>&quot;? The file will be removed from storage and will no longer be available for students to download.
            </p>
            {deleteError && <Alert className="mt-3">{deleteError}</Alert>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingNote(null)} disabled={deleteBusy}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleteBusy}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
