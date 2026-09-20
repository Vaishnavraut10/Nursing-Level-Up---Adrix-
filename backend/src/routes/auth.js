const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// POST /api/auth/login - Student login (development)
// In production, this will be replaced by Google OAuth
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const result = await query(
      'SELECT id, email, name, phone, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.rows[0];

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Check if phone is required
    const needsPhone = !user.phone;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      needsPhone,
      authToken: user.id.toString() // In production, this would be a JWT
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/complete-profile - Complete user profile with phone
router.post('/complete-profile', async (req, res) => {
  try {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
      return res.status(400).json({ error: 'User ID and phone are required' });
    }

    // Validate phone number (basic validation for Indian numbers)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        error: 'Invalid phone number. Please enter a valid Indian phone number.'
      });
    }

    // Update user phone
    const result = await query(
      'UPDATE users SET phone = $1 WHERE id = $2 RETURNING id, email, name, phone, role',
      [phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0],
      authToken: userId.toString()
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authToken = req.headers['x-auth-token'];
    
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = parseInt(authToken);
    
    const result = await query(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;