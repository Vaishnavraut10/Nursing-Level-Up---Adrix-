'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Field, Input, Select, Textarea } from '@/components/ui';
import { api, errorMessage, fieldErrors } from '@/lib/api';
import { courseInputSchema } from '@/lib/validation';
import type { Course } from '@/types';

import { CourseThumbnailUpload } from './CourseThumbnailUpload';

interface PromoRow {
  id?: string | null;
  code: string;
  discount_price: string;
  is_active: boolean;
}

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

  const [promoCodes, setPromoCodes] = useState<PromoRow[]>(() => {
    if (initial?.promo_codes && initial.promo_codes.length > 0) {
      return initial.promo_codes.map((p) => ({
        id: p.id,
        code: p.code,
        discount_price:
          p.discount_price !== null && p.discount_price !== undefined
            ? String(p.discount_price)
            : (Number(initial.price) - Number(p.discount_value) > 0
                ? String(Number(initial.price) - Number(p.discount_value))
                : '199'),
        is_active: p.is_active ?? true,
      }));
    }
    if (initial?.promo_code) {
      return [
        {
          code: initial.promo_code,
          discount_price: initial.discount_price ? String(initial.discount_price) : '199',
          is_active: true,
        },
      ];
    }
    return [
      {
        code: 'NLUP199',
        discount_price: '199',
        is_active: true,
      },
    ];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const addPromoRow = () => {
    setPromoCodes((prev) => [
      ...prev,
      {
        code: '',
        discount_price: values.discount_price || '199',
        is_active: true,
      },
    ]);
  };

  const updatePromoRow = (index: number, patch: Partial<PromoRow>) => {
    setPromoCodes((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const removePromoRow = (index: number) => {
    setPromoCodes((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isFree = courseType === 'FREE';
    const basePrice = isFree ? 0 : Number(values.price);

    // Client-side validations for promo codes if course is paid
    if (!isFree) {
      const fieldValidationErrors: Record<string, string> = {};
      const seenCodes = new Set<string>();

      promoCodes.forEach((p, idx) => {
        const trimmed = p.code.trim().toUpperCase();
        if (!trimmed) {
          fieldValidationErrors[`promo_codes.${idx}.code`] = 'Promo code is required';
        } else if (seenCodes.has(trimmed)) {
          fieldValidationErrors[`promo_codes.${idx}.code`] = `Duplicate promo code '${trimmed}'`;
        } else {
          seenCodes.add(trimmed);
        }

        const dp = Number(p.discount_price);
        if (p.discount_price === '' || isNaN(dp) || dp < 0) {
          fieldValidationErrors[`promo_codes.${idx}.discount_price`] = 'Discount price must be ≥ ₹0';
        } else if (basePrice > 0 && dp >= basePrice) {
          fieldValidationErrors[`promo_codes.${idx}.discount_price`] = 'Discount price must be less than base price';
        }
      });

      if (Object.keys(fieldValidationErrors).length > 0) {
        setErrors(fieldValidationErrors);
        setFormError('Please resolve the promo code validation errors below.');
        return;
      }
    }

    const formattedPromoCodes = isFree
      ? []
      : promoCodes
          .filter((p) => p.code.trim().length > 0)
          .map((p) => ({
            id: p.id || null,
            code: p.code.trim().toUpperCase(),
            discount_price: Number(p.discount_price),
            is_active: p.is_active,
          }));

    const primaryPromo = formattedPromoCodes.find((p) => p.is_active) || formattedPromoCodes[0];

    const payload = {
      title: values.title,
      description: values.description || null,
      price: basePrice,
      discount_price: isFree
        ? null
        : (primaryPromo?.discount_price ?? (values.discount_price ? Number(values.discount_price) : null)),
      promo_code: isFree ? null : (primaryPromo?.code ?? (values.promo_code?.trim() || null)),
      currency: 'INR' as const,
      status: values.status as Course['status'],
      is_free: isFree,
      promo_codes: isFree ? undefined : formattedPromoCodes,
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
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
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
                hint="Default discounted course price displayed on course cards."
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
            </div>

            {/* Dedicated Promo Codes Section */}
            <div className="rounded-xl border border-line bg-surface-2/30 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink">Promo Codes</h3>
                  <p className="text-xs text-muted">Create multiple promo codes for this course.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addPromoRow}
                  className="self-start sm:self-auto"
                >
                  + Add Promo Code
                </Button>
              </div>

              {errors.promo_codes && (
                <div className="rounded-lg border border-bad/20 bg-bad-50 p-3 text-xs text-bad">
                  {errors.promo_codes}
                </div>
              )}

              {promoCodes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line-strong/60 p-6 text-center text-xs text-muted">
                  No promo codes for this course yet. Click <strong>+ Add Promo Code</strong> above to add one.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-line bg-surface">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-sunken/60 text-xs font-semibold uppercase tracking-wider text-muted">
                        <th className="px-4 py-2.5">Promo Code</th>
                        <th className="px-4 py-2.5">Discount Price (INR)</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {promoCodes.map((row, idx) => {
                        const rowCodeError = errors[`promo_codes.${idx}.code`];
                        const rowPriceError = errors[`promo_codes.${idx}.discount_price`];
                        return (
                          <tr key={row.id || idx} className="hover:bg-sunken/30 transition-colors">
                            <td className="px-4 py-3 align-top">
                              <div className="space-y-1">
                                <Input
                                  type="text"
                                  value={row.code}
                                  onChange={(e) => updatePromoRow(idx, { code: e.target.value.toUpperCase() })}
                                  placeholder="e.g. NLUP199"
                                  className="h-9 uppercase font-mono font-medium max-w-[180px]"
                                  aria-invalid={Boolean(rowCodeError)}
                                />
                                {rowCodeError && <p className="text-xs text-bad">{rowCodeError}</p>}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 max-w-[160px]">
                                  <span className="text-sm font-medium text-muted">₹</span>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="1"
                                    value={row.discount_price}
                                    onChange={(e) => updatePromoRow(idx, { discount_price: e.target.value })}
                                    placeholder="199"
                                    className="h-9"
                                    aria-invalid={Boolean(rowPriceError)}
                                  />
                                </div>
                                {rowPriceError && <p className="text-xs text-bad">{rowPriceError}</p>}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <label className="inline-flex items-center gap-2 cursor-pointer pt-1.5 select-none">
                                <input
                                  type="checkbox"
                                  checked={row.is_active}
                                  onChange={(e) => updatePromoRow(idx, { is_active: e.target.checked })}
                                  className="size-4 rounded text-brand-600 focus:ring-brand-500 border-line-strong"
                                />
                                <span className={`text-xs font-medium ${row.is_active ? 'text-ok font-semibold' : 'text-muted'}`}>
                                  {row.is_active ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            </td>
                            <td className="px-4 py-3 align-top text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePromoRow(idx)}
                                className="text-bad hover:bg-bad-50 hover:text-bad"
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
