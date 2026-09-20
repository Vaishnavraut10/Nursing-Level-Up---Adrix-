const { query } = require('../config/database');

// Admin authorization middleware
function requireAdmin(req, res, next) {
  // For development, we'll check a simple header or session
  // In production, this would use JWT or session validation
  const isAdmin = req.headers['x-admin-auth'] === 'dev-admin-token' || 
                  req.session?.user?.role === 'ADMIN';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
  }
  
  next();
}

module.exports = { requireAdmin };