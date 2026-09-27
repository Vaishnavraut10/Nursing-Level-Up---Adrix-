'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DailyTestQuestion } from '@/types';
import { Alert, Button, Card, Field, Input, Textarea, cx } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

export type QuestionDraftItem = {
  id?: string;
  tempId: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marks: number;
};

function createEmptyQuestion(index: number, isInitial = false): QuestionDraftItem {
  return {
    tempId: isInitial ? `draft-init-${index}` : `draft-${Date.now()}-${index}`,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    marks: 1,
  };
}

export function DailyQuestionManager({
  dailyTestId,
  initial,
}: {
  dailyTestId: string;
  initial: DailyTestQuestion[];
}) {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionDraftItem[]>(() => {
    if (initial && initial.length > 0) {
      return initial.map((q) => ({
        id: q.id,
        tempId: q.id,
        question_text: q.question_text ?? '',
        option_a: q.option_a ?? '',
        option_b: q.option_b ?? '',
        option_c: q.option_c ?? '',
        option_d: q.option_d ?? '',
        correct_answer: (q.correct_answer as 'A' | 'B' | 'C' | 'D') || 'A',
        explanation: q.explanation ?? '',
        marks: q.marks ?? 1,
      }));
    }
    return [createEmptyQuestion(0, true)];
  });

  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  function addQuestionBlock() {
    setSuccessMessage(null);
    setFormError(null);
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)]);
  }

  function removeQuestionBlock(index: number) {
    setSuccessMessage(null);
    setFormError(null);
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        return [createEmptyQuestion(0)];
      }
      return next;
    });

    setErrors((prevErrors) => {
      const nextErrors: Record<number, Record<string, string>> = {};
      Object.keys(prevErrors).forEach((keyStr) => {
        const i = Number(keyStr);
        if (i < index) {
          nextErrors[i] = prevErrors[i];
        } else if (i > index) {
          nextErrors[i - 1] = prevErrors[i];
        }
      });
      return nextErrors;
    });
  }

  function updateField<K extends keyof QuestionDraftItem>(
    index: number,
    field: K,
    value: QuestionDraftItem[K]
  ) {
    setSuccessMessage(null);
    setFormError(null);
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    if (errors[index]?.[field as string]) {
      setErrors((prev) => {
        const nextObj = { ...prev[index] };
        delete nextObj[field as string];
        return { ...prev, [index]: nextObj };
      });
    }
  }

  function validateAll(): boolean {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    questions.forEach((q, i) => {
      const qErrors: Record<string, string> = {};

      if (!q.question_text.trim()) {
        qErrors.question_text = 'Question text is required.';
        isValid = false;
      }
      if (!q.option_a.trim()) {
        qErrors.option_a = 'Option A is required.';
        isValid = false;
      }
      if (!q.option_b.trim()) {
        qErrors.option_b = 'Option B is required.';
        isValid = false;
      }
      if (!q.option_c.trim()) {
        qErrors.option_c = 'Option C is required.';
        isValid = false;
      }
      if (!q.option_d.trim()) {
        qErrors.option_d = 'Option D is required.';
        isValid = false;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
        qErrors.correct_answer = 'Correct answer must be selected.';
        isValid = false;
      }

      if (Object.keys(qErrors).length > 0) {
        newErrors[i] = qErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  }

  async function handleSaveAll() {
    setSuccessMessage(null);
    setFormError(null);

    if (!validateAll()) {
      setFormError('Please fix the errors in your questions before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        questions: questions.map((q) => ({
          id: q.id || null,
          question_text: q.question_text.trim(),
          option_a: q.option_a.trim(),
          option_b: q.option_b.trim(),
          option_c: q.option_c.trim(),
          option_d: q.option_d.trim(),
          correct_answer: q.correct_answer,
          explanation: q.explanation.trim() || null,
          marks: Number(q.marks) || 1,
        })),
      };

      const savedList = await api<DailyTestQuestion[]>(
        `/api/admin/daily-tests/${dailyTestId}/questions`,
        {
          method: 'PUT',
          json: payload,
        }
      );

      setQuestions(
        savedList.map((q) => ({
          id: q.id,
          tempId: q.id,
          question_text: q.question_text ?? '',
          option_a: q.option_a ?? '',
          option_b: q.option_b ?? '',
          option_c: q.option_c ?? '',
          option_d: q.option_d ?? '',
          correct_answer: (q.correct_answer as 'A' | 'B' | 'C' | 'D') || 'A',
          explanation: q.explanation ?? '',
          marks: q.marks ?? 1,
        }))
      );

      setErrors({});
      setSuccessMessage('All questions saved successfully.');
      router.refresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Daily Test Questions</h2>
          <p className="mt-1 text-sm text-muted">
            Questions: <span className="font-semibold text-ink">{questions.length}</span> · Total Marks:{' '}
            <span className="font-semibold text-brand-700">{totalMarks}</span>
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {formError && <Alert tone="bad">{formError}</Alert>}
      {successMessage && <Alert tone="ok">{successMessage}</Alert>}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, index) => {
          const qErrors = errors[index] || {};
          const idPrefix = `q-${q.tempId}`;

          return (
            <Card key={q.tempId} className="p-6 space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-base font-semibold text-ink">
                  Question {index + 1}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-bad hover:bg-bad-50 hover:text-bad"
                  onClick={() => removeQuestionBlock(index)}
                  aria-label={`Remove Question ${index + 1}`}
                >
                  Remove Question ×
                </Button>
              </div>

              {/* Question Text */}
              <Field
                label="Question"
                htmlFor={`${idPrefix}-text`}
                error={qErrors.question_text}
                required
              >
                <Textarea
                  id={`${idPrefix}-text`}
                  rows={3}
                  value={q.question_text}
                  onChange={(e) => updateField(index, 'question_text', e.target.value)}
                  placeholder="Enter question text..."
                  aria-invalid={Boolean(qErrors.question_text)}
                />
              </Field>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">
                  Options <span className="text-bad">*</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                    const optKey = `option_${letter.toLowerCase()}` as keyof QuestionDraftItem;
                    const fieldError = qErrors[optKey];
                    return (
                      <div key={letter} className="space-y-1">
                        <div
                          className={cx(
                            'flex items-center gap-2 rounded-lg border px-3 py-1.5 bg-surface transition-colors',
                            fieldError ? 'border-bad ring-1 ring-bad/20' : 'border-line-strong focus-within:border-brand-500'
                          )}
                        >
                          <span className="text-sm font-bold text-ink-2 shrink-0 select-none">
                            {letter}.
                          </span>
                          <Input
                            id={`${idPrefix}-${letter}`}
                            aria-label={`Option ${letter}`}
                            className="h-9 border-0 p-0 focus:ring-0 shadow-none bg-transparent"
                            value={q[optKey] as string}
                            onChange={(e) => updateField(index, optKey, e.target.value)}
                            placeholder={`Option ${letter}`}
                            aria-invalid={Boolean(fieldError)}
                          />
                        </div>
                        {fieldError && (
                          <p className="text-xs text-bad">{fieldError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">
                  Correct Answer <span className="text-bad">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                    <label
                      key={letter}
                      className={cx(
                        'flex cursor-pointer items-center gap-2 text-sm font-semibold rounded-md px-3 py-1.5 transition-colors border',
                        q.correct_answer === letter
                          ? 'border-ok bg-ok-50 text-ok ring-1 ring-ok/20'
                          : 'border-line bg-surface text-ink hover:bg-sunken'
                      )}
                    >
                      <input
                        type="radio"
                        name={`${idPrefix}-correct`}
                        checked={q.correct_answer === letter}
                        onChange={() => updateField(index, 'correct_answer', letter)}
                        className="accent-[var(--color-ok)] size-4"
                      />
                      <span>Option {letter}</span>
                    </label>
                  ))}
                </div>
                {qErrors.correct_answer && (
                  <p className="text-xs text-bad">{qErrors.correct_answer}</p>
                )}
              </div>

              {/* Solution / Explanation */}
              <Field
                label="Solution / Explanation (Optional)"
                htmlFor={`${idPrefix}-exp`}
                hint="Students see this explanation after test submission."
              >
                <Textarea
                  id={`${idPrefix}-exp`}
                  rows={2}
                  value={q.explanation}
                  onChange={(e) => updateField(index, 'explanation', e.target.value)}
                  placeholder="Enter detailed solution/explanation..."
                />
              </Field>
            </Card>
          );
        })}
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
        <Button type="button" variant="secondary" onClick={addQuestionBlock}>
          + Add Another Question
        </Button>
        <Button type="button" variant="primary" loading={saving} onClick={handleSaveAll}>
          Save All Questions
        </Button>
      </div>
    </div>
  );
}
