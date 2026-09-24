import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ButtonLink, Card, Container } from '@/components/ui';
import { Checkout } from '@/components/payments/Checkout';
import { requireStudentPage } from '@/lib/server/session';
import { getPublished } from '@/lib/server/services/testSeriesService';
import { getPublishedCourse, hasCoursePurchase } from '@/lib/server/services/courseService';
import { razorpayConfigured } from '@/lib/server/razorpay';
import { formatDate } from '@/lib/format';
import { uuidSchema } from '@/lib/validation';

export const metadata: Metadata = { title: 'Enroll in Course — Nursing Level Up' };
export const dynamic = 'force-dynamic';

export default async function UnlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await requireStudentPage(`/unlock/${id}`);
  const [series, course] = await Promise.all([
    getPublished(id, user),
    getPublishedCourse(),
  ]);

  if (!series || !course) notFound();
  if (series.has_access) redirect(`/tests/${id}`);

  const userHasCourse = await hasCoursePurchase(user.id, course.id);

  // If user already purchased the course but this specific series is upcoming in the drip schedule:
  if (userHasCourse && series.release_state === 'UPCOMING') {
    return (
      <Container className="flex justify-center py-12 sm:py-16">
        <Card className="w-full max-w-lg overflow-hidden text-center p-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">
            <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">Upcoming Test Series</h1>
          <p className="mt-2 text-sm text-muted">
            You own the complete course! This test series is scheduled to unlock as part of your daily practice plan.
          </p>
          <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="text-xs uppercase tracking-wider text-amber-700 font-semibold">Release Date</div>
            <div className="mt-1 font-semibold text-ink text-base">
              {series.releases_at ? new Date(series.releases_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Coming Soon'}
            </div>
            <div className="mt-1 text-xs text-muted">Tests release daily at 5:00 PM IST</div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <ButtonLink href="/test-series" size="lg" className="w-full">
              Explore Available Tests
            </ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary" size="md" className="w-full">
              Go to Dashboard
            </ButtonLink>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="flex justify-center py-12 sm:py-16">
      <Card className="w-full max-w-lg overflow-hidden">
        <div className="border-b border-line bg-sunken/60 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
              Complete Course Access
            </span>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60">
              200+ Test Series
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold leading-snug">{course.title}</h1>
          <p className="mt-2 text-sm text-muted">
            Includes this test (<strong>{series.title}</strong>) and all future test series released daily.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <ul className="mb-6 space-y-2.5 text-sm text-ink-2">
            <li className="flex items-center gap-2">
              <span className="text-ok font-bold">✓</span> Full access to all 200+ MCQ test series
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ok font-bold">✓</span> Series 1 unlocked immediately; new series daily at 5:00 PM IST
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ok font-bold">✓</span> Detailed explanations, answer keys & performance analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ok font-bold">✓</span> Unlimited retakes & progress tracking
            </li>
          </ul>

          <Checkout
            courseId={course.id}
            basePrice={Number(course.price)}
            discountPrice={course.discount_price ? Number(course.discount_price) : undefined}
            promoCode={course.promo_code}
            configured={razorpayConfigured()}
            testSeriesId={series.id}
            courseTitle={course.title}
          />

          <p className="mt-6 text-xs leading-relaxed text-faint">
            Payments are secured by Razorpay (UPI, Google Pay, PhonePe, Paytm, cards & net banking).
            Access is activated immediately after verification. Digital course access is non-transferable.
          </p>
        </div>
      </Card>
    </Container>
  );
}
