import { redirect } from 'next/navigation';
import { getCurrentUser, safeNext } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/**
 * Post-login router (PRD §5.2): decided server-side from the database, not client state.
 * Not signed in → /login
 * ADMIN → /admin (unless a specific /admin/... route was targeted)
 * STUDENT → /dashboard (unless completing profile or navigating to a specific student route)
 */
export default async function ContinuePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: rawNext } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (user.role === 'ADMIN') {
    const target = safeNext(rawNext, '/admin');
    redirect(target.startsWith('/admin') ? target : '/admin');
  }

  // Student flow
  const target = safeNext(rawNext, '/dashboard');
  const studentTarget = target.startsWith('/admin') ? '/dashboard' : target;

  if (!user.phone) {
    redirect(`/complete-profile?next=${encodeURIComponent(studentTarget)}`);
  }

  redirect(studentTarget);
}
