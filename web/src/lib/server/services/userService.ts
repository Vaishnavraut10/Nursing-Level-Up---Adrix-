import 'server-only';
import { query, queryOne } from '../db';
import type { User } from '@/types';
import bcrypt from 'bcryptjs';

import { uuidSchema, normalizePhone } from '../../validation';
import { Errors } from '../../errors';

const USER_COLUMNS = 'id, google_id, password_hash, name, email, phone, role, status, created_at, updated_at, last_login_at';

export async function findById(id: string) {
  if (!uuidSchema.safeParse(id).success) return null;
  return queryOne<User>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
}

export async function findByGoogleId(googleId: string) {
  return queryOne<User>(`SELECT ${USER_COLUMNS} FROM users WHERE google_id = $1`, [googleId]);
}

export async function findByEmail(email: string) {
  return queryOne<User>(`SELECT ${USER_COLUMNS} FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
}

export async function findByPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const normalized = normalizePhone(trimmed);
  const cleanDigits = trimmed.replace(/[\s\-().]/g, '');
  return queryOne<User>(
    `SELECT ${USER_COLUMNS} FROM users 
     WHERE phone = $1 OR phone = $2 OR phone = $3
     LIMIT 1`,
    [normalized, cleanDigits, trimmed],
  );
}

export async function findByEmailOrPhone(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  if (trimmed.includes('@')) {
    const byEmail = await findByEmail(trimmed);
    if (byEmail) return byEmail;
    return findByPhone(trimmed);
  }
  const byPhone = await findByPhone(trimmed);
  if (byPhone) return byPhone;
  return findByEmail(trimmed);
}

/**
 * Resolves a verified Google identity to a users row (PRD §26–27).
 * - Match on google_id first; otherwise link a pre-provisioned row with the same verified email.
 * - New users are ALWAYS created as STUDENT. No input to this function can set a role.
 * Returns null when the sign-in must be refused.
 */
export async function upsertFromGoogle(identity: { googleId: string; email: string; name: string }) {
  const byGoogle = await findByGoogleId(identity.googleId);
  if (byGoogle) {
    return queryOne<User>(`UPDATE users SET last_login_at = now() WHERE id = $1 RETURNING ${USER_COLUMNS}`, [
      byGoogle.id,
    ]);
  }
  const byEmail = await findByEmail(identity.email);
  if (byEmail) {
    // A different Google account already owns this email: refuse rather than silently re-link.
    if (byEmail.google_id && byEmail.google_id !== identity.googleId) return null;
    return queryOne<User>(
      `UPDATE users SET google_id = $2, last_login_at = now() WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [byEmail.id, identity.googleId],
    );
  }
  return queryOne<User>(
    `INSERT INTO users (google_id, name, email, role, last_login_at)
     VALUES ($1, $2, $3, 'STUDENT', now()) RETURNING ${USER_COLUMNS}`,
    [identity.googleId, identity.name.slice(0, 200) || identity.email.split('@')[0], identity.email],
  );
}

/** Development-only sign-in (see auth.ts). Finds by email or creates a STUDENT, never an admin. */
export async function upsertForDevLogin(email: string, name?: string) {
  const existing = await findByEmail(email);
  if (existing) {
    return queryOne<User>(`UPDATE users SET last_login_at = now() WHERE id = $1 RETURNING ${USER_COLUMNS}`, [
      existing.id,
    ]);
  }
  return queryOne<User>(
    `INSERT INTO users (name, email, role, last_login_at) VALUES ($1, $2, 'STUDENT', now()) RETURNING ${USER_COLUMNS}`,
    [name?.trim() || email.split('@')[0], email],
  );
}

// ---- Email / password & Phone authentication ----

const SALT_ROUNDS = 12;

/**
 * Create a new user account with email, phone, or both and password.
 * Throws conflict errors if the email or phone is already taken.
 */
export async function createWithPassword(data: {
  name: string;
  password: string;
  email?: string | null;
  phone?: string | null;
  identifier?: string | null;
}) {
  let email = data.email?.trim().toLowerCase() || null;
  let phone = data.phone?.trim() || null;

  if (data.identifier) {
    const rawId = data.identifier.trim();
    if (rawId.includes('@')) {
      if (!email) email = rawId.toLowerCase();
    } else {
      if (!phone) phone = rawId;
    }
  }

  if (phone) {
    phone = normalizePhone(phone);
  }

  if (!email && !phone) {
    throw Errors.badRequest('Either email or mobile number is required');
  }

  if (email) {
    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      throw Errors.conflict('An account with this email already exists. Please sign in instead.');
    }
  }

  if (phone) {
    const existingPhone = await findByPhone(phone);
    if (existingPhone) {
      throw Errors.conflict('An account with this mobile number already exists. Please sign in instead.');
    }
  }

  const hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const displayName = data.name.trim().slice(0, 200) || email?.split('@')[0] || phone || 'Student';

  return queryOne<User>(
    `INSERT INTO users (name, email, phone, password_hash, role, last_login_at)
     VALUES ($1, $2, $3, $4, 'STUDENT', now()) RETURNING ${USER_COLUMNS}`,
    [displayName, email, phone, hash],
  );
}

/** Verify email or phone + password credentials. Returns the user if valid, null otherwise. */
export async function verifyPassword(identifier: string, password: string) {
  const user = await findByEmailOrPhone(identifier);
  if (!user || !user.password_hash) return null; // no account or no password set (Google-only)
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  // Update last login timestamp
  return queryOne<User>(`UPDATE users SET last_login_at = now() WHERE id = $1 RETURNING ${USER_COLUMNS}`, [user.id]);
}

export async function updatePhone(userId: string, phone: string) {
  return queryOne<User>(`UPDATE users SET phone = $2 WHERE id = $1 RETURNING ${USER_COLUMNS}`, [userId, phone]);
}

export async function isPhoneTaken(phone: string, exceptUserId: string) {
  const rows = await query(`SELECT 1 FROM users WHERE phone = $1 AND id <> $2 LIMIT 1`, [phone, exceptUserId]);
  return rows.length > 0;
}

