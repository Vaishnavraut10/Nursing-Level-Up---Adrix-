'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Field, Input, Select, Textarea } from '@/components/ui';
import { api, errorMessage, fieldErrors } from '@/lib/api';
import { dailyTestInputSchema } from '@/lib/validation';
import type { DailyTest } from '@/types';

const DEFAULT_INSTRUCTIONS = [
  'Each question has multiple choice options.',
  'Read each question carefully before submitting your response.',
  'You can navigate between questions using the numbers grid or previous/next buttons.',
  'The test submits automatically when the timer reaches zero.',
].join('\n');

export function DailyTestForm({ initial }: { initial?: DailyTest }) {
  const router = useRouter();
  const editing = Boolean(initial);

  // Default to today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [values, setValues] = useState({
    test_date: initial?.test_date ? initial.test_date.split('T')[0] : today,
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'Nursing',
    duration_minutes: String(initial?.duration_minutes ?? 30),
    negative_marks: String(initial?.negative_marks ?? 0),
    instructions: initial?.instructions ?? DEFAULT_INSTRUCTIONS,
    status: initial?.status ?? 'DRAFT',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...values,
      duration_minutes: Number(values.duration_minutes),
      negative_marks: Number(values.negative_marks),
    };

    const check = dailyTestInputSchema.safeParse(payload);
    if (!check.success) {
      setErrors(Object.fromEntries(check.error.issues.map((i) => [i.path.join('.'), i.message])));
      return;
    }

    setErrors({});
    setFormError(null);
    setBusy(true);

    try {
      const saved = await api<DailyTest>(
        editing ? `/api/admin/daily-tests/${initial!.id}` : '/api/admin/daily-tests',
        {
          method: editing ? 'PUT' : 'POST',
          json: payload,
        }
      );
      router.push(`/admin/daily-tests/${saved.id}`);
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

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Test Date" htmlFor="test_date" error={errors.test_date} required hint="Target publication date for students.">
            <Input id="test_date" type="date" value={values.test_date} onChange={set('test_date')} aria-invalid={Boolean(errors.test_date)} />
          </Field>

          <Field label="Category / Subject" htmlFor="category" error={errors.category} hint="e.g. Nursing, Pharmacology, Anatomy, OBG">
            <Input id="category" value={values.category} onChange={set('category')} maxLength={100} placeholder="e.g. Nursing Practice" />
          </Field>
        </div>

        <Field label="Test Title" htmlFor="title" error={errors.title} required hint="e.g. Daily Nursing Practice Test - Day 1">
          <Input id="title" value={values.title} onChange={set('title')} maxLength={200} placeholder="Daily Nursing Practice Test" aria-invalid={Boolean(errors.title)} />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description} hint="Short summary for students.">
          <Textarea id="description" value={values.description} onChange={set('description')} rows={3} placeholder="Test your preparation with today's questions." />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Duration (minutes)" htmlFor="duration" error={errors.duration_minutes} required>
            <Input id="duration" type="number" min={1} max={600} value={values.duration_minutes} onChange={set('duration_minutes')} aria-invalid={Boolean(errors.duration_minutes)} />
          </Field>

          <Field label="Negative Marking per Wrong Answer" htmlFor="negative_marks" error={errors.negative_marks} hint="e.g. 0 for no penalty, 0.25 or 0.33 for deduction">
            <Input id="negative_marks" type="number" step="0.01" min={0} max={10} value={values.negative_marks} onChange={set('negative_marks')} aria-invalid={Boolean(errors.negative_marks)} />
          </Field>

          <Field label="Status" htmlFor="status" error={errors.status} hint={editing ? 'Drafts are hidden from students.' : 'Saved as draft initially.'}>
            <Select id="status" value={values.status} onChange={set('status')}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
        </div>

        <Field label="Instructions" htmlFor="instructions" error={errors.instructions} hint="One instruction per line.">
          <Textarea id="instructions" value={values.instructions} onChange={set('instructions')} rows={4} />
        </Field>

        <div className="flex justify-end gap-2 border-t border-line pt-5">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={busy}>{editing ? 'Save changes' : 'Create and add questions'}</Button>
        </div>
      </Card>
    </form>
  );
}
