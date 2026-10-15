// Migration runner for promo_codes
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const envFile = readFileSync(join(import.meta.dirname, '..', '.env.local'), 'utf8');
    for (const line of envFile.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    }
  } catch (err) {
    // Ignore error if .env.local doesn't exist
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const sql = readFileSync(join(import.meta.dirname, '..', 'db', 'add-promo-codes.sql'), 'utf8');
  await pool.query(sql);
  console.log('✓ Migration successful: promo_codes table created and seeded');
} catch (e) {
  console.error('✗ Migration failed:', e.message);
  process.exit(1);
} finally {
  await pool.end();
}
