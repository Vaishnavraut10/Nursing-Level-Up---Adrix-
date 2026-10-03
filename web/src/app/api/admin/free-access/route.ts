import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/session';
import { grantFreeAccess, listGrants } from '@/lib/server/services/freeAccessService';
import { paginationSchema, uuidSchema } from '@/lib/validation';
import { z } from 'zod';

const grantInputSchema = z.object({
  userId: uuidSchema,
  courseId: uuidSchema,
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      q: searchParams.get('q'),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid pagination query parameters' }, { status: 400 });
    }

    const statusParam = searchParams.get('status');
    const status = statusParam === 'ACTIVE' || statusParam === 'REVOKED' ? statusParam : undefined;

    const result = await listGrants({
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      q: parsed.data.q,
      status,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const status = err?.status || 500;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = grantInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload: userId and courseId are required UUIDs.' },
        { status: 400 },
      );
    }

    const grant = await grantFreeAccess(admin.id, parsed.data.userId, parsed.data.courseId);
    return NextResponse.json({ success: true, grant }, { status: 201 });
  } catch (err: any) {
    const status = err?.status || 400;
    return NextResponse.json({ error: err.message || 'Failed to grant free access' }, { status });
  }
}
