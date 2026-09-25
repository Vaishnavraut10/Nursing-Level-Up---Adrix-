import { NextResponse } from 'next/server';
import { route, parseId } from '@/lib/server/http';
import * as svc from '@/lib/server/services/courseService';
import * as storage from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

function getMimeType(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

export const GET = route<{ id: string }>(async (_req, { params }) => {
  const courseId = parseId(params.id, 'Course');
  const course = await svc.getById(courseId);

  if (!course || !course.thumbnail_key) {
    return new NextResponse('Thumbnail not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  try {
    const fileBuffer = await storage.getFile(course.thumbnail_key);
    const contentType = getMimeType(course.thumbnail_key);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('Failed to load course thumbnail from storage:', err);
    return new NextResponse('File storage error', { status: 500 });
  }
});
