import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Card, Container } from '@/components/ui';
import { Checkout } from '@/components/payments/Checkout';
import { CourseTestSeriesList } from '@/components/course/CourseTestSeriesList';
import { getCurrentUser } from '@/lib/server/session';
import { getPublishedCourse, listPublishedCourses, hasCoursePurchase } from '@/lib/server/services/courseService';
import { listPublishedForCourse } from '@/lib/server/services/testSeriesService';
import { razorpayConfigured } from '@/lib/server/razorpay';

import { FreeCourseEnrollButton } from '@/components/course/FreeCourseEnrollButton';

export const metadata: Metadata = {
  title: 'Nursing Level Up Complete Course — 200+ Test Series',
  description:
    'Enroll in the comprehensive nursing MCQ course. Full access to 200+ test series released daily with rationales and instant test solving.',
};
export const dynamic = 'force-dynamic';

export default async function CoursePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const user = await getCurrentUser();
  const allCourses = await listPublishedCourses();
  const course = (sp.id ? allCourses.find((c) => c.id === sp.id) : null) ?? allCourses[0] ?? null;

  if (!course) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold">Course Coming Soon</h1>
        <p className="mt-2 text-muted">The complete course is being prepared. Check back shortly.</p>
        <ButtonLink href="/test-series" className="mt-6" size="md">
          Browse Free Tests
        </ButtonLink>
      </Container>
    );
  }

  const isFreeCourse = Boolean(course.is_free || Number(course.price) === 0);

  const [hasAccess, series] = await Promise.all([
    user ? hasCoursePurchase(user.id, course.id) : false,
    listPublishedForCourse(course.id, user),
  ]);

  return (
    <div className="relative min-h-screen bg-paper py-10 sm:py-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 blur-3xl" aria-hidden="true">
        <div
          className="mx-auto h-[450px] w-full max-w-5xl"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(31, 122, 115, 0.15), transparent 75%)',
          }}
        />
      </div>

      <Container className="relative z-10 max-w-5xl">
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/test-series" className="hover:text-brand-600">Test series</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span className="text-ink-2">{course.title}</span>
        </nav>

        {allCourses.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface/80 p-3 shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1">Available Courses:</span>
            {allCourses.map((c) => {
              const isSelected = c.id === course.id;
              const isFree = Boolean(c.is_free || Number(c.price) === 0);
              return (
                <Link
                  key={c.id}
                  href={`/course?id=${c.id}`}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-paper border border-line text-ink hover:border-brand-300'
                  }`}
                >
                  <span>{c.title}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isFree
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-brand-50 text-brand-700'
                  }`}>
                    {isFree ? 'FREE' : `₹${c.price}`}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Top Section: Course Details & Enrollment Card */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Course Features & Details */}
          <div className="lg:col-span-7 space-y-6">
            {course.thumbnail_url && (
              <div className="overflow-hidden rounded-2xl border border-line/80 bg-brand-950 aspect-video w-full max-h-72">
                <img src={course.thumbnail_url} alt={course.title} className="size-full object-cover object-center" />
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60">
                <span className="size-1.5 rounded-full bg-brand-500" />
                Comprehensive Nursing Preparation
              </div>
              <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {course.description ||
                  'The all-in-one practice program designed for NORCET, GMCH, AIIMS, and State Nursing Officer exams. Over 200 high-yield MCQ test series delivered on a structured daily schedule.'}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="rounded-xl border border-line/80 bg-surface/80 p-4 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-sm text-ink">Up to 200+ Test Series</h3>
                <p className="mt-1 text-xs text-muted">
                  Subject-wise coverage including Fundamentals, Pharmacology, Med-Surg, OBG, and Community Health.
                </p>
              </div>

              <div className="rounded-xl border border-line/80 bg-surface/80 p-4 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-sm text-ink">Daily Drip Release</h3>
                <p className="mt-1 text-xs text-muted">
                  Series 1 unlocks immediately. Subsequent series release every day at 5:00 PM IST based on enrollment.
                </p>
              </div>

              <div className="rounded-xl border border-line/80 bg-surface/80 p-4 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-sm text-ink">Detailed Rationales</h3>
                <p className="mt-1 text-xs text-muted">
                  Every MCQ includes clear clinical explanations, rationale breakdown, and textbook references.
                </p>
              </div>

              <div className="rounded-xl border border-line/80 bg-surface/80 p-4 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-sm text-ink">Exam Performance Analytics</h3>
                <p className="mt-1 text-xs text-muted">
                  Track accuracy, time taken, strengths, and subject weak spots on your student dashboard.
                </p>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="rounded-xl border border-line/80 bg-surface p-4 text-xs text-muted">
              <span className="font-semibold text-ink">Prepared by Dhruva Thakre</span> — Nursing Officer, GMCH Nagpur & Founder of Nursing Level Up.
            </div>
          </div>

          {/* Right Column: Checkout or Enrolled Card */}
          <div className="lg:col-span-5" id="course-payment">
            <Card className="overflow-hidden border border-line shadow-sm">
              <div className="border-b border-line bg-sunken/60 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                  Course Access
                </div>
                {isFreeCourse ? (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-lg font-extrabold text-emerald-800 ring-1 ring-inset ring-emerald-600/30">
                      FREE
                    </span>
                    <span className="text-xs text-muted">No payment required</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-ink">₹{course.price}</span>
                    <span className="text-xs text-muted">One-time payment</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {hasAccess ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-ok-50 text-ok ring-1 ring-ok/20">
                      <svg className="size-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-ink">
                      {isFreeCourse ? 'Course Unlocked!' : 'You are already enrolled!'}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Your course access is active. Series 1 is unlocked right now. Scroll below to solve your test series!
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <ButtonLink href="/dashboard" variant="secondary" size="md" className="w-full">
                        View Dashboard Progress
                      </ButtonLink>
                    </div>
                  </div>
                ) : !user ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted">
                      Please log in or create an account to {isFreeCourse ? 'access this free course' : 'enroll in the course'} and activate your test schedule.
                    </p>
                    <ButtonLink href={`/login?next=${encodeURIComponent('/course')}`} size="lg" className="w-full">
                      Login to {isFreeCourse ? 'Access Course' : 'Enroll'}
                    </ButtonLink>
                  </div>
                ) : isFreeCourse ? (
                  <FreeCourseEnrollButton courseId={course.id} />
                ) : (
                  <Checkout
                    courseId={course.id}
                    basePrice={Number(course.price)}
                    discountPrice={course.discount_price ? Number(course.discount_price) : undefined}
                    configured={razorpayConfigured()}
                    courseTitle={course.title}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Listed Test Series with Immediate "Solve Test" Capability */}
        <section className="mt-14 border-t border-line/70 pt-10">
          <CourseTestSeriesList series={series} hasCourseAccess={hasAccess} />
        </section>
      </Container>
    </div>
  );
}
