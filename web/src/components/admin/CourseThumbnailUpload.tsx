'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { errorMessage } from '@/lib/api';

interface CourseThumbnailUploadProps {
  courseId: string;
  initialThumbnailUrl?: string | null;
  onThumbnailChange?: (url: string | null) => void;
}

export function CourseThumbnailUpload({
  courseId,
  initialThumbnailUrl,
  onThumbnailChange,
}: CourseThumbnailUploadProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialThumbnailUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevInitial, setPrevInitial] = useState(initialThumbnailUrl);
  if (initialThumbnailUrl !== prevInitial) {
    setPrevInitial(initialThumbnailUrl);
    setThumbnailUrl(initialThumbnailUrl ?? null);
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/admin/courses/${courseId}/thumbnail`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      const newUrl = data.thumbnail_url;
      setThumbnailUrl(newUrl);
      if (onThumbnailChange) onThumbnailChange(newUrl);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Are you sure you want to remove the course thumbnail?')) return;

    setError(null);
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/thumbnail`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to remove thumbnail');
      }

      setThumbnailUrl(null);
      if (onThumbnailChange) onThumbnailChange(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-ink">
          Course Thumbnail Image
        </label>
        {thumbnailUrl && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ok">
            <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Active Thumbnail
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="rounded-lg bg-err-50 p-3 text-xs font-medium text-err border border-err-200/60">
          {error}
        </div>
      )}

      {thumbnailUrl ? (
        <div className="relative group overflow-hidden rounded-xl border border-line bg-surface-2 shadow-xs transition-all">
          {/* Image Preview Container */}
          <div className="relative aspect-video w-full max-h-56 bg-ink/5 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt="Course Thumbnail"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Overlay controls on hover */}
            <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deleting}
                className="bg-white/90 hover:bg-white text-ink font-medium shadow-sm"
              >
                {uploading ? 'Uploading...' : 'Replace Image'}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRemove}
                disabled={uploading || deleting}
                className="shadow-sm"
              >
                {deleting ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-surface flex items-center justify-between border-t border-line/60">
            <span className="text-xs text-muted">Thumbnail dimensions: 16:9 ratio recommended</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deleting}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Change Image
              </button>
              <span className="text-line-strong">·</span>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading || deleting}
                className="text-xs font-semibold text-err hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragOver
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-line hover:border-brand-400 hover:bg-surface-2/60'
          }`}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-transform duration-200 group-hover:scale-110 mb-3">
            {uploading ? (
              <svg className="size-6 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink">
              {uploading ? 'Uploading image...' : 'Click to upload course thumbnail'}
            </p>
            <p className="text-xs text-muted">
              or drag & drop image file here
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-muted">
              PNG, JPG, WEBP, SVG
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-muted">
              Max 10 MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
