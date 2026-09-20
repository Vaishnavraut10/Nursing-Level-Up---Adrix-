const express = require('express');
const { query } = require('../../config/database');
const { requireAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/dashboard - Platform statistics
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['STUDENT']);
    
    // Get total test series
    const testSeriesResult = await query('SELECT COUNT(*) as count FROM test_series');
    
    // Get paid test series
    const paidTestSeriesResult = await query('SELECT COUNT(*) as count FROM test_series WHERE is_free = false');
    
    // Get total purchases
    const purchasesResult = await query('SELECT COUNT(*) as count FROM purchases WHERE status = $1', ['SUCCESS']);
    
    // Get total attempts
    const attemptsResult = await query('SELECT COUNT(*) as count FROM attempts WHERE status = $1', ['COMPLETED']);
    
    // Get revenue
    const revenueResult = await query('SELECT COALESCE(SUM(amount), 0) as revenue FROM purchases WHERE status = $1', ['SUCCESS']);
    
    // Get recent registrations
    const recentRegistrations = await query(`
      SELECT id, email, name, created_at 
      FROM users 
      WHERE role = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, ['STUDENT']);
    
    // Get recent purchases
    const recentPurchases = await query(`
      SELECT p.id, u.name, u.email, ts.title, p.amount, p.status, p.created_at
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN test_series ts ON p.test_series_id = ts.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    // Get recent attempts
    const recentAttempts = await query(`
      SELECT a.id, u.name, ts.title, a.score, a.total_questions, a.submitted_at
      FROM attempts a
      JOIN users u ON a.user_id = u.id
      JOIN test_series ts ON a.test_series_id = ts.id
      WHERE a.status = $1
      ORDER BY a.submitted_at DESC
      LIMIT 5
    `, ['COMPLETED']);
    
    // Get test series overview
    const testSeriesOverview = await query(`
      SELECT id, title, is_free, price, status, question_count
      FROM test_series
      ORDER BY id
    `);
    
    res.json({
      statistics: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalTestSeries: parseInt(testSeriesResult.rows[0].count),
        paidTestSeries: parseInt(paidTestSeriesResult.rows[0].count),
        totalPurchases: parseInt(purchasesResult.rows[0].count),
        totalAttempts: parseInt(attemptsResult.rows[0].count),
        revenue: parseFloat(revenueResult.rows[0].revenue)
      },
      recentRegistrations: recentRegistrations.rows,
      recentPurchases: recentPurchases.rows,
      recentAttempts: recentAttempts.rows,
      testSeriesOverview: testSeriesOverview.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;