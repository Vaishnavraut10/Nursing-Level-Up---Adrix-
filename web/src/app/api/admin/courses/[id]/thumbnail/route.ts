import { route, ok, parseId } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/session';
import * as svc from '@/lib/server/services/courseService';
import * as storage from '@/lib/server/storage';
import { ApiError } from '@/lib/errors';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export const POST = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const id = parseId(params.id, 'Course');

  const course = await svc.adminGet(id);
  if (!course) throw new ApiError(404, 'NOT_FOUND', 'Course not found');

  const formData = await req.formData().catch(() => null);
  if (!formData) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid form data');

  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Please select an image file to upload');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Only image files (JPG, PNG, WEBP, GIF, SVG) are supported');
  }

  if (file.size > MAX_SIZE) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Image file size must be less than 10 MB');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = path.extname(file.name) || '.png';
  const key = `thumbnails/course_${id}_${Date.now()}${ext}`;

  await storage.uploadFile(key, buffer, file.type);

  const oldKey = await svc.updateThumbnailKey(id, key, admin);
  if (oldKey && oldKey !== key) {
    await storage.deleteFile(oldKey).catch((err) => {
      console.warn('Failed to cleanup old thumbnail:', oldKey, err);
    });
  }

  return ok({
    thumbnail_key: key,
    thumbnail_url: `/api/courses/${id}/thumbnail?t=${Date.now()}`,
  });
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const admin = await requireAdmin();
  const id = parseId(params.id, 'Course');

  const oldKey = await svc.updateThumbnailKey(id, null, admin);
  if (oldKey) {
    await storage.deleteFile(oldKey).catch((err) => {
      console.warn('Failed to delete thumbnail file:', oldKey, err);
    });
  }

  return ok({ success: true });
});
