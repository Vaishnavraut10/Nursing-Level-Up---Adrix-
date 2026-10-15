import 'server-only';
import { query, queryOne, transaction } from '../db';
import { Errors } from '../../errors';
import type { PromoCode, PromoDiscountType, User } from '@/types';
import type { PromoCodeInput } from '../../validation';
import { logAudit } from './auditService';

export type PromoValidationResult =
  | {
      valid: true;
      promoCodeId?: string;
      code: string;
      discountType: PromoDiscountType;
      discountValue: number;
      discountAmount: number;
      originalPrice: number;
      discountedPrice: number;
    }
  | {
      valid: false;
      message: string;
    };

/** Validate promo code for a given course and user. */
export async function validatePromoCodeDetails(
  courseId: string,
  rawCode: string,
  userId?: string,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Please enter a promo code.' };
  }

  const course = await queryOne<{ id: string; price: number; promo_code: string | null; discount_price: number | null; is_free: boolean; status: string }>(
    `SELECT id, price, promo_code, discount_price, is_free, status FROM courses WHERE id = $1`,
    [courseId],
  );
  if (!course) {
    return { valid: false, message: 'Course not found.' };
  }
  if (course.is_free || Number(course.price) <= 0) {
    return { valid: false, message: 'This course is free. No promo code needed.' };
  }

  const originalPrice = Number(course.price);

  // 1. Check promo_codes table first
  const promo = await queryOne<PromoCode>(
    `SELECT id, course_id, code, discount_type, discount_value, discount_price, max_uses, per_user_limit,
            expires_at, is_active, usage_count, created_at, updated_at
       FROM promo_codes
      WHERE course_id = $1 AND code = $2`,
    [courseId, code],
  );

  if (promo) {
    if (!promo.is_active) {
      return { valid: false, message: 'This promo code is no longer active.' };
    }

    if (promo.expires_at && new Date() > new Date(promo.expires_at)) {
      return { valid: false, message: 'This promo code has expired.' };
    }

    if (promo.max_uses !== null && promo.usage_count >= promo.max_uses) {
      return { valid: false, message: 'This promo code has reached its maximum usage limit.' };
    }

    if (userId && promo.per_user_limit > 0) {
      const userUsage = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM purchases
          WHERE user_id = $1 AND course_id = $2 AND promo_code_used = $3 AND status = 'SUCCESS'`,
        [userId, courseId, code],
      );
      if (userUsage && userUsage.count >= promo.per_user_limit) {
        return { valid: false, message: 'You have already redeemed this promo code.' };
      }
    }

    let discountAmount = 0;
    let discountedPrice = 0;
    const discountVal = Number(promo.discount_value);

    if (promo.discount_price !== null && promo.discount_price !== undefined) {
      discountedPrice = Math.max(0, Number(promo.discount_price));
      discountAmount = Math.max(0, originalPrice - discountedPrice);
    } else if (promo.discount_type === 'PERCENTAGE') {
      discountAmount = Math.round((originalPrice * discountVal) / 100);
      discountedPrice = Math.max(0, originalPrice - discountAmount);
    } else {
      discountAmount = Math.min(originalPrice, discountVal);
      discountedPrice = Math.max(0, originalPrice - discountAmount);
    }

    return {
      valid: true,
      promoCodeId: promo.id,
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: discountVal,
      discountAmount,
      originalPrice,
      discountedPrice,
    };
  }

  // 2. Backward compatibility with courses.promo_code
  if (course.promo_code && course.discount_price !== null && course.promo_code.trim().toUpperCase() === code) {
    const discountedPrice = Number(course.discount_price);
    const discountAmount = Math.max(0, originalPrice - discountedPrice);
    return {
      valid: true,
      code,
      discountType: 'FIXED',
      discountValue: discountAmount,
      discountAmount,
      originalPrice,
      discountedPrice,
    };
  }

  return { valid: false, message: 'Invalid promo code. Please check and try again.' };
}

/** Record successful promo code usage */
export async function recordPromoCodeUsage(courseId: string, code: string, db?: any) {
  const normCode = code.trim().toUpperCase();
  await query(
    `UPDATE promo_codes SET usage_count = usage_count + 1, updated_at = NOW()
      WHERE course_id = $1 AND code = $2`,
    [courseId, normCode],
    db,
  );
}

// ---- Admin operations ----

export async function adminListPromoCodes(courseId?: string): Promise<PromoCode[]> {
  const params: unknown[] = [];
  let whereSql = '';
  if (courseId) {
    params.push(courseId);
    whereSql = `WHERE p.course_id = $1`;
  }
  return query<PromoCode>(
    `SELECT p.id, p.course_id, p.code, p.discount_type, p.discount_value, p.discount_price, p.max_uses, p.per_user_limit,
            p.expires_at, p.is_active, p.usage_count, p.created_at, p.updated_at,
            c.title AS course_title
       FROM promo_codes p
       JOIN courses c ON c.id = p.course_id
       ${whereSql}
      ORDER BY p.created_at DESC`,
    params,
  );
}

export async function adminGetPromoCode(id: string): Promise<PromoCode> {
  const row = await queryOne<PromoCode>(
    `SELECT p.id, p.course_id, p.code, p.discount_type, p.discount_value, p.discount_price, p.max_uses, p.per_user_limit,
            p.expires_at, p.is_active, p.usage_count, p.created_at, p.updated_at,
            c.title AS course_title
       FROM promo_codes p
       JOIN courses c ON c.id = p.course_id
      WHERE p.id = $1`,
    [id],
  );
  if (!row) throw Errors.notFound('Promo Code');
  return row;
}

export async function adminCreatePromoCode(input: PromoCodeInput, admin: User): Promise<PromoCode> {
  const course = await queryOne<{ id: string; title: string; price: number; is_free: boolean }>(
    `SELECT id, title, price, is_free FROM courses WHERE id = $1`,
    [input.course_id],
  );
  if (!course) throw Errors.notFound('Course');
  if (course.is_free) throw Errors.badRequest('Cannot add promo codes to a free course');

  const code = input.code.trim().toUpperCase();

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM promo_codes WHERE course_id = $1 AND code = $2`,
    [input.course_id, code],
  );
  if (existing) throw Errors.conflict(`Promo code '${code}' already exists for this course`);

  return transaction(async (db) => {
    const row = await queryOne<PromoCode>(
      `INSERT INTO promo_codes (
         course_id, code, discount_type, discount_value, max_uses, per_user_limit, expires_at, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.course_id,
        code,
        input.discount_type,
        input.discount_value,
        input.max_uses ?? null,
        input.per_user_limit ?? 1,
        input.expires_at ? new Date(input.expires_at) : null,
        input.is_active ?? true,
      ],
      db,
    );
    await logAudit(admin.id, 'PROMO_CODE_CREATED', 'promo_code', row!.id, { code, course_id: input.course_id }, db);
    return row!;
  });
}

export async function adminUpdatePromoCode(
  id: string,
  input: Partial<PromoCodeInput>,
  admin: User,
): Promise<PromoCode> {
  return transaction(async (db) => {
    const existing = await queryOne<PromoCode>(
      `SELECT * FROM promo_codes WHERE id = $1 FOR UPDATE`,
      [id],
      db,
    );
    if (!existing) throw Errors.notFound('Promo Code');

    const code = input.code ? input.code.trim().toUpperCase() : existing.code;
    const courseId = input.course_id || existing.course_id;

    if (code !== existing.code || courseId !== existing.course_id) {
      const duplicate = await queryOne<{ id: string }>(
        `SELECT id FROM promo_codes WHERE course_id = $1 AND code = $2 AND id != $3`,
        [courseId, code, id],
        db,
      );
      if (duplicate) throw Errors.conflict(`Promo code '${code}' already exists for this course`);
    }

    const discountType = input.discount_type ?? existing.discount_type;
    const discountValue = input.discount_value ?? existing.discount_value;
    const maxUses = input.max_uses !== undefined ? input.max_uses : existing.max_uses;
    const perUserLimit = input.per_user_limit !== undefined ? input.per_user_limit : existing.per_user_limit;
    const expiresAt = input.expires_at !== undefined ? (input.expires_at ? new Date(input.expires_at) : null) : existing.expires_at;
    const isActive = input.is_active !== undefined ? input.is_active : existing.is_active;

    const row = await queryOne<PromoCode>(
      `UPDATE promo_codes SET
         course_id = $2,
         code = $3,
         discount_type = $4,
         discount_value = $5,
         max_uses = $6,
         per_user_limit = $7,
         expires_at = $8,
         is_active = $9,
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, courseId, code, discountType, discountValue, maxUses, perUserLimit, expiresAt, isActive],
      db,
    );

    await logAudit(admin.id, 'PROMO_CODE_UPDATED', 'promo_code', id, { code }, db);
    return row!;
  });
}

export async function adminTogglePromoCode(id: string, admin: User): Promise<PromoCode> {
  return transaction(async (db) => {
    const existing = await queryOne<PromoCode>(
      `SELECT * FROM promo_codes WHERE id = $1 FOR UPDATE`,
      [id],
      db,
    );
    if (!existing) throw Errors.notFound('Promo Code');

    const row = await queryOne<PromoCode>(
      `UPDATE promo_codes SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
      db,
    );
    await logAudit(admin.id, 'PROMO_CODE_TOGGLED', 'promo_code', id, { is_active: row!.is_active }, db);
    return row!;
  });
}

export async function adminDeletePromoCode(id: string, admin: User): Promise<void> {
  return transaction(async (db) => {
    const existing = await queryOne<PromoCode>(`SELECT id, code, course_id FROM promo_codes WHERE id = $1 FOR UPDATE`, [id], db);
    if (!existing) throw Errors.notFound('Promo Code');
    await query(`DELETE FROM promo_codes WHERE id = $1`, [id], db);
    await logAudit(admin.id, 'PROMO_CODE_DELETED', 'promo_code', id, { code: existing.code }, db);
  });
}
