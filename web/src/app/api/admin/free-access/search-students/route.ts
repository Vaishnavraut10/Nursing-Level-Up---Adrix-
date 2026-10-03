import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/session';
import { searchStudents } from '@/lib/server/services/freeAccessService';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const students = await searchStudents(q);
    return NextResponse.json({ students });
  } catch (err: any) {
    const status = err?.status || 500;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status });
  }
}
