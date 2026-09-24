// Migrate: add password_hash column
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');
  console.log('Migration successful: password_hash column added');
} catch (e) {
  console.error('Migration failed:', e.message);
} finally {
  await pool.end();
}
