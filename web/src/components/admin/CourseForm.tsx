'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Field, Input, Select, Textarea } from '@/components/ui';
import { api, errorMessage, fieldErrors } from '@/lib/api';
import { courseInputSchema } from '@/lib/validation';
import type { Course } from '@/types';

import { CourseThumbnailUpload } from './CourseThumbnailUpload';

export function CourseForm({ initial }: { initial?: Course }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const isInitiallyFree = initial ? Boolean(initial.is_free || Number(initial.price) === 0) : false;
  const [courseType, setCourseType] = useState<'PAID' | 'FREE'>(isInitiallyFree ? 'FREE' : 'PAID');
  const [values, setValues] = useState({
    title: initial?.title ?? 'Nursing Level Up — Complete Course',
    description: initial?.description ?? 'Full access to all nursing MCQ test series with daily releases. Practice smarter, prepare better.',
    price: String(initial?.price ?? 299),
    discount_price: initial?.discount_price ? String(initial.discount_price) : '199',
    promo_code: initial?.promo_code ?? 'NLUP199',
    status: initial?.status ?? 'PUBLISHED',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isFree = courseType === 'FREE';
    const payload = {
      title: values.title,
      description: values.description || null,
      price: isFree ? 0 : Number(values.price),
      discount_price: isFree ? null : (values.discount_price ? Number(values.discount_price) : null),
      promo_code: isFree ? null : (values.promo_code?.trim() || null),
      currency: 'INR' as const,
      status: values.status as Course['status'],
      is_free: isFree,
    };

    const check = courseInputSchema.safeParse(payload);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      return;
    }

    setErrors({});
    setFormError(null);
    setBusy(true);

    try {
      const saved = await api<Course>(editing ? `/api/admin/courses/${initial!.id}` : '/api/admin/courses', {
        method: editing ? 'PUT' : 'POST',
        json: payload,
      });
      router.push(`/admin/courses/${saved.id}`);
      router.refresh();
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card className="space-y-6 p-6">
        {formError && <Alert>{formError}</Alert>}

        <Field label="Course Title" htmlFor="title" error={errors.title} required>
          <Input
            id="title"
            value={values.title}
            onChange={set('title')}
            maxLength={200}
            aria-invalid={Boolean(errors.title)}
            placeholder="e.g. Nursing Level Up — Complete Course"
          />
        </Field>

        <Field
          label="Course Description"
          htmlFor="description"
          error={errors.description}
          hint="Visible to students on the course enrollment and test series pages."
        >
          <Textarea
            id="description"
            value={values.description}
            onChange={set('description')}
            rows={4}
            placeholder="Comprehensive description of what is included in this course..."
          />
        </Field>

        {/* Course Thumbnail Upload Section */}
        {initial?.id ? (
          <div className="rounded-xl border border-line bg-surface-2/40 p-4 sm:p-5">
            <CourseThumbnailUpload
              courseId={initial.id}
              initialThumbnailUrl={initial.thumbnail_url}
              onThumbnailChange={() => router.refresh()}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-line-strong/40 bg-surface-2/30 p-4 text-xs text-muted">
            <span className="font-semibold text-ink">Course Thumbnail: </span>
            You can upload a course thumbnail image after saving this new course.
          </div>
        )}

        {/* Course Type Selector */}
        <Field label="Course Type" htmlFor="course_type" hint="Select pricing type for this course.">
          <div className="grid grid-cols-2 gap-4 pt-1">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                courseType === 'PAID'
                  ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-2 ring-brand-600/20'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name="course_type"
                value="PAID"
                checked={courseType === 'PAID'}
                onChange={() => setCourseType('PAID')}
                className="size-4 text-brand-600 focus:ring-brand-500"
              />
              <span>Paid Course</span>
            </label>

            <label
              className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                courseType === 'FREE'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-600/20'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name="course_type"
                value="FREE"
                checked={courseType === 'FREE'}
                onChange={() => setCourseType('FREE')}
                className="size-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Free Course</span>
            </label>
          </div>
        </Field>

        {courseType === 'FREE' ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800 flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
              ✓
            </div>
            <div>
              <p className="font-semibold">Students can access this course without payment</p>
              <p className="text-xs text-emerald-700 mt-0.5">Price: FREE (₹0). Razorpay payment checkout will not be triggered.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Base Price (INR)"
              htmlFor="price"
              error={errors.price}
              required
              hint="Original course fee without coupon (default ₹299)."
            >
              <Input
                id="price"
                type="number"
                min={0}
                step="1"
                value={values.price}
                onChange={set('price')}
                aria-invalid={Boolean(errors.price)}
              />
            </Field>

            <Field
              label="Discount Price (INR)"
              htmlFor="discount_price"
              error={errors.discount_price}
              hint="Price when valid promo code is applied (default ₹199)."
            >
              <Input
                id="discount_price"
                type="number"
                min={0}
                step="1"
                value={values.discount_price}
                onChange={set('discount_price')}
                aria-invalid={Boolean(errors.discount_price)}
              />
            </Field>

            <Field
              label="Promo Code"
              htmlFor="promo_code"
              error={errors.promo_code}
              hint="Students enter this code at checkout (e.g. NLUP199)."
            >
              <Input
                id="promo_code"
                type="text"
                value={values.promo_code}
                onChange={set('promo_code')}
                placeholder="NLUP199"
                className="uppercase"
                aria-invalid={Boolean(errors.promo_code)}
              />
            </Field>
          </div>
        )}

        <Field
          label="Status"
          htmlFor="status"
          error={errors.status}
          hint="PUBLISHED courses are immediately visible to students on the website."
        >
          <Select id="status" value={values.status} onChange={set('status')}>
            <option value="DRAFT">Draft (Hidden from students)</option>
            <option value="PUBLISHED">Published (Active on site)</option>
            <option value="ARCHIVED">Archived (Retired)</option>
          </Select>
        </Field>

        <div className="flex justify-end gap-2 border-t border-line pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {editing ? 'Save Course' : 'Create Course'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
