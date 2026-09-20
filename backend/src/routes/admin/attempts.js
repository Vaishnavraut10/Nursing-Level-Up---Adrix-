const express = require('express');
const { query } = require('../../config/database');
const { requireAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/attempts - List all attempts
router.get('/attempts', requireAdmin, async (req, res) => {
  try {
    const { test_series_id, user_id, status } = req.query;
    
    let queryString = `
      SELECT a.*, u.name as user_name, u.email as user_email, ts.title as test_series_title
      FROM attempts a
      JOIN users u ON a.user_id = u.id
      JOIN test_series ts ON a.test_series_id = ts.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (test_series_id) {
      queryString += ` AND a.test_series_id = $${paramIndex}`;
      params.push(test_series_id);
      paramIndex++;
    }
    
    if (user_id) {
      queryString += ` AND a.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    
    if (status) {
      queryString += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    queryString += ' ORDER BY a.started_at DESC LIMIT 100';
    
    const result = await query(queryString, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// GET /api/admin/attempts/:id - Get attempt details
router.get('/attempts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const attemptResult = await query(`
      SELECT a.*, u.name as user_name, u.email as user_email, ts.title as test_series_title
      FROM attempts a
      JOIN users u ON a.user_id = u.id
      JOIN test_series ts ON a.test_series_id = ts.id
      WHERE a.id = $1
    `, [id]);
    
    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    
    const attempt = attemptResult.rows[0];
    
    // Get user answers with question details
    const answersResult = await query(`
      SELECT ua.*, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.attempt_id = $1
      ORDER BY q.order_index
    `, [id]);
    
    res.json({
      attempt,
      answers: answersResult.rows
    });
  } catch (error) {
    console.error('Attempt detail error:', error);
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
});

module.exports = router;