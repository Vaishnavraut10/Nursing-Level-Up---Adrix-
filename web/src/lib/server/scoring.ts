// Pure scoring logic (no I/O) so it can be unit tested. The only inputs that matter are which option
// the student selected per question and the correct answers loaded from the database.
import type { AnswerOption } from '@/types';

export interface ScoredAnswer {
  questionId: string;
  selectedAnswer: AnswerOption | null;
  isCorrect: boolean | null;
}

export interface ScoreResult {
  answers: ScoredAnswer[];
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  percentage: number;
}

/**
 * @param questionIds    the exact questions served for the attempt, in order
 * @param answerKey      questionId → correct option, loaded from the database
 * @param selections     questionId → option chosen by the student; ids outside questionIds are ignored
 * @param negativeMarks  deduction per incorrect answer (default 0)
 */
export function scoreAttempt(
  questionIds: string[],
  answerKey: Map<string, AnswerOption>,
  selections: Map<string, AnswerOption | null>,
  negativeMarks: number = 0,
): ScoreResult {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  const answers: ScoredAnswer[] = questionIds.map((questionId) => {
    const selectedAnswer = selections.get(questionId) ?? null;
    if (selectedAnswer === null) {
      unanswered++;
      return { questionId, selectedAnswer, isCorrect: null };
    }
    const isCorrect = answerKey.get(questionId) === selectedAnswer;
    if (isCorrect) correct++;
    else incorrect++;
    return { questionId, selectedAnswer, isCorrect };
  });
  const total = questionIds.length;
  const deduction = Number(negativeMarks ?? 0);
  const rawScore = correct - incorrect * deduction;
  const score = Math.max(0, Math.round(rawScore * 100) / 100);
  const percentage = total === 0 ? 0 : Math.max(0, Math.round((score / total) * 10000) / 100);
  return { answers, total, correct, incorrect, unanswered, score, percentage };
}
