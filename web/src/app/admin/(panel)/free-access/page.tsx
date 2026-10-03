import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/server/session';
import { AdminHeader, parsePage } from '@/components/admin/shared';
import { listGrants, searchCourses } from '@/lib/server/services/freeAccessService';
import { FreeAccessManager } from '@/components/admin/FreeAccessManager';

export const metadata: Metadata = { title: 'Free Access · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminFreeAccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string; status?: 'ACTIVE' | 'REVOKED' }>;
}) {
  await requireAdminPage();
  const sp = searchParams ? await searchParams : {};
  const page = parsePage(sp.page);
  const pageSize = 15;
  const q = sp.q || '';
  const status = sp.status === 'ACTIVE' || sp.status === 'REVOKED' ? sp.status : undefined;

  const [grantsData, courses] = await Promise.all([
    listGrants({ page, pageSize, q, status }),
    searchCourses(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Grant Free Access"
        description="Select a student and a paid course to grant free course access without charging. Manage existing entitlements below."
      />

      <FreeAccessManager
        initialGrants={grantsData.items}
        courses={courses}
        page={grantsData.page}
        totalPages={grantsData.totalPages}
        total={grantsData.total}
        queryParam={q}
        statusParam={status}
      />
    </div>
  );
}
