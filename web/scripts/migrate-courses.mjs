// Migrate: add courses table and refactor for course-based purchases
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const sql = readFileSync(join(import.meta.dirname, '..', 'db', 'add-courses.sql'), 'utf8');
  await pool.query(sql);
  console.log('✓ Migration successful: courses table and related columns added');
} catch (e) {
  console.error('✗ Migration failed:', e.message);
  process.exit(1);
} finally {
  await pool.end();
}
