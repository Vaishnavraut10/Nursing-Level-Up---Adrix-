import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/session';
import * as noteService from '@/lib/server/services/noteService';
import * as storage from '@/lib/server/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to view notes' }, { status: 401 });
  }

  const { id } = await params;
  const note = await noteService.getNoteById(id);

  if (!note || (!note.is_published && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  try {
    const buffer = await storage.getFile(note.storage_key);

    const safeFilename = encodeURIComponent(note.file_name);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': note.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${note.file_name.replace(/"/g, '')}"; filename*=UTF-8''${safeFilename}`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Error viewing note file:', err);
    return NextResponse.json({ error: 'Failed to retrieve file from storage' }, { status: 500 });
  }
}

