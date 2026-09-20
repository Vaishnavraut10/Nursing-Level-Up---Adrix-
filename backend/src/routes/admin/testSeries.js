const express = require('express');
const { query } = require('../../config/database');
const { requireAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/test-series - List all test series
router.get('/test-series', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let queryString = 'SELECT * FROM test_series';
    const params = [];
    
    if (status) {
      queryString += ' WHERE status = $1';
      params.push(status);
    }
    
    queryString += ' ORDER BY id DESC';
    
    const result = await query(queryString, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Test series error:', error);
    res.status(500).json({ error: 'Failed to fetch test series' });
  }
});

// POST /api/admin/test-series - Create test series
router.post('/test-series', requireAdmin, async (req, res) => {
  try {
    const { title, description, duration, is_free, price, status } = req.body;
    
    if (!title || !description || !duration) {
      return res.status(400).json({ error: 'Title, description, and duration are required' });
    }
    
    const finalPrice = is_free ? 0 : (price || 199);
    
    const result = await query(
      'INSERT INTO test_series (title, description, duration, is_free, price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, duration, is_free, finalPrice, status || 'DRAFT']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create test series error:', error);
    res.status(500).json({ error: 'Failed to create test series' });
  }
});

// GET /api/admin/test-series/:id - Get test series details
router.get('/test-series/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM test_series WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found' });
    }
    
    // Get question count
    const questionCountResult = await query(
      'SELECT COUNT(*) as count FROM questions WHERE test_series_id = $1',
      [id]
    );
    
    const testSeries = {
      ...result.rows[0],
      question_count: parseInt(questionCountResult.rows[0].count)
    };
    
    res.json(testSeries);
  } catch (error) {
    console.error('Test series detail error:', error);
    res.status(500).json({ error: 'Failed to fetch test series' });
  }
});

// PUT /api/admin/test-series/:id - Update test series
router.put('/test-series/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, is_free, price, status } = req.body;
    
    const finalPrice = is_free ? 0 : (price || 199);
    
    const result = await query(
      'UPDATE test_series SET title = $1, description = $2, duration = $3, is_free = $4, price = $5, status = $6 WHERE id = $7 RETURNING *',
      [title, description, duration, is_free, finalPrice, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update test series error:', error);
    res.status(500).json({ error: 'Failed to update test series' });
  }
});

// DELETE /api/admin/test-series/:id - Delete test series
router.delete('/test-series/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM test_series WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found' });
    }
    
    res.json({ message: 'Test series deleted successfully' });
  } catch (error) {
    console.error('Delete test series error:', error);
    res.status(500).json({ error: 'Failed to delete test series' });
  }
});

// PATCH /api/admin/test-series/:id/publish - Publish test series
router.patch('/test-series/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if test series has questions
    const questionCountResult = await query(
      'SELECT COUNT(*) as count FROM questions WHERE test_series_id = $1',
      [id]
    );
    
    if (parseInt(questionCountResult.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Cannot publish test series without questions' });
    }
    
    const result = await query(
      'UPDATE test_series SET status = $1 WHERE id = $2 RETURNING *',
      ['PUBLISHED', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Publish test series error:', error);
    res.status(500).json({ error: 'Failed to publish test series' });
  }
});

// PATCH /api/admin/test-series/:id/unpublish - Unpublish test series
router.patch('/test-series/:id/unpublish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE test_series SET status = $1 WHERE id = $2 RETURNING *',
      ['DRAFT', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test series not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Unpublish test series error:', error);
    res.status(500).json({ error: 'Failed to unpublish test series' });
  }
});

module.exports = router;