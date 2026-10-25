import 'server-only';
import { query, queryOne, transaction, type Queryable } from '../db';
import { ApiError, Errors } from '../../errors';
import type { Purchase, User } from '@/types';
import * as razorpay from '../razorpay';
import * as courseService from './courseService';
import { recordPromoCodeUsage } from './promoCodeService';

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
    const discounted = await courseService.validatePromoCode(course, promoCode, user.id);
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

  // Zero-payable / 100% discount promo code: grant verified entitlement directly without Razorpay
  if (finalPrice <= 0) {
    const orderId = `promo_${Date.now().toString(36)}_${user.id.slice(0, 8)}`;
    const purchase = await queryOne<Purchase>(
      `INSERT INTO purchases AS p (user_id, course_id, amount, currency, provider, order_id, payment_id, promo_code_used, status)
       VALUES ($1, $2, 0, $3, 'PROMO', $4, $4, $5, 'SUCCESS')
       RETURNING ${PURCHASE_COLUMNS}`,
      [user.id, course.id, course.currency, orderId, usedPromo],
    );
    if (usedPromo) {
      await recordPromoCodeUsage(course.id, usedPromo);
    }
    return {
      ...base,
      purchase: purchase!,
      razorpay: { keyId: '', orderId, amount: 0, currency: course.currency },
    };
  }

  // Reuse a recent pending order at the same price instead of creating a new one on every click.
  const reusable = existing.find(
    (p) => p.status === 'PENDING' && Number(p.amount) === Number(finalPrice) && Date.now() - new Date(p.created_at).getTime() < 12 * 3600_000,
  );
  if (reusable) {
    return { ...base, purchase: reusable, razorpay: { keyId, orderId: reusable.order_id, amount: Math.round(Number(reusable.amount) * 100), currency: reusable.currency } };
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
 * Marks a purchase SUCCESS. Called only after a verified signature (checkout verify, webhook, or gateway sync).
 * Idempotent: repeated calls for an already-successful order return the active record.
 */
export async function markSuccess(orderId: string, paymentId: string, db?: Queryable) {
  let row = await queryOne<Purchase>(
    `UPDATE purchases AS p
        SET status = 'SUCCESS', payment_id = $2, failure_reason = NULL, updated_at = now()
      WHERE p.order_id = $1 AND p.status IN ('PENDING', 'FAILED', 'CANCELLED')
      RETURNING ${PURCHASE_COLUMNS}`,
    [orderId, paymentId],
    db,
  );
  if (row) {
    if (row.promo_code_used && row.course_id) {
      await recordPromoCodeUsage(row.course_id, row.promo_code_used, db);
    }
    return row;
  }
  return queryOne<Purchase>(
    `SELECT ${PURCHASE_COLUMNS} FROM purchases WHERE order_id = $1 AND status = 'SUCCESS'`,
    [orderId],
    db,
  );
}

/**
 * Synchronizes an order directly with Razorpay API.
 * Confirms payment capture and matching amount against trusted gateway records.
 * Idempotent, safe, and logs verified audit events.
 */
export async function syncOrderWithGateway(orderId: string, userId?: string, db?: Queryable): Promise<Purchase | null> {
  const purchase = await queryOne<Purchase>(
    `SELECT ${PURCHASE_COLUMNS} FROM purchases WHERE order_id = $1`,
    [orderId],
    db,
  );
  if (!purchase) return null;
  if (userId && purchase.user_id !== userId) return null;
  if (purchase.status === 'SUCCESS') return purchase;

  const payments = await razorpay.fetchOrderPayments(orderId);
  const captured = payments.find((p) => p.status === 'captured');
  if (captured) {
    const expectedPaise = Math.round(Number(purchase.amount) * 100);
    if (captured.amount === expectedPaise) {
      const updated = await markSuccess(orderId, captured.id, db);
      await query(
        `INSERT INTO payment_events (provider, event_id, event_type, order_id, payment_id, payload)
         VALUES ('RAZORPAY', $1, 'sync.payment_captured', $2, $3, $4)
         ON CONFLICT (event_id) DO NOTHING`,
        [`sync_${captured.id}`, orderId, captured.id, { captured, synced_at: new Date().toISOString() }],
        db,
      );
      return updated;
    } else {
      console.error('[razorpay] sync amount mismatch', { orderId, expected: expectedPaise, got: captured.amount });
    }
  }
  return purchase;
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
 * Client-reported dismissal/failure.
 * Safety check: If payment was actually captured on Razorpay, never cancel — mark SUCCESS instead!
 */
export async function markAbandoned(user: User, orderId: string, status: 'CANCELLED' | 'FAILED', reason?: string) {
  const purchase = await queryOne<Purchase>(
    `SELECT ${PURCHASE_COLUMNS} FROM purchases WHERE order_id = $1 AND user_id = $2`,
    [orderId, user.id],
  );
  if (!purchase) throw Errors.notFound('Order');
  if (purchase.status === 'SUCCESS') return purchase;

  // Check if Razorpay already captured this payment before marking abandoned
  const payments = await razorpay.fetchOrderPayments(orderId);
  const captured = payments.find((p) => p.status === 'captured');
  if (captured && captured.amount === Math.round(Number(purchase.amount) * 100)) {
    return (await markSuccess(orderId, captured.id)) ?? purchase;
  }

  const row = await queryOne<Purchase>(
    `UPDATE purchases AS p SET status = $3, failure_reason = $4, updated_at = now()
      WHERE p.order_id = $1 AND p.user_id = $2 AND p.status = 'PENDING'
      RETURNING ${PURCHASE_COLUMNS}`,
    [orderId, user.id, status, reason?.slice(0, 500) ?? null],
  );
  return row ?? purchase;
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

    if ((body.event === 'payment.captured' || body.event === 'order.paid') && orderId) {
      const purchase = await queryOne<Purchase>(`SELECT ${PURCHASE_COLUMNS} FROM purchases p WHERE p.order_id = $1 FOR UPDATE`, [orderId], db);
      if (!purchase) return { duplicate: false, handled: false };

      const paymentAmount = payment?.amount ?? body.payload?.order?.entity?.amount_paid;
      const expectedPaise = Math.round(Number(purchase.amount) * 100);
      if (paymentAmount !== undefined && paymentAmount !== null && paymentAmount !== expectedPaise) {
        console.error('[razorpay] webhook amount mismatch', { orderId, expected: expectedPaise, got: paymentAmount });
        return { duplicate: false, handled: false };
      }
      const paymentId = payment?.id ?? purchase.payment_id ?? `pay_${orderId.replace(/^order_/, '')}`;
      await markSuccess(orderId, paymentId, db);
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
    `SELECT p.id, p.user_id, p.test_series_id, p.course_id, p.amount, p.currency, p.provider, p.order_id,
            p.payment_id, p.promo_code_used, p.status, p.created_at, p.updated_at, c.title AS course_title
       FROM purchases p
       LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.user_id = $1
      UNION ALL
     SELECT cfa.id, cfa.user_id, NULL::uuid AS test_series_id, cfa.course_id, 0::numeric AS amount,
            c.currency, 'FREE'::payment_provider AS provider, ('grant_' || replace(cfa.id::text, '-', '')) AS order_id,
            ('grant_' || replace(cfa.id::text, '-', '')) AS payment_id, NULL AS promo_code_used,
            'SUCCESS'::purchase_status AS status, cfa.granted_at AS created_at, cfa.updated_at,
            c.title AS course_title
       FROM course_free_access cfa
       JOIN courses c ON c.id = cfa.course_id
      WHERE cfa.user_id = $1 AND cfa.status = 'ACTIVE' AND cfa.revoked_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM purchases p2
           WHERE p2.user_id = cfa.user_id AND p2.course_id = cfa.course_id AND p2.status = 'SUCCESS'
        )
      ORDER BY created_at DESC`,
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
