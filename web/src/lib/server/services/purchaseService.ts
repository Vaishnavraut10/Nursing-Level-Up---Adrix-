import 'server-only';
import { query, queryOne, transaction, type Queryable } from '../db';
import { ApiError, Errors } from '../../errors';
import type { Purchase, User } from '@/types';
import * as razorpay from '../razorpay';
import * as courseService from './courseService';

const PURCHASE_COLUMNS = `p.id, p.user_id, p.test_series_id, p.course_id, p.amount, p.currency, p.provider, p.order_id,
  p.payment_id, p.promo_code_used, p.status, p.created_at, p.updated_at`;

export interface CheckoutOrder {
  purchase: Purchase;
  razorpay: { keyId: string; orderId: string; amount: number; currency: string };
  prefill: { name: string; email: string; contact: string | null };
  course: { id: string; title: string };
}

/**
 * Creates (or reuses) a PENDING course purchase and its Razorpay order.
 * The amount is copied from the database price at this moment (or discounted price if promo valid).
 */
export async function createCourseCheckout(user: User, courseId: string, promoCode?: string): Promise<CheckoutOrder> {
  const course = await courseService.getById(courseId);
  if (!course) throw Errors.notFound('Course');
  if (course.status !== 'PUBLISHED') {
    throw new ApiError(400, 'COURSE_UNAVAILABLE', 'This course is no longer available for purchase.');
  }
  if (course.is_free || Number(course.price) === 0) {
    throw Errors.badRequest('This course is free. No payment required.');
  }

  // Check if already purchased
  const alreadyOwned = await courseService.hasCoursePurchase(user.id, courseId);
  if (alreadyOwned) throw Errors.conflict('You already own this course');

  // Determine final price (promo code discount)
  let finalPrice = course.price;
  let usedPromo: string | null = null;
  if (promoCode) {
    const discounted = await courseService.validatePromoCode(course, promoCode);
    if (discounted !== null) {
      finalPrice = discounted;
      usedPromo = promoCode.trim().toUpperCase();
    }
  }

  const existing = await query<Purchase>(
    `SELECT ${PURCHASE_COLUMNS} FROM purchases p
      WHERE p.user_id = $1 AND p.course_id = $2 AND p.status IN ('SUCCESS', 'PENDING')
      ORDER BY p.created_at DESC`,
    [user.id, courseId],
  );
  if (existing.some((p) => p.status === 'SUCCESS')) throw Errors.conflict('You already own this course');

  const keyId = razorpay.publicKeyId();
  const base = {
    prefill: { name: user.name, email: user.email, contact: user.phone },
    course: { id: course.id, title: course.title },
  };

  // Reuse a recent pending order at the same price instead of creating a new one on every click.
  const reusable = existing.find(
    (p) => p.status === 'PENDING' && p.amount === finalPrice && Date.now() - new Date(p.created_at).getTime() < 12 * 3600_000,
  );
  if (reusable) {
    return { ...base, purchase: reusable, razorpay: { keyId, orderId: reusable.order_id, amount: Math.round(reusable.amount * 100), currency: reusable.currency } };
  }

  const amountPaise = Math.round(finalPrice * 100);
  const receipt = `nlu_${Date.now().toString(36)}_${user.id.slice(0, 8)}`;
  const order = await razorpay.createOrder({
    amountPaise,
    currency: course.currency,
    receipt,
    notes: { user_id: user.id, course_id: course.id, promo_code: usedPromo ?? '' },
  });
  if (order.amount !== amountPaise) throw new ApiError(502, 'UPSTREAM_ERROR', 'Payment provider returned an unexpected amount');

  const purchase = await queryOne<Purchase>(
    `INSERT INTO purchases AS p (user_id, course_id, amount, currency, provider, order_id, promo_code_used, status)
     VALUES ($1,$2,$3,$4,'RAZORPAY',$5,$6,'PENDING') RETURNING ${PURCHASE_COLUMNS}`,
    [user.id, course.id, finalPrice, course.currency, order.id, usedPromo],
  );
  return { ...base, purchase: purchase!, razorpay: { keyId, orderId: order.id, amount: amountPaise, currency: course.currency } };
}

/**
 * Marks a purchase SUCCESS. Called only after a verified signature (checkout verify or webhook).
 * Idempotent: repeated calls for an already-successful order are no-ops.
 */
export async function markSuccess(orderId: string, paymentId: string, db?: Queryable) {
  return queryOne<Purchase>(
    `UPDATE purchases AS p SET status = 'SUCCESS', payment_id = $2, failure_reason = NULL
      WHERE p.order_id = $1 AND p.status IN ('PENDING', 'FAILED', 'CANCELLED')
      RETURNING ${PURCHASE_COLUMNS}`,
    [orderId, paymentId],
    db,
  );
}

/** POST /api/payments/razorpay/verify: HMAC-verified Checkout response → SUCCESS. */
export async function verifyCheckout(
  user: User,
  input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
) {
  const purchase = await queryOne<Purchase>(`SELECT ${PURCHASE_COLUMNS} FROM purchases p WHERE p.order_id = $1`, [
    input.razorpay_order_id,
  ]);
  if (!purchase || purchase.user_id !== user.id) throw Errors.notFound('Order');
  if (!razorpay.verifyPaymentSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
    throw new ApiError(400, 'PAYMENT_VERIFICATION_FAILED', 'Payment could not be verified');
  }
  if (purchase.status === 'SUCCESS') return purchase;
  if (purchase.status === 'REFUNDED') throw Errors.conflict('This payment was refunded');
  return (await markSuccess(input.razorpay_order_id, input.razorpay_payment_id)) ?? purchase;
}

/**
 * Client-reported dismissal/failure. Can only move PENDING → CANCELLED/FAILED for the owner's own order,
 * so it can never grant access; a later verified webhook still upgrades it to SUCCESS if money was taken.
 */
export async function markAbandoned(user: User, orderId: string, status: 'CANCELLED' | 'FAILED', reason?: string) {
  const row = await queryOne<Purchase>(
    `UPDATE purchases AS p SET status = $3, failure_reason = $4
      WHERE p.order_id = $1 AND p.user_id = $2 AND p.status = 'PENDING'
      RETURNING ${PURCHASE_COLUMNS}`,
    [orderId, user.id, status, reason?.slice(0, 500) ?? null],
  );
  if (!row) {
    const exists = await queryOne(`SELECT 1 FROM purchases WHERE order_id = $1 AND user_id = $2`, [orderId, user.id]);
    if (!exists) throw Errors.notFound('Order');
  }
  return row;
}

interface WebhookPayload {
  event: string;
  payload?: {
    payment?: { entity?: { id: string; order_id: string; amount: number; status: string; error_description?: string } };
    order?: { entity?: { id: string; amount_paid?: number } };
    refund?: { entity?: { id: string; payment_id: string; amount: number } };
  };
}

/** Server-to-server source of truth (signature already verified by the route). */
export async function handleWebhook(eventId: string, body: WebhookPayload) {
  return transaction(async (db) => {
    const payment = body.payload?.payment?.entity;
    const refund = body.payload?.refund?.entity;
    const orderId = payment?.order_id ?? body.payload?.order?.entity?.id ?? null;

    const inserted = await queryOne(
      `INSERT INTO payment_events (provider, event_id, event_type, order_id, payment_id, payload)
       VALUES ('RAZORPAY', $1, $2, $3, $4, $5) ON CONFLICT (event_id) DO NOTHING RETURNING id`,
      [eventId, body.event, orderId, payment?.id ?? refund?.payment_id ?? null, body],
      db,
    );
    if (!inserted) return { duplicate: true, handled: false };

    if ((body.event === 'payment.captured' || body.event === 'order.paid') && payment && orderId) {
      const purchase = await queryOne<Purchase>(`SELECT ${PURCHASE_COLUMNS} FROM purchases p WHERE p.order_id = $1 FOR UPDATE`, [orderId], db);
      if (!purchase) return { duplicate: false, handled: false };
      if (payment.amount !== Math.round(purchase.amount * 100)) {
        console.error('[razorpay] webhook amount mismatch', { orderId, expected: purchase.amount, got: payment.amount });
        return { duplicate: false, handled: false };
      }
      await markSuccess(orderId, payment.id, db);
      return { duplicate: false, handled: true };
    }
    if (body.event === 'payment.failed' && orderId) {
      await query(
        `UPDATE purchases SET status = 'FAILED', payment_id = COALESCE(payment_id, $2), failure_reason = $3
          WHERE order_id = $1 AND status = 'PENDING'`,
        [orderId, payment?.id ?? null, payment?.error_description?.slice(0, 500) ?? null],
        db,
      );
      return { duplicate: false, handled: true };
    }
    if (body.event === 'refund.processed' && refund) {
      await query(`UPDATE purchases SET status = 'REFUNDED' WHERE payment_id = $1 AND status = 'SUCCESS'`, [refund.payment_id], db);
      return { duplicate: false, handled: true };
    }
    return { duplicate: false, handled: false };
  });
}

export async function getForUser(user: User, purchaseId: string) {
  const row = await queryOne<Purchase>(
    `SELECT ${PURCHASE_COLUMNS}, c.title AS course_title FROM purchases p
      LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.id = $1`,
    [purchaseId],
  );
  if (!row) throw Errors.notFound('Purchase');
  if (row.user_id !== user.id && user.role !== 'ADMIN') throw Errors.forbidden('This purchase belongs to another user');
  return row;
}

export async function listForUser(userId: string) {
  return query<Purchase>(
    `SELECT ${PURCHASE_COLUMNS}, c.title AS course_title FROM purchases p
      LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
    [userId],
  );
}

export async function enrollFreeCourse(user: User, courseId: string): Promise<Purchase> {
  const course = await courseService.getById(courseId);
  if (!course) throw Errors.notFound('Course');
  if (course.status !== 'PUBLISHED') {
    throw new ApiError(400, 'COURSE_UNAVAILABLE', 'This course is no longer available.');
  }
  if (!course.is_free && Number(course.price) > 0) {
    throw Errors.badRequest('This course requires payment.');
  }

  const existing = await queryOne<Purchase>(
    `SELECT ${PURCHASE_COLUMNS} FROM purchases p WHERE p.user_id = $1 AND p.course_id = $2 AND p.status = 'SUCCESS'`,
    [user.id, courseId],
  );
  if (existing) {
    return existing;
  }

  const orderId = `free_${Date.now().toString(36)}_${user.id.slice(0, 8)}`;
  const purchase = await queryOne<Purchase>(
    `INSERT INTO purchases (user_id, course_id, amount, currency, provider, order_id, payment_id, promo_code_used, status)
     VALUES ($1, $2, 0, $3, 'FREE', $4, $4, NULL, 'SUCCESS')
     RETURNING ${PURCHASE_COLUMNS}`,
    [user.id, course.id, course.currency || 'INR', orderId],
  );
  return purchase!;
}
