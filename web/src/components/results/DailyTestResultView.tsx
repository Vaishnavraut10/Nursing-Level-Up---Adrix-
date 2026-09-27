import type { DailyTestResult } from '@/types';
import { Card, cx } from '@/components/ui';
import { formatDateTime, formatDuration, formatPercent } from '@/lib/format';

export function DailyScoreSummary({ result }: { result: DailyTestResult }) {
  const pct = Number(result.percentage ?? 0);
  const verdict =
    pct >= 80
      ? 'Excellent work!'
      : pct >= 60
      ? 'Good attempt!'
      : pct >= 40
      ? 'Keep practicing!'
      : 'Review the explanations below.';
  const circumference = 2 * Math.PI * 52;

  return (
    <Card className="grid gap-8 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
      <div className="relative mx-auto size-40">
        <svg viewBox="0 0 120 120" className="size-40 -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-sunken)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--color-brand-500)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-serif text-3xl font-semibold tabular-nums" data-testid="daily-result-percentage">
            {formatPercent(pct)}
          </div>
          <div className="text-xs text-muted">
            {result.score}/{result.total_marks} marks
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-brand-600">
          <span>{verdict}</span>
          {result.category && (
            <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
              {result.category}
            </span>
          )}
        </div>

        <h1 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl text-ink">
          {result.test_title}
        </h1>
        <p className="mt-1 text-sm text-muted">Completed {formatDateTime(result.submitted_at)}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-ok-50 p-3">
            <dt className="text-xs text-ok">Correct</dt>
            <dd className="font-serif text-2xl tabular-nums text-ok">{result.correct_answers}</dd>
          </div>
          <div className="rounded-lg bg-bad-50 p-3">
            <dt className="text-xs text-bad">Incorrect</dt>
            <dd className="font-serif text-2xl tabular-nums text-bad">{result.incorrect_answers}</dd>
          </div>
          <div className="rounded-lg bg-sunken p-3">
            <dt className="text-xs text-muted">Unanswered</dt>
            <dd className="font-serif text-2xl tabular-nums text-ink">{result.unanswered}</dd>
          </div>
          <div className="rounded-lg bg-sunken p-3">
            <dt className="text-xs text-muted">Time taken</dt>
            <dd className="font-serif text-2xl text-ink">{formatDuration(result.time_taken_seconds)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

export function DailyQuestionReview({ result }: { result: DailyTestResult }) {
  return (
    <ol className="space-y-4">
      {result.review.map((q) => {
        const state = q.selected_answer === null ? 'skipped' : q.is_correct ? 'correct' : 'wrong';
        return (
          <li key={q.question_id}>
            <Card className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium leading-relaxed text-ink">
                  <span className="mr-2 text-muted">Q{q.question_order}.</span>
                  {q.question_text}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded bg-sunken px-2 py-0.5 text-xs text-muted">
                    {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                  </span>
                  <span
                    className={cx(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      state === 'correct' && 'bg-ok-50 text-ok',
                      state === 'wrong' && 'bg-bad-50 text-bad',
                      state === 'skipped' && 'bg-sunken text-muted'
                    )}
                  >
                    {state === 'correct' ? 'Correct' : state === 'wrong' ? 'Incorrect' : 'Not answered'}
                  </span>
                </div>
              </div>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const text = q[`option_${letter.toLowerCase()}` as 'option_a'];
                  const isCorrect = q.correct_answer === letter;
                  const isPicked = q.selected_answer === letter;
                  return (
                    <li
                      key={letter}
                      className={cx(
                        'flex gap-2.5 rounded-lg border px-3 py-2 text-sm',
                        isCorrect
                          ? 'border-ok/40 bg-ok-50'
                          : isPicked
                          ? 'border-bad/40 bg-bad-50'
                          : 'border-line'
                      )}
                    >
                      <span
                        className={cx(
                          'font-semibold',
                          isCorrect ? 'text-ok' : isPicked ? 'text-bad' : 'text-muted'
                        )}
                      >
                        {letter}
                      </span>
                      <span className="text-ink-2">{text}</span>
                      {isPicked && <span className="ml-auto shrink-0 text-xs text-muted">Your answer</span>}
                    </li>
                  );
                })}
              </ul>

              {q.explanation && (
                <p className="mt-4 rounded-lg bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-2">
                  <span className="font-semibold text-ink">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
