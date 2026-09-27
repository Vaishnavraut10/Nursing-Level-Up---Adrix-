import 'server-only';
import type { Queryable } from '../db';
import { query, queryOne, transaction } from '../db';
import { ApiError, Errors } from '../../errors';
import type {
  AnswerOption,
  DailyTest,
  DailyTestAttempt,
  DailyTestQuestion,
  DailyTestResult,
  DailyTestReviewItem,
  Paginated,
  PublicDailyTest,
  StudentDailyTestQuestion,
  TestStatus,
  User,
} from '@/types';
import type { DailyQuestionBulkItem, DailyQuestionInput, DailyTestInput } from '../../validation';
import { logAudit } from './auditService';

export const SUBMIT_GRACE_SECONDS = 120;

const QUESTION_COUNT = `(SELECT COUNT(*) FROM daily_test_questions q WHERE q.daily_test_id = dt.id)::int`;

const ADMIN_COLUMNS = `dt.id, dt.test_date::text AS test_date, dt.title, dt.description, dt.category, dt.duration_minutes,
  dt.total_marks, dt.negative_marks::float AS negative_marks, dt.status, dt.instructions, dt.created_by,
  dt.created_at, dt.updated_at, dt.published_at, ${QUESTION_COUNT} AS question_count`;

const QUESTION_ADMIN_COLUMNS = `id, daily_test_id, question_text, option_a, option_b, option_c, option_d, correct_answer,
  explanation, marks, question_order, created_at, updated_at`;

const QUESTION_STUDENT_COLUMNS = `id, question_text, option_a, option_b, option_c, option_d, marks, question_order`;

const ATTEMPT_COLUMNS = `a.id, a.user_id, a.daily_test_id, a.started_at, a.submitted_at, a.score::float AS score, a.total_marks,
  a.total_questions, a.correct_answers, a.incorrect_answers, a.unanswered, a.percentage::float AS percentage,
  a.time_taken_seconds, a.status`;

/**
 * Returns today's date formatted as YYYY-MM-DD in India Standard Time (Asia/Kolkata).
 */
export function getTodayIST(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/** Recalculate total_marks for a daily test based on its questions. */
async function syncTotalMarks(dailyTestId: string, db: Queryable) {
  const row = await queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(marks), 0)::int AS total FROM daily_test_questions WHERE daily_test_id = $1`,
    [dailyTestId],
    db,
  );
  await query(`UPDATE daily_tests SET total_marks = $2 WHERE id = $1`, [dailyTestId, row?.total ?? 0], db);
}

// ------------------------------------------------------------------ ADMIN FUNCTIONS

export async function adminList(opts: {
  page: number;
  pageSize: number;
  q?: string;
  status?: TestStatus;
}): Promise<Paginated<DailyTest & { attempt_count: number }>> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q}%`);
    where.push(`(dt.title ILIKE $${params.length} OR dt.category ILIKE $${params.length})`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`dt.status = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM daily_tests dt ${whereSql}`, params);
  params.push(opts.pageSize, (opts.page - 1) * opts.pageSize);
  const items = await query<DailyTest & { attempt_count: number }>(
    `SELECT ${ADMIN_COLUMNS},
            (SELECT COUNT(*) FROM daily_test_attempts a WHERE a.daily_test_id = dt.id)::int AS attempt_count
       FROM daily_tests dt ${whereSql}
      ORDER BY dt.test_date DESC, dt.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { items, page: opts.page, pageSize: opts.pageSize, total, totalPages: Math.max(1, Math.ceil(total / opts.pageSize)) };
}

export async function adminGet(id: string) {
  const row = await queryOne<DailyTest & { attempt_count: number }>(
    `SELECT ${ADMIN_COLUMNS},
            (SELECT COUNT(*) FROM daily_test_attempts a WHERE a.daily_test_id = dt.id)::int AS attempt_count
       FROM daily_tests dt WHERE dt.id = $1`,
    [id],
  );
  if (!row) throw Errors.notFound('Daily test');
  return row;
}

export async function create(input: DailyTestInput, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO daily_tests (test_date, title, description, category, duration_minutes, negative_marks, status, instructions, created_by, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $7::test_status = 'PUBLISHED' THEN now() END) RETURNING id`,
      [
        input.test_date,
        input.title,
        input.description,
        input.category,
        input.duration_minutes,
        input.negative_marks,
        input.status,
        input.instructions,
        admin.id,
      ],
      db,
    );
    await logAudit(admin.id, 'DAILY_TEST_CREATED', 'daily_test', row!.id, { title: input.title, date: input.test_date }, db);
    return row!.id;
  });
}

export async function update(id: string, input: DailyTestInput, admin: User) {
  return transaction(async (db) => {
    const existing = await queryOne<{ status: TestStatus }>(`SELECT status FROM daily_tests WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Daily test');

    if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      const [{ count }] = await query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM daily_test_questions WHERE daily_test_id = $1`,
        [id],
        db,
      );
      if (count === 0) throw new ApiError(409, 'CONFLICT', 'Add at least one question before publishing');
    }

    await query(
      `UPDATE daily_tests
          SET test_date = $2, title = $3, description = $4, category = $5, duration_minutes = $6,
              negative_marks = $7, status = $8, instructions = $9,
              published_at = CASE WHEN $8::test_status = 'PUBLISHED' AND published_at IS NULL THEN now() ELSE published_at END
        WHERE id = $1`,
      [id, input.test_date, input.title, input.description, input.category, input.duration_minutes, input.negative_marks, input.status, input.instructions],
      db,
    );
    await logAudit(admin.id, 'DAILY_TEST_UPDATED', 'daily_test', id, { fields: Object.keys(input) }, db);
  });
}

export async function setStatus(id: string, status: TestStatus, admin: User) {
  return transaction(async (db) => {
    const existing = await queryOne<{ status: TestStatus }>(`SELECT status FROM daily_tests WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Daily test');

    if (status === 'PUBLISHED') {
      const [{ count }] = await query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM daily_test_questions WHERE daily_test_id = $1`,
        [id],
        db,
      );
      if (count === 0) throw new ApiError(409, 'CONFLICT', 'Add at least one question before publishing');
    }

    await query(
      `UPDATE daily_tests SET status = $2,
              published_at = CASE WHEN $2::test_status = 'PUBLISHED' THEN COALESCE(published_at, now()) ELSE published_at END
        WHERE id = $1`,
      [id, status],
      db,
    );
    await logAudit(admin.id, `DAILY_TEST_${status}`, 'daily_test', id, { from: existing.status }, db);
  });
}

export async function remove(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ title: string; history: number }>(
      `SELECT title, ((SELECT COUNT(*) FROM daily_test_attempts WHERE daily_test_id = $1))::int AS history
         FROM daily_tests WHERE id = $1 FOR UPDATE`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Daily test');
    if (row.history > 0) {
      throw Errors.conflict('This daily test has attempt history. Archive it instead to retain historical records.');
    }
    await query(`DELETE FROM daily_tests WHERE id = $1`, [id], db);
    await logAudit(admin.id, 'DAILY_TEST_DELETED', 'daily_test', id, { title: row.title }, db);
  });
}

// ------------------------------------------------------------------ QUESTIONS

export async function listQuestionsForAdmin(dailyTestId: string): Promise<DailyTestQuestion[]> {
  return query<DailyTestQuestion>(
    `SELECT ${QUESTION_ADMIN_COLUMNS} FROM daily_test_questions WHERE daily_test_id = $1 ORDER BY question_order`,
    [dailyTestId],
  );
}

export async function addQuestion(dailyTestId: string, input: DailyQuestionInput, admin: User) {
  return transaction(async (db) => {
    const test = await queryOne(`SELECT 1 FROM daily_tests WHERE id = $1 FOR UPDATE`, [dailyTestId], db);
    if (!test) throw Errors.notFound('Daily test');

    const maxRow = await queryOne<{ next: number }>(
      `SELECT COALESCE(MAX(question_order), 0) + 1 AS next FROM daily_test_questions WHERE daily_test_id = $1`,
      [dailyTestId],
      db,
    );
    const order = maxRow!.next;

    const row = await queryOne<DailyTestQuestion>(
      `INSERT INTO daily_test_questions (daily_test_id, question_text, option_a, option_b, option_c, option_d,
                                         correct_answer, explanation, marks, question_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING ${QUESTION_ADMIN_COLUMNS}`,
      [dailyTestId, input.question_text, input.option_a, input.option_b, input.option_c, input.option_d,
        input.correct_answer, input.explanation, input.marks ?? 1, order],
      db,
    );

    await syncTotalMarks(dailyTestId, db);
    await logAudit(admin.id, 'DAILY_QUESTION_CREATED', 'daily_test_question', row!.id, { daily_test_id: dailyTestId }, db);
    return row!;
  });
}

export async function updateQuestion(id: string, input: DailyQuestionInput, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<DailyTestQuestion>(
      `UPDATE daily_test_questions
          SET question_text = $2, option_a = $3, option_b = $4, option_c = $5, option_d = $6,
              correct_answer = $7, explanation = $8, marks = $9
        WHERE id = $1 RETURNING ${QUESTION_ADMIN_COLUMNS}`,
      [id, input.question_text, input.option_a, input.option_b, input.option_c, input.option_d,
        input.correct_answer, input.explanation, input.marks ?? 1],
      db,
    );
    if (!row) throw Errors.notFound('Question');
    await syncTotalMarks(row.daily_test_id, db);
    await logAudit(admin.id, 'DAILY_QUESTION_UPDATED', 'daily_test_question', id, { daily_test_id: row.daily_test_id }, db);
    return row;
  });
}

export async function removeQuestion(id: string, admin: User) {
  return transaction(async (db) => {
    const row = await queryOne<{ daily_test_id: string; answered: boolean }>(
      `SELECT daily_test_id, EXISTS (SELECT 1 FROM daily_test_user_answers WHERE question_id = $1) AS answered
         FROM daily_test_questions WHERE id = $1 FOR UPDATE`,
      [id],
      db,
    );
    if (!row) throw Errors.notFound('Question');
    if (row.answered) {
      throw new ApiError(409, 'CONFLICT', 'Students have already answered this question. Edit it instead.');
    }
    await query(`DELETE FROM daily_test_questions WHERE id = $1`, [id], db);
    await syncTotalMarks(row.daily_test_id, db);
    await logAudit(admin.id, 'DAILY_QUESTION_DELETED', 'daily_test_question', id, { daily_test_id: row.daily_test_id }, db);
  });
}

export async function reorderQuestions(dailyTestId: string, orderedIds: string[], admin: User) {
  return transaction(async (db) => {
    await db.query('SET CONSTRAINTS uq_daily_question_order DEFERRED');
    await query(
      `UPDATE daily_test_questions q SET question_order = v.ord
         FROM unnest($1::uuid[]) WITH ORDINALITY AS v(id, ord)
        WHERE q.id = v.id AND q.daily_test_id = $2`,
      [orderedIds, dailyTestId],
      db,
    );
    await logAudit(admin.id, 'DAILY_QUESTIONS_REORDERED', 'daily_test', dailyTestId, { count: orderedIds.length }, db);
  });
}

export async function saveBulkQuestions(
  dailyTestId: string,
  questions: DailyQuestionBulkItem[],
  admin: User,
): Promise<DailyTestQuestion[]> {
  return transaction(async (db) => {
    const test = await queryOne(`SELECT 1 FROM daily_tests WHERE id = $1 FOR UPDATE`, [dailyTestId], db);
    if (!test) throw Errors.notFound('Daily test');

    // Defer question_order constraint so updates/reorders inside transaction do not conflict
    await db.query('SET CONSTRAINTS uq_daily_question_order DEFERRED');

    // Fetch existing question IDs in DB for this daily test
    const existingDbQuestions = await query<{ id: string }>(
      `SELECT id FROM daily_test_questions WHERE daily_test_id = $1`,
      [dailyTestId],
      db,
    );
    const existingDbIds = new Set(existingDbQuestions.map((q) => q.id));

    // Determine which questions are kept and which are removed
    const incomingIds = new Set(questions.map((q) => q.id).filter(Boolean) as string[]);
    const deletedIds = Array.from(existingDbIds).filter((id) => !incomingIds.has(id));

    // If any deleted question has student answers, prevent deletion
    if (deletedIds.length > 0) {
      const answered = await query<{ question_id: string }>(
        `SELECT DISTINCT question_id FROM daily_test_user_answers WHERE question_id = ANY($1::uuid[])`,
        [deletedIds],
        db,
      );
      if (answered.length > 0) {
        throw new ApiError(409, 'CONFLICT', 'One or more removed questions have already been answered by students.');
      }
      await query(`DELETE FROM daily_test_questions WHERE id = ANY($1::uuid[])`, [deletedIds], db);
    }

    // Process each incoming question with its exact display sequence (index + 1)
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const order = i + 1;
      const marks = q.marks ?? 1;
      const explanation = q.explanation ?? null;

      if (q.id && existingDbIds.has(q.id)) {
        // Update existing question
        await query(
          `UPDATE daily_test_questions
              SET question_text = $2, option_a = $3, option_b = $4, option_c = $5, option_d = $6,
                  correct_answer = $7, explanation = $8, marks = $9, question_order = $10
            WHERE id = $1`,
          [q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, explanation, marks, order],
          db,
        );
      } else {
        // Insert new question
        await query(
          `INSERT INTO daily_test_questions (daily_test_id, question_text, option_a, option_b, option_c, option_d,
                                             correct_answer, explanation, marks, question_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [dailyTestId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, explanation, marks, order],
          db,
        );
      }
    }

    await syncTotalMarks(dailyTestId, db);
    await logAudit(admin.id, 'DAILY_QUESTIONS_BULK_SAVED', 'daily_test', dailyTestId, { count: questions.length }, db);

    return query<DailyTestQuestion>(
      `SELECT ${QUESTION_ADMIN_COLUMNS} FROM daily_test_questions WHERE daily_test_id = $1 ORDER BY question_order`,
      [dailyTestId],
      db,
    );
  });
}

// ------------------------------------------------------------------ STUDENT FUNCTIONS

export async function getTodayPublished(user: User | null): Promise<PublicDailyTest | null> {
  const todayIST = getTodayIST();
  const row = await queryOne<DailyTest>(
    `SELECT ${ADMIN_COLUMNS} FROM daily_tests dt WHERE dt.test_date = $1 AND dt.status = 'PUBLISHED'`,
    [todayIST],
  );
  if (!row) return null;

  let userAttempt = null;
  if (user) {
    const attempt = await queryOne<DailyTestAttempt>(
      `SELECT ${ATTEMPT_COLUMNS} FROM daily_test_attempts a
        WHERE a.user_id = $1 AND a.daily_test_id = $2
        ORDER BY a.started_at DESC LIMIT 1`,
      [user.id, row.id],
    );
    if (attempt) {
      userAttempt = {
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        total_marks: attempt.total_marks,
        percentage: attempt.percentage,
      };
    }
  }

  return {
    id: row.id,
    test_date: row.test_date,
    title: row.title,
    description: row.description,
    category: row.category,
    duration_minutes: row.duration_minutes,
    total_marks: row.total_marks,
    negative_marks: row.negative_marks,
    instructions: row.instructions,
    published_at: row.published_at,
    question_count: row.question_count,
    is_today: true,
    is_past: false,
    user_attempt: userAttempt,
  };
}

export async function listPublished(user: User | null): Promise<PublicDailyTest[]> {
  const todayIST = getTodayIST();
  const rows = await query<DailyTest>(
    `SELECT ${ADMIN_COLUMNS} FROM daily_tests dt
      WHERE dt.status = 'PUBLISHED' AND dt.test_date <= $1
      ORDER BY dt.test_date DESC, dt.created_at DESC`,
    [todayIST],
  );

  const attemptsMap = new Map<string, { id: string; status: DailyTestAttempt['status']; score: number | null; total_marks: number; percentage: number | null }>();
  if (user && rows.length > 0) {
    const attempts = await query<DailyTestAttempt>(
      `SELECT DISTINCT ON (a.daily_test_id) ${ATTEMPT_COLUMNS}
         FROM daily_test_attempts a
        WHERE a.user_id = $1 AND a.daily_test_id = ANY($2::uuid[])
        ORDER BY a.daily_test_id, a.started_at DESC`,
      [user.id, rows.map((r) => r.id)],
    );
    for (const a of attempts) {
      attemptsMap.set(a.daily_test_id, {
        id: a.id,
        status: a.status,
        score: a.score,
        total_marks: a.total_marks,
        percentage: a.percentage,
      });
    }
  }

  return rows.map((r) => {
    const isToday = r.test_date === todayIST;
    const isPast = r.test_date < todayIST;
    return {
      id: r.id,
      test_date: r.test_date,
      title: r.title,
      description: r.description,
      category: r.category,
      duration_minutes: r.duration_minutes,
      total_marks: r.total_marks,
      negative_marks: r.negative_marks,
      instructions: r.instructions,
      published_at: r.published_at,
      question_count: r.question_count,
      is_today: isToday,
      is_past: isPast,
      user_attempt: attemptsMap.get(r.id) ?? null,
    };
  });
}

export async function getPublished(id: string, user: User | null): Promise<PublicDailyTest | null> {
  const todayIST = getTodayIST();
  const row = await queryOne<DailyTest>(
    `SELECT ${ADMIN_COLUMNS} FROM daily_tests dt WHERE dt.id = $1 AND dt.status = 'PUBLISHED' AND dt.test_date <= $2`,
    [id, todayIST],
  );
  if (!row) return null;

  let userAttempt = null;
  if (user) {
    const attempt = await queryOne<DailyTestAttempt>(
      `SELECT ${ATTEMPT_COLUMNS} FROM daily_test_attempts a
        WHERE a.user_id = $1 AND a.daily_test_id = $2
        ORDER BY a.started_at DESC LIMIT 1`,
      [user.id, row.id],
    );
    if (attempt) {
      userAttempt = {
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        total_marks: attempt.total_marks,
        percentage: attempt.percentage,
      };
    }
  }

  return {
    id: row.id,
    test_date: row.test_date,
    title: row.title,
    description: row.description,
    category: row.category,
    duration_minutes: row.duration_minutes,
    total_marks: row.total_marks,
    negative_marks: row.negative_marks,
    instructions: row.instructions,
    published_at: row.published_at,
    question_count: row.question_count,
    is_today: row.test_date === todayIST,
    is_past: row.test_date < todayIST,
    user_attempt: userAttempt,
  };
}

// ------------------------------------------------------------------ TEST ATTEMPT FLOW

export interface StartedDailyAttempt {
  attempt: {
    id: string;
    started_at: string;
    expires_at: string;
    server_now: string;
    duration_minutes: number;
    resumed: boolean;
  };
  test: { id: string; title: string; test_date: string; category: string | null; instructions: string | null; total_marks: number };
  questions: StudentDailyTestQuestion[];
  saved_answers: { questionId: string; selectedAnswer: AnswerOption | null }[];
}

export async function start(user: User, dailyTestId: string): Promise<StartedDailyAttempt> {
  return transaction(async (db) => {
    const todayIST = getTodayIST();
    const test = await queryOne<DailyTest>(
      `SELECT ${ADMIN_COLUMNS} FROM daily_tests dt WHERE dt.id = $1 AND dt.status = 'PUBLISHED' AND dt.test_date <= $2`,
      [dailyTestId, todayIST],
      db,
    );
    if (!test) throw Errors.notFound('Daily test');

    // Advisory lock per user + test
    await db.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`daily:${user.id}:${dailyTestId}`]);

    const open = await queryOne<DailyTestAttempt & { question_ids: string[]; expired: boolean }>(
      `SELECT ${ATTEMPT_COLUMNS}, a.question_ids,
              now() > a.started_at + make_interval(mins => $3) AS expired
         FROM daily_test_attempts a
        WHERE a.user_id = $1 AND a.daily_test_id = $2 AND a.status = 'IN_PROGRESS'
        ORDER BY a.started_at DESC LIMIT 1`,
      [user.id, dailyTestId, test.duration_minutes],
      db,
    );

    let attempt: DailyTestAttempt & { question_ids: string[] };
    let resumed = false;
    if (open && !open.expired) {
      attempt = open;
      resumed = true;
    } else {
      if (open?.expired) {
        await finalize(db, open, new Map(), true);
      }
      const questions = await query<{ id: string }>(
        `SELECT id FROM daily_test_questions WHERE daily_test_id = $1 ORDER BY question_order`,
        [dailyTestId],
        db,
      );
      if (questions.length === 0) throw Errors.conflict('This daily test has no questions yet');
      const questionIds = questions.map((q) => q.id);

      attempt = (await queryOne<DailyTestAttempt & { question_ids: string[] }>(
        `INSERT INTO daily_test_attempts AS a (user_id, daily_test_id, total_marks, total_questions, question_ids)
         VALUES ($1,$2,$3,$4,$5) RETURNING ${ATTEMPT_COLUMNS}, a.question_ids`,
        [user.id, dailyTestId, test.total_marks, questionIds.length, questionIds],
        db,
      ))!;
    }

    const questionList = await query<StudentDailyTestQuestion>(
      `SELECT ${QUESTION_STUDENT_COLUMNS} FROM daily_test_questions
        WHERE id = ANY($1::uuid[]) ORDER BY array_position($1::uuid[], id)`,
      [attempt.question_ids],
      db,
    );

    const saved = await query<{ question_id: string; selected_answer: AnswerOption | null }>(
      `SELECT question_id, selected_answer FROM daily_test_user_answers WHERE attempt_id = $1`,
      [attempt.id],
      db,
    );

    const times = await queryOne<{ expires_at: string; server_now: string }>(
      `SELECT ($1::timestamptz + make_interval(mins => $2)) AS expires_at, now() AS server_now`,
      [attempt.started_at, test.duration_minutes],
      db,
    );

    return {
      attempt: {
        id: attempt.id,
        started_at: attempt.started_at,
        expires_at: times!.expires_at,
        server_now: times!.server_now,
        duration_minutes: test.duration_minutes,
        resumed,
      },
      test: {
        id: test.id,
        title: test.title,
        test_date: test.test_date,
        category: test.category,
        instructions: test.instructions,
        total_marks: test.total_marks,
      },
      questions: questionList,
      saved_answers: saved.map((s) => ({ questionId: s.question_id, selectedAnswer: s.selected_answer })),
    };
  });
}

async function loadOwnedOpenAttempt(db: Queryable, user: User, dailyTestId: string, attemptId: string) {
  const attempt = await queryOne<DailyTestAttempt & { question_ids: string[]; duration_minutes: number; negative_marks: number; seconds_elapsed: number }>(
    `SELECT ${ATTEMPT_COLUMNS}, a.question_ids, dt.duration_minutes, dt.negative_marks::float AS negative_marks,
            EXTRACT(EPOCH FROM (now() - a.started_at))::int AS seconds_elapsed
       FROM daily_test_attempts a JOIN daily_tests dt ON dt.id = a.daily_test_id
      WHERE a.id = $1 FOR UPDATE OF a`,
    [attemptId],
    db,
  );
  if (!attempt || attempt.user_id !== user.id || attempt.daily_test_id !== dailyTestId) throw Errors.notFound('Attempt');
  if (attempt.status !== 'IN_PROGRESS') throw Errors.conflict('This attempt has already been submitted');
  return attempt;
}

export async function saveAnswers(
  user: User,
  dailyTestId: string,
  attemptId: string,
  answers: { questionId: string; selectedAnswer: AnswerOption | null }[],
) {
  return transaction(async (db) => {
    const attempt = await loadOwnedOpenAttempt(db, user, dailyTestId, attemptId);
    if (attempt.seconds_elapsed > attempt.duration_minutes * 60 + SUBMIT_GRACE_SECONDS) {
      throw Errors.conflict('Time is up for this attempt');
    }
    const allowed = new Set(attempt.question_ids);
    const valid = answers.filter((a) => allowed.has(a.questionId));
    if (valid.length) {
      await query(
        `INSERT INTO daily_test_user_answers (attempt_id, question_id, selected_answer)
         SELECT $1, v.qid, v.ans::answer_option FROM unnest($2::uuid[], $3::text[]) AS v(qid, ans)
         ON CONFLICT (attempt_id, question_id) DO UPDATE SET selected_answer = EXCLUDED.selected_answer`,
        [attemptId, valid.map((a) => a.questionId), valid.map((a) => a.selectedAnswer)],
        db,
      );
    }
    return { saved: valid.length };
  });
}

async function finalize(
  db: Queryable,
  attempt: DailyTestAttempt & { question_ids: string[]; duration_minutes?: number; negative_marks?: number },
  submitted: Map<string, AnswerOption | null>,
  late: boolean,
) {
  const key = await query<{ id: string; correct_answer: AnswerOption; marks: number }>(
    `SELECT id, correct_answer, marks FROM daily_test_questions WHERE id = ANY($1::uuid[])`,
    [attempt.question_ids],
    db,
  );
  const keyMap = new Map(key.map((k) => [k.id, k]));

  const saved = await query<{ question_id: string; selected_answer: AnswerOption | null }>(
    `SELECT question_id, selected_answer FROM daily_test_user_answers WHERE attempt_id = $1`,
    [attempt.id],
    db,
  );
  const selections = new Map<string, AnswerOption | null>(saved.map((s) => [s.question_id, s.selected_answer]));
  if (!late) {
    for (const [qid, ans] of submitted) selections.set(qid, ans);
  }

  const negativeMarks = Number(attempt.negative_marks ?? 0);
  let totalScore = 0;
  let maxMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const answerResults: { questionId: string; selectedAnswer: AnswerOption | null; isCorrect: boolean | null }[] = [];

  for (const qid of attempt.question_ids) {
    const q = keyMap.get(qid);
    if (!q) continue;

    const qMarks = Number(q.marks ?? 1);
    maxMarks += qMarks;

    const sel = selections.get(qid) ?? null;
    if (sel === null) {
      unansweredCount++;
      answerResults.push({ questionId: qid, selectedAnswer: null, isCorrect: null });
    } else if (sel === q.correct_answer) {
      correctCount++;
      totalScore += qMarks;
      answerResults.push({ questionId: qid, selectedAnswer: sel, isCorrect: true });
    } else {
      incorrectCount++;
      totalScore -= negativeMarks;
      answerResults.push({ questionId: qid, selectedAnswer: sel, isCorrect: false });
    }
  }

  const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
  const percentage = maxMarks > 0 ? Math.max(0, Math.round((finalScore / maxMarks) * 10000) / 100) : 0;

  await query(
    `INSERT INTO daily_test_user_answers (attempt_id, question_id, selected_answer, is_correct)
     SELECT $1, v.qid, v.ans::answer_option, v.ok FROM unnest($2::uuid[], $3::text[], $4::boolean[]) AS v(qid, ans, ok)
     ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET selected_answer = EXCLUDED.selected_answer, is_correct = EXCLUDED.is_correct`,
    [
      attempt.id,
      answerResults.map((a) => a.questionId),
      answerResults.map((a) => a.selectedAnswer),
      answerResults.map((a) => a.isCorrect),
    ],
    db,
  );

  await query(
    `UPDATE daily_test_attempts a
        SET status = 'COMPLETED', submitted_at = now(), score = $2, total_marks = $3,
            correct_answers = $4, incorrect_answers = $5, unanswered = $6, percentage = $7,
            time_taken_seconds = LEAST(EXTRACT(EPOCH FROM (now() - a.started_at))::int,
                                       (SELECT duration_minutes * 60 FROM daily_tests WHERE id = a.daily_test_id))
      WHERE a.id = $1`,
    [attempt.id, finalScore, maxMarks, correctCount, incorrectCount, unansweredCount, percentage],
    db,
  );

  return {
    score: finalScore,
    totalMarks: maxMarks,
    correct: correctCount,
    incorrect: incorrectCount,
    unanswered: unansweredCount,
    percentage,
  };
}

export async function submit(
  user: User,
  dailyTestId: string,
  attemptId: string,
  answers: { questionId: string; selectedAnswer: AnswerOption | null }[],
) {
  return transaction(async (db) => {
    const attempt = await loadOwnedOpenAttempt(db, user, dailyTestId, attemptId);
    const allowed = new Set(attempt.question_ids);
    const submitted = new Map(answers.filter((a) => allowed.has(a.questionId)).map((a) => [a.questionId, a.selectedAnswer]));
    const late = attempt.seconds_elapsed > attempt.duration_minutes * 60 + SUBMIT_GRACE_SECONDS;
    const result = await finalize(db, attempt, submitted, late);
    return {
      attemptId,
      late,
      score: result.score,
      total_marks: result.totalMarks,
      total: attempt.total_questions,
      correct: result.correct,
      incorrect: result.incorrect,
      unanswered: result.unanswered,
      percentage: result.percentage,
    };
  });
}

export async function getResult(user: User, attemptId: string): Promise<DailyTestResult> {
  const attempt = await queryOne<DailyTestAttempt & { question_ids: string[]; test_title: string; test_date: string; category: string | null; duration_minutes: number; user_name: string; user_email: string }>(
    `SELECT ${ATTEMPT_COLUMNS}, a.question_ids, dt.title AS test_title, dt.test_date::text AS test_date,
            dt.category, dt.duration_minutes, u.name AS user_name, u.email AS user_email
       FROM daily_test_attempts a
       JOIN daily_tests dt ON dt.id = a.daily_test_id
       JOIN users u ON u.id = a.user_id
      WHERE a.id = $1`,
    [attemptId],
  );
  if (!attempt) throw Errors.notFound('Daily test result');
  if (attempt.user_id !== user.id && user.role !== 'ADMIN') throw Errors.forbidden('This result belongs to another student');
  if (attempt.status !== 'COMPLETED') throw Errors.conflict('This attempt has not been submitted yet');

  const review = await query<DailyTestReviewItem>(
    `SELECT q.id AS question_id, ord.n::int AS question_order, q.question_text, q.option_a, q.option_b, q.option_c,
            q.option_d, q.correct_answer, q.explanation, q.marks, ua.selected_answer, ua.is_correct
       FROM unnest($2::uuid[]) WITH ORDINALITY AS ord(id, n)
       JOIN daily_test_questions q ON q.id = ord.id
       LEFT JOIN daily_test_user_answers ua ON ua.attempt_id = $1 AND ua.question_id = q.id
      ORDER BY ord.n`,
    [attemptId, attempt.question_ids],
  );

  const { question_ids: _omit, ...rest } = attempt;
  void _omit;
  return { ...rest, review };
}

export async function listForUser(userId: string, limit = 50): Promise<DailyTestAttempt[]> {
  return query<DailyTestAttempt>(
    `SELECT ${ATTEMPT_COLUMNS}, dt.title AS test_title, dt.test_date::text AS test_date
       FROM daily_test_attempts a JOIN daily_tests dt ON dt.id = a.daily_test_id
      WHERE a.user_id = $1
      ORDER BY a.started_at DESC LIMIT $2`,
    [userId, limit],
  );
}
