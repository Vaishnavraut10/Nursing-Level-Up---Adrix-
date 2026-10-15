import { describe, expect, it } from 'vitest';
import { courseInputSchema, phoneSchema, profileUpdateSchema, promoCodeInputSchema, questionInputSchema, submitSchema, testSeriesInputSchema } from '@/lib/validation';

describe('phoneSchema', () => {
  it.each([
    ['98765 43210', '+919876543210'],
    ['+91-98765-43210', '+919876543210'],
    ['09876543210', '+919876543210'],
    ['919876543210', '+919876543210'],
    ['+14155550123', '+14155550123'],
  ])('normalises %s', (input, out) => expect(phoneSchema.parse(input)).toBe(out));

  it.each(['12345', '5876543210', 'abcdefghij', '', '+91 12345 67890'])('rejects %s', (input) =>
    expect(phoneSchema.safeParse(input).success).toBe(false));
});

describe('profileUpdateSchema', () => {
  it('rejects extra keys such as role', () => {
    expect(profileUpdateSchema.safeParse({ phone: '9876543210', role: 'ADMIN' }).success).toBe(false);
  });
});

describe('testSeriesInputSchema', () => {
  const base = { title: 'T', description: null, is_free: true, price: 0, duration_minutes: 10, instructions: null, status: 'DRAFT' };
  it('accepts a valid free test', () => expect(testSeriesInputSchema.safeParse(base).success).toBe(true));
  it('rejects a free test with a price', () => expect(testSeriesInputSchema.safeParse({ ...base, price: 5 }).success).toBe(false));
  it('accepts a course pass test with price 0', () => expect(testSeriesInputSchema.safeParse({ ...base, is_free: false, price: 0 }).success).toBe(true));
  it('rejects a negative price', () => expect(testSeriesInputSchema.safeParse({ ...base, is_free: false, price: -10 }).success).toBe(false));
  it('rejects zero duration and empty title', () => {
    expect(testSeriesInputSchema.safeParse({ ...base, duration_minutes: 0 }).success).toBe(false);
    expect(testSeriesInputSchema.safeParse({ ...base, title: '  ' }).success).toBe(false);
  });
  it('rejects an unknown status', () => expect(testSeriesInputSchema.safeParse({ ...base, status: 'LIVE' }).success).toBe(false));
});

describe('questionInputSchema', () => {
  const q = { question_text: 'Q', option_a: 'a', option_b: 'b', option_c: 'c', option_d: 'd', correct_answer: 'b' };
  it('upper-cases the answer', () => expect(questionInputSchema.parse(q).correct_answer).toBe('B'));
  it('rejects answers outside A–D', () => expect(questionInputSchema.safeParse({ ...q, correct_answer: 'E' }).success).toBe(false));
  it('requires every option', () => expect(questionInputSchema.safeParse({ ...q, option_d: '' }).success).toBe(false));
});

describe('submitSchema', () => {
  it('strips client-supplied score fields', () => {
    const parsed = submitSchema.parse({
      attemptId: '00000000-0000-4000-8000-000000000001',
      answers: [{ questionId: '00000000-0000-4000-8000-000000000002', selectedAnswer: 'A', isCorrect: true }],
      score: 100,
      percentage: 100,
    });
    expect(parsed).not.toHaveProperty('score');
    expect(parsed.answers[0]).not.toHaveProperty('isCorrect');
  });
});

describe('promoCodeInputSchema', () => {
  const valid = {
    course_id: '00000000-0000-4000-8000-000000000001',
    code: 'discount50',
    discount_type: 'FIXED',
    discount_value: 50,
    max_uses: 100,
    per_user_limit: 1,
    is_active: true,
  };

  it('normalises and uppercases promo code', () => {
    const res = promoCodeInputSchema.parse(valid);
    expect(res.code).toBe('DISCOUNT50');
    expect(res.discount_type).toBe('FIXED');
    expect(res.discount_value).toBe(50);
  });

  it('accepts valid percentage promo code up to 100%', () => {
    expect(promoCodeInputSchema.safeParse({ ...valid, discount_type: 'PERCENTAGE', discount_value: 20 }).success).toBe(true);
    expect(promoCodeInputSchema.safeParse({ ...valid, discount_type: 'PERCENTAGE', discount_value: 100 }).success).toBe(true);
  });

  it('rejects percentage discount greater than 100%', () => {
    expect(promoCodeInputSchema.safeParse({ ...valid, discount_type: 'PERCENTAGE', discount_value: 105 }).success).toBe(false);
  });

  it('rejects non-positive discount values', () => {
    expect(promoCodeInputSchema.safeParse({ ...valid, discount_value: 0 }).success).toBe(false);
    expect(promoCodeInputSchema.safeParse({ ...valid, discount_value: -10 }).success).toBe(false);
  });

  it('rejects codes with special characters', () => {
    expect(promoCodeInputSchema.safeParse({ ...valid, code: 'SAVE 50%' }).success).toBe(false);
  });
});

describe('courseInputSchema with multiple promo codes', () => {
  const baseCourse = {
    title: 'Complete Nursing Course',
    price: 299,
    status: 'PUBLISHED' as const,
  };

  it('accepts multiple valid promo codes with discount prices', () => {
    const res = courseInputSchema.safeParse({
      ...baseCourse,
      promo_codes: [
        { code: 'NLUP199', discount_price: 199, is_active: true },
        { code: 'NURSING20', discount_price: 249, is_active: true },
        { code: 'OCTOBER50', discount_price: 149, is_active: false },
      ],
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.promo_codes).toHaveLength(3);
      expect(res.data.promo_codes?.[0].code).toBe('NLUP199');
    }
  });

  it('rejects duplicate promo codes in the same course (case-insensitive)', () => {
    const res = courseInputSchema.safeParse({
      ...baseCourse,
      promo_codes: [
        { code: 'NLUP199', discount_price: 199, is_active: true },
        { code: 'nlup199', discount_price: 189, is_active: true },
      ],
    });
    expect(res.success).toBe(false);
  });

  it('rejects promo code where discount_price >= course base price', () => {
    const res = courseInputSchema.safeParse({
      ...baseCourse,
      price: 299,
      promo_codes: [
        { code: 'EXPENSIVE', discount_price: 300, is_active: true },
      ],
    });
    expect(res.success).toBe(false);
  });
});

