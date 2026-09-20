const express = require('express');
const { query } = require('../../config/database');

const router = express.Router();

// GET /api/test-series - Get published test series (public)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, title, description, duration, is_free, price, currency, question_count
      FROM test_series
      WHERE status = $1
      ORDER BY id
    `, ['PUBLISHED']);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Test series error:', error);
    res.status(500).json({ error: 'Failed to fetch test series' });
  }
});

// GET /api/test-series/:id - Get test series details (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT id, title, description, duration, is_free, price, currency, question_count
      FROM test_series
      WHERE id = $1 AND status = $2
    `, [id, 'PUBLISHED']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Test series detail error:', error);
    res.status(500).json({ error: 'Failed to fetch test series' });
  }
});

// GET /api/test-series/:id/questions - Get questions WITHOUT correct answers (public)
router.get('/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify test series is published
    const testSeriesResult = await query(
      'SELECT id, is_free FROM test_series WHERE id = $1 AND status = $2',
      [id, 'PUBLISHED']
    );
    
    if (testSeriesResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found or not published' });
    }
    
    const testSeries = testSeriesResult.rows[0];
    
    // If paid test, check if user has purchased
    // Note: This requires real authentication to identify the user
    // For development, we'll allow access with a header
    const devUnlock = req.headers['x-dev-unlock'];
    
    if (!testSeries.is_free && !devUnlock) {
      return res.status(403).json({ 
        error: 'This test series requires purchase. Please unlock it first.',
        requiresPurchase: true
      });
    }
    
    // Get questions WITHOUT correct_answer
    const result = await query(
      'SELECT id, test_series_id, question_text, option_a, option_b, option_c, option_d, explanation, order_index FROM questions WHERE test_series_id = $1 ORDER BY order_index',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

module.exports = router;