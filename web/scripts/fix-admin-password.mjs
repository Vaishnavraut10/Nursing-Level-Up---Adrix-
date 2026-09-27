import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, '.env.local'), quiet: true });
dotenv.config({ path: path.join(root, '.env'), quiet: true });

if (!process.env.DATABASE_URL) {
  console.error('No DATABASE_URL found in environment.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const targetEmail = 'nursinglevelup538@gmail.com';
  const { rows } = await client.query(
    'SELECT id, email, role, status, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
    [targetEmail]
  );
  
  if (rows.length === 0) {
    console.log(`User ${targetEmail} not found in database.`);
    process.exit(1);
  }

  const user = rows[0];

  let plaintext = process.env.ADMIN_PASSWORD;
  if (!plaintext) {
    if (user.password_hash && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
      plaintext = user.password_hash;
    }
  }

  if (!plaintext) {
    console.error('No ADMIN_PASSWORD env var provided and no existing plaintext password found to hash.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(plaintext, 12);

  const updateResult = await client.query(
    `UPDATE users 
     SET password_hash = $1, role = 'ADMIN', status = 'ACTIVE', updated_at = now() 
     WHERE id = $2 
     RETURNING id, email, role, status, password_hash`,
    [hash, user.id]
  );

  const updatedUser = updateResult.rows[0];
  const startsWithBcrypt = updatedUser.password_hash.startsWith('$2a$') || updatedUser.password_hash.startsWith('$2b$');
  const compareMatch = await bcrypt.compare(plaintext, updatedUser.password_hash);

  console.log(`Fix Admin Account Verification:
  - User ID: ${updatedUser.id}
  - Role: ${updatedUser.role}
  - Status: ${updatedUser.status}
  - Password Hash Format Valid (starts with $2a$ or $2b$): ${startsWithBcrypt}
  - Hash IS NOT equal to plaintext: ${updatedUser.password_hash !== plaintext}
  - bcrypt.compare(password, hash) matches: ${compareMatch}
  `);

} finally {
  await client.end();
}
