'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Badge, Button, Card, Field, Input, Table, Td, Th, cx } from '@/components/ui';
import { formatBytes, formatDate } from '@/lib/format';
import type { Note, NoteFileType } from '@/types';

interface CourseOption {
  id: string;
  title: string;
}

const COMMON_SUBJECTS = [
  'Anatomy & Physiology',
  'Pharmacology',
  'Medical-Surgical Nursing',
  'Community Health Nursing',
  'Pediatric / Child Health',
  'Obstetrics & Gynecology (OBG)',
  'Mental Health / Psychiatric',
  'Nursing Foundations',
  'Microbiology',
  'Nutrition & Biochemistry',
  'Nursing Research & Statistics',
  'Nursing Management & Leadership',
];

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
  const [subject, setSubject] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
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
      // Suggest clean title from filename
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
      setUploadError('Please enter a note title');
      return;
    }

    setUploadBusy(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      if (subject.trim()) formData.append('subject', subject.trim());
      if (courseId) formData.append('courseId', courseId);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('isPublished', String(isPublished));

      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload note');
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
      const res = await fetch(`/api/admin/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          subject: editSubject.trim() || null,
          courseId: editCourseId || null,
          description: editDescription.trim() || null,
          isPublished: editPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update note');
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete note');
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
          Upload lecture slides, handouts, and clinical study notes in PDF or Word format for students to download.
        </p>
        <Button onClick={openUploadModal}>
          + Upload Note
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Title & Description</Th>
            <Th>Subject</Th>
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
              <Td className="max-w-xs">
                <div className="font-medium text-ink">{n.title}</div>
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
                    title="Edit Note"
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
              <Td colSpan={9} className="py-12 text-center text-muted">
                No notes found. Click &quot;Upload Note&quot; to upload your first study material.
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
              <h2 className="text-lg font-semibold text-ink">Upload Study Note</h2>
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
                  placeholder="e.g. Pharmacology - Cardiovascular Drugs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploadBusy}
                />
              </Field>

              {/* Subject */}
              <Field label="Subject / Category" htmlFor="note-subject">
                <input
                  id="note-subject"
                  list="subjects-list"
                  type="text"
                  placeholder="e.g. Pharmacology, Anatomy, Community Health"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
                  disabled={uploadBusy}
                />
                <datalist id="subjects-list">
                  {COMMON_SUBJECTS.map((s) => (
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
                  placeholder="Brief summary or topic outline of this study material"
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
                  Upload Note
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
              <h2 className="text-lg font-semibold text-ink">Edit Study Note</h2>
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

              <Field label="Subject / Category" htmlFor="edit-subject">
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
                  {COMMON_SUBJECTS.map((s) => (
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
            <h2 className="text-lg font-semibold text-ink">Delete this note?</h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to permanently delete &quot;<strong className="text-ink">{deletingNote.title}</strong>&quot;? The file will be removed from storage and will no longer be available for students to download.
            </p>
            {deleteError && <Alert className="mt-3">{deleteError}</Alert>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingNote(null)} disabled={deleteBusy}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleteBusy}>
                Delete Note
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
