const express = require('express');
const { query } = require('../../config/database');
const { requireAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/users - List all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let queryString = 'SELECT id, email, name, role, created_at, last_activity FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (role) {
      queryString += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    
    if (search) {
      queryString += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    queryString += ' ORDER BY created_at DESC LIMIT 100';
    
    const result = await query(queryString, params);
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(result.rows.map(async (user) => {
      const attemptsResult = await query(
        'SELECT COUNT(*) as count FROM attempts WHERE user_id = $1',
        [user.id]
      );
      const purchasesResult = await query(
        'SELECT COUNT(*) as count FROM purchases WHERE user_id = $1',
        [user.id]
      );
      
      return {
        ...user,
        testsAttempted: parseInt(attemptsResult.rows[0].count),
        purchases: parseInt(purchasesResult.rows[0].count)
      };
    }));
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get purchases
    const purchasesResult = await query(`
      SELECT p.*, ts.title as test_series_title
      FROM purchases p
      JOIN test_series ts ON p.test_series_id = ts.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [id]);
    
    // Get attempts
    const attemptsResult = await query(`
      SELECT a.*, ts.title as test_series_title
      FROM attempts a
      JOIN test_series ts ON a.test_series_id = ts.id
      WHERE a.user_id = $1
      ORDER BY a.started_at DESC
    `, [id]);
    
    // Calculate overall progress
    const totalAttempts = attemptsResult.rows.length;
    const completedAttempts = attemptsResult.rows.filter(a => a.status === 'COMPLETED').length;
    const averageScore = completedAttempts > 0 
      ? attemptsResult.rows
          .filter(a => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + a.score, 0) / completedAttempts
      : 0;
    const bestScore = completedAttempts > 0
      ? Math.max(...attemptsResult.rows.filter(a => a.status === 'COMPLETED').map(a => a.score))
      : 0;
    
    res.json({
      user,
      purchases: purchasesResult.rows,
      attempts: attemptsResult.rows,
      progress: {
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore),
        bestScore
      }
    });
  } catch (error) {
    console.error('User detail error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

module.exports = router;