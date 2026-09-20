const express = require('express');
const { query } = require('../config/database');
const { requireAuth, attachUser } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard - Get student dashboard data
router.get('/', requireAuth, attachUser, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's purchases
    const purchasesResult = await query(`
      SELECT p.*, ts.title as test_series_title 
      FROM purchases p 
      JOIN test_series ts ON p.test_series_id = ts.id 
      WHERE p.user_id = $1 AND p.status = $2
      ORDER BY p.created_at DESC
    `, [userId, 'SUCCESS']);

    // Get user's attempts
    const attemptsResult = await query(`
      SELECT a.*, ts.title as test_series_title 
      FROM attempts a 
      JOIN test_series ts ON a.test_series_id = ts.id 
      WHERE a.user_id = $1 
      ORDER BY a.submitted_at DESC NULLS LAST
    `, [userId]);

    // Get available free test series
    const freeTestsResult = await query(`
      SELECT id, title, description, duration, question_count 
      FROM test_series 
      WHERE is_free = true AND status = $1
      ORDER BY id
    `, ['PUBLISHED']);

    // Calculate progress
    const totalAttempts = attemptsResult.rows.length;
    const completedAttempts = attemptsResult.rows.filter(a => a.status === 'COMPLETED').length;
    const averageScore = completedAttempts > 0 
      ? Math.round(attemptsResult.rows.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts)
      : 0;
    const bestScore = completedAttempts > 0
      ? Math.max(...attemptsResult.rows.map(a => a.score || 0))
      : 0;

    res.json({
      user: req.user,
      purchases: purchasesResult.rows,
      attempts: attemptsResult.rows,
      freeTests: freeTestsResult.rows,
      progress: {
        totalAttempts,
        completedAttempts,
        averageScore,
        bestScore
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;