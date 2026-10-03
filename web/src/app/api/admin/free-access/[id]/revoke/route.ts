import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/session';
import { revokeFreeAccess } from '@/lib/server/services/freeAccessService';
import { uuidSchema } from '@/lib/validation';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid grant ID' }, { status: 400 });
    }

    const grant = await revokeFreeAccess(admin.id, id);
    return NextResponse.json({ success: true, grant });
  } catch (err: any) {
    const status = err?.status || 400;
    return NextResponse.json({ error: err.message || 'Failed to revoke free access' }, { status });
  }
}
