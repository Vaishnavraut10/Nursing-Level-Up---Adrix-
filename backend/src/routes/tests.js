const express = require('express');
const { query } = require('../config/database');
const { requireAuth, attachUser } = require('../middleware/auth');

const router = express.Router();

// POST /api/tests/:id/start - Start a test attempt
router.post('/:id/start', requireAuth, attachUser, async (req, res) => {
  try {
    const { id: testSeriesId } = req.params;
    const userId = req.userId;

    // Verify test series exists and is published
    const testSeriesResult = await query(
      'SELECT id, is_free FROM test_series WHERE id = $1 AND status = $2',
      [testSeriesId, 'PUBLISHED']
    );

    if (testSeriesResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found or not published' });
    }

    const testSeries = testSeriesResult.rows[0];

    // If paid test, check if user has purchased
    if (!testSeries.is_free) {
      const purchaseResult = await query(
        'SELECT id FROM purchases WHERE user_id = $1 AND test_series_id = $2 AND status = $3',
        [userId, testSeriesId, 'SUCCESS']
      );

      if (purchaseResult.rows.length === 0) {
        return res.status(403).json({ 
          error: 'This test series requires purchase',
          code: 'PURCHASE_REQUIRED'
        });
      }
    }

    // Check if user has an in-progress attempt
    const existingAttempt = await query(
      'SELECT id FROM attempts WHERE user_id = $1 AND test_series_id = $2 AND status = $3',
      [userId, testSeriesId, 'IN_PROGRESS']
    );

    if (existingAttempt.rows.length > 0) {
      return res.json({ attemptId: existingAttempt.rows[0].id, existing: true });
    }

    // Create new attempt
    const result = await query(
      'INSERT INTO attempts (user_id, test_series_id, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, testSeriesId, 'IN_PROGRESS']
    );

    res.json({ attemptId: result.rows[0].id, existing: false });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

// POST /api/tests/:id/submit - Submit a test attempt
router.post('/:id/submit', requireAuth, attachUser, async (req, res) => {
  try {
    const { id: attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.userId;

    // Verify attempt belongs to user
    const attemptResult = await query(
      'SELECT id, test_series_id, started_at FROM attempts WHERE id = $1 AND user_id = $2',
      [attemptId, userId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    // Get questions for this test series with correct answers
    const questionsResult = await query(
      'SELECT id, correct_answer FROM questions WHERE test_series_id = $1 ORDER BY order_index',
      [attempt.test_series_id]
    );

    const questions = questionsResult.rows;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    // Calculate score and save answers
    for (const question of questions) {
      const selectedAnswer = answers[question.id];
      const isCorrect = selectedAnswer === question.correct_answer;

      if (selectedAnswer) {
        if (isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        unansweredCount++;
      }

      // Save user answer
      await query(
        'INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct) VALUES ($1, $2, $3, $4)',
        [attemptId, question.id, selectedAnswer || null, isCorrect || null]
      );
    }

    const totalQuestions = questions.length;
    const score = correctCount;
    const timeTaken = Math.floor((new Date() - new Date(attempt.started_at)) / 1000);

    // Update attempt
    await query(
      'UPDATE attempts SET submitted_at = CURRENT_TIMESTAMP, score = $1, total_questions = $2, correct_answers = $3, incorrect_answers = $4, unanswered = $5, time_taken = $6, status = $7 WHERE id = $8',
      [score, totalQuestions, correctCount, incorrectCount, unansweredCount, timeTaken, 'COMPLETED', attemptId]
    );

    res.json({
      attemptId,
      score,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      timeTaken
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// GET /api/tests/:id/result - Get test result
router.get('/:id/result', requireAuth, attachUser, async (req, res) => {
  try {
    const { id: attemptId } = req.params;
    const userId = req.userId;

    // Verify attempt belongs to user
    const attemptResult = await query(
      'SELECT a.*, ts.title as test_series_title FROM attempts a JOIN test_series ts ON a.test_series_id = ts.id WHERE a.id = $1 AND a.user_id = $2',
      [attemptId, userId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    // Get user answers with correct answers
    const answersResult = await query(
      'SELECT ua.*, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation FROM user_answers ua JOIN questions q ON ua.question_id = q.id WHERE ua.attempt_id = $1',
      [attemptId]
    );

    res.json({
      attempt,
      answers: answersResult.rows
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

module.exports = router;