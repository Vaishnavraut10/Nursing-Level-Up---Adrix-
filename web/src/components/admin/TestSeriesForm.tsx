'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Field, Input, Select, Textarea } from '@/components/ui';
import { api, errorMessage, fieldErrors } from '@/lib/api';
import { testSeriesInputSchema } from '@/lib/validation';
import type { TestSeries } from '@/types';

const DEFAULT_INSTRUCTIONS = [
  'Each question has exactly one correct answer.',
  'There is no negative marking.',
  'You can move between questions and mark any of them for review.',
  'The test submits automatically when the timer reaches zero.',
].join('\n');

export function TestSeriesForm({
  initial,
  courses = [],
}: {
  initial?: TestSeries;
  courses?: { id: string; title: string; status: string }[];
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    course_id: initial?.course_id ?? (courses.length > 0 ? courses[0].id : ''),
    is_free: initial?.is_free ?? true,
    price: String(initial?.price ?? 0),
    duration_minutes: String(initial?.duration_minutes ?? 30),
    instructions: initial?.instructions ?? DEFAULT_INSTRUCTIONS,
    status: initial?.status ?? 'DRAFT',
    release_after_days: String(initial?.release_after_days ?? 0),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...values,
      course_id: values.course_id || null,
      price: values.is_free ? 0 : Number(values.price),
      duration_minutes: Number(values.duration_minutes),
      release_after_days: Number(values.release_after_days),
      currency: 'INR' as const,
    };
    const check = testSeriesInputSchema.safeParse(payload);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      return;
    }
    setErrors({});
    setFormError(null);
    setBusy(true);
    try {
      const saved = await api<TestSeries>(editing ? `/api/admin/test-series/${initial!.id}` : '/api/admin/test-series', {
        method: editing ? 'PUT' : 'POST',
        json: payload,
      });
      router.push(editing ? `/admin/test-series/${saved.id}` : `/admin/test-series/${saved.id}/questions`);
      router.refresh();
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card className="space-y-5 p-6">
        {formError && <Alert>{formError}</Alert>}
        <Field label="Title" htmlFor="title" error={errors.title} required>
          <Input id="title" value={values.title} onChange={set('title')} maxLength={200} aria-invalid={Boolean(errors.title)} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description} hint="Shown on the catalog card and detail page.">
          <Textarea id="description" value={values.description} onChange={set('description')} rows={3} />
        </Field>
        {courses.length > 0 && (
          <Field label="Assign to Course" htmlFor="course_id" error={errors.course_id} hint="Test series will be bundled inside this course and released based on the drip schedule.">
            <Select id="course_id" value={values.course_id} onChange={set('course_id')}>
              <option value="">No Course (Independent)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.status})
                </option>
              ))}
            </Select>
          </Field>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Pricing" htmlFor="is_free">
            <Select id="is_free" value={values.is_free ? 'free' : 'paid'} onChange={(e) => setValues((v) => ({ ...v, is_free: e.target.value === 'free', price: e.target.value === 'free' ? '0' : '0' }))}>
              <option value="free">Free</option>
              <option value="paid">Course Pass</option>
            </Select>
          </Field>
          <Field label="Drip Release (Day)" htmlFor="release_after_days" error={errors.release_after_days} hint="0 = Day 1 (Instant), 1 = Day 2 (5 PM IST)...">
            <Input id="release_after_days" type="number" min={0} max={365} value={values.release_after_days} onChange={set('release_after_days')} aria-invalid={Boolean(errors.release_after_days)} />
          </Field>
          <Field label="Duration (minutes)" htmlFor="duration" error={errors.duration_minutes} required>
            <Input id="duration" type="number" min={1} max={600} value={values.duration_minutes} onChange={set('duration_minutes')} aria-invalid={Boolean(errors.duration_minutes)} />
          </Field>
          <Field label="Legacy Price" htmlFor="price" error={errors.price} hint="Optional (bundled in course)">
            <Input id="price" type="number" min={0} step="1" value={values.is_free ? '0' : values.price} onChange={set('price')} disabled={values.is_free} aria-invalid={Boolean(errors.price)} />
          </Field>
        </div>
        <Field label="Instructions" htmlFor="instructions" error={errors.instructions} hint="One instruction per line.">
          <Textarea id="instructions" value={values.instructions} onChange={set('instructions')} rows={5} />
        </Field>
        <Field label="Status" htmlFor="status" error={errors.status} hint={editing ? 'Publishing requires at least one approved question.' : 'New test series start as drafts; publish after adding questions.'}>
          <Select id="status" value={values.status} onChange={set('status')} disabled={!editing}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-2 border-t border-line pt-5">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={busy}>{editing ? 'Save changes' : 'Create and add questions'}</Button>
        </div>
      </Card>
    </form>
  );
}
