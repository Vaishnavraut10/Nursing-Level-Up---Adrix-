const express = require('express');
const { query } = require('../../config/database');
const { requireAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/purchases - List all purchases
router.get('/purchases', requireAdmin, async (req, res) => {
  try {
    const { status, test_series_id } = req.query;
    
    let queryString = `
      SELECT p.*, u.name as user_name, u.email as user_email, ts.title as test_series_title
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN test_series ts ON p.test_series_id = ts.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      queryString += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (test_series_id) {
      queryString += ` AND p.test_series_id = $${paramIndex}`;
      params.push(test_series_id);
      paramIndex++;
    }
    
    queryString += ' ORDER BY p.created_at DESC LIMIT 100';
    
    const result = await query(queryString, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

module.exports = router;