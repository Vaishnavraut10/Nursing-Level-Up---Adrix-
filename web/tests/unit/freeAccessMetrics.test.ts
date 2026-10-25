import { describe, expect, it } from 'vitest';

/**
 * Unit tests verifying dashboard revenue, free access value, and total business value
 * semantics for admin-granted free access vs actual cash revenue.
 */

interface GrantRecord {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'REVOKED';
  revokedAt?: string | null;
  priceSnapshot?: number | null;
  currentCoursePrice: number;
}

interface PurchaseRecord {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
}

function calculateDashboardStats(opts: {
  grants: GrantRecord[];
  purchases: PurchaseRecord[];
}) {
  // 1. Actual Revenue = SUM(successful purchases amount) only
  const successfulPurchases = opts.purchases.filter((p) => p.status === 'SUCCESS');
  const actualRevenue = successfulPurchases.reduce((sum, p) => sum + p.amount, 0);

  // Set of (userId, courseId) for successful paid purchases
  const paidSet = new Set(successfulPurchases.map((p) => `${p.userId}:${p.courseId}`));

  // 2. Filter valid free grants:
  // - Must be ACTIVE and unrevoked (revokedAt is null/undefined)
  // - Deduplicated by (userId, courseId)
  // - Exclude if student already has paid access to the same course
  const validGrantsMap = new Map<string, GrantRecord>();
  for (const g of opts.grants) {
    if (g.status === 'ACTIVE' && !g.revokedAt) {
      const key = `${g.userId}:${g.courseId}`;
      if (!paidSet.has(key)) {
        if (!validGrantsMap.has(key)) {
          validGrantsMap.set(key, g);
        }
      }
    }
  }

  const validGrants = Array.from(validGrantsMap.values());
  const freeAccessGranted = validGrants.length;

  // 3. Free Access Value = sum of priceSnapshot ?? currentCoursePrice
  const freeAccessValue = validGrants.reduce(
    (sum, g) => sum + (g.priceSnapshot != null ? g.priceSnapshot : g.currentCoursePrice),
    0,
  );

  // 4. Total Business Value = Actual Revenue + Free Access Value
  const totalBusinessValue = actualRevenue + freeAccessValue;

  // 5. Total Course Access = distinct (userId, courseId) with paid or free access
  const allAccess = new Set<string>();
  for (const p of successfulPurchases) {
    allAccess.add(`${p.userId}:${p.courseId}`);
  }
  for (const g of validGrants) {
    allAccess.add(`${g.userId}:${g.courseId}`);
  }
  const totalCourseAccess = allAccess.size;

  return {
    actualRevenue,
    freeAccessGranted,
    freeAccessValue,
    totalBusinessValue,
    totalCourseAccess,
    paidPurchasesCount: successfulPurchases.length,
  };
}

describe('Dashboard Free Access and Revenue Statistics', () => {
  it('1. Grant free access to one student for a ₹299 course: Access Grant Value increases by ₹299', () => {
    const stats = calculateDashboardStats({
      grants: [
        {
          id: 'g-1',
          userId: 'student-1',
          courseId: 'course-1',
          status: 'ACTIVE',
          priceSnapshot: 299,
          currentCoursePrice: 299,
        },
      ],
      purchases: [],
    });

    expect(stats.freeAccessGranted).toBe(1);
    expect(stats.freeAccessValue).toBe(299);
    expect(stats.actualRevenue).toBe(0);
    expect(stats.totalBusinessValue).toBe(299);
    expect(stats.totalCourseAccess).toBe(1);
  });

  it('2. Grant access to 10 eligible students for a ₹299 course: value totals ₹2,990', () => {
    const grants: GrantRecord[] = Array.from({ length: 10 }, (_, i) => ({
      id: `g-${i + 1}`,
      userId: `student-${i + 1}`,
      courseId: 'course-1',
      status: 'ACTIVE',
      priceSnapshot: 299,
      currentCoursePrice: 299,
    }));

    const stats = calculateDashboardStats({ grants, purchases: [] });

    expect(stats.freeAccessGranted).toBe(10);
    expect(stats.freeAccessValue).toBe(2990);
    expect(stats.actualRevenue).toBe(0);
    expect(stats.totalBusinessValue).toBe(2990);
    expect(stats.totalCourseAccess).toBe(10);
  });

  it('3. Refresh the dashboard: the value remains correct and idempotent', () => {
    const grants: GrantRecord[] = [
      {
        id: 'g-1',
        userId: 'student-1',
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
    ];

    const stats1 = calculateDashboardStats({ grants, purchases: [] });
    const stats2 = calculateDashboardStats({ grants, purchases: [] });

    expect(stats1).toEqual(stats2);
    expect(stats2.freeAccessValue).toBe(299);
  });

  it('4. Repeated requests do not double-count grants (duplicate active grants deduplicated)', () => {
    const grants: GrantRecord[] = [
      {
        id: 'g-1',
        userId: 'student-1',
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
      {
        id: 'g-2',
        userId: 'student-1', // duplicate grant for same student & course
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
    ];

    const stats = calculateDashboardStats({ grants, purchases: [] });

    expect(stats.freeAccessGranted).toBe(1);
    expect(stats.freeAccessValue).toBe(299);
  });

  it('5. Revoked grants are excluded according to business rules', () => {
    const grants: GrantRecord[] = [
      {
        id: 'g-1',
        userId: 'student-1',
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
      {
        id: 'g-2',
        userId: 'student-2',
        courseId: 'course-1',
        status: 'REVOKED',
        revokedAt: '2026-10-24T12:00:00Z',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
    ];

    const stats = calculateDashboardStats({ grants, purchases: [] });

    expect(stats.freeAccessGranted).toBe(1);
    expect(stats.freeAccessValue).toBe(299);
  });

  it('6. Paid purchases remain counted in actual revenue, and paid students are not counted twice as free grants', () => {
    const purchases: PurchaseRecord[] = [
      {
        id: 'p-1',
        userId: 'student-1',
        courseId: 'course-1',
        amount: 299,
        status: 'SUCCESS',
      },
      {
        id: 'p-2',
        userId: 'student-2',
        courseId: 'course-1',
        amount: 199,
        status: 'SUCCESS',
      },
      {
        id: 'p-3',
        userId: 'student-3',
        courseId: 'course-1',
        amount: 299,
        status: 'FAILED', // Failed does not count
      },
    ];

    const grants: GrantRecord[] = [
      {
        id: 'g-1',
        userId: 'student-1', // student-1 already paid! Should not count as a free grant
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
      {
        id: 'g-2',
        userId: 'student-4', // student-4 has only free access
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299,
        currentCoursePrice: 299,
      },
    ];

    const stats = calculateDashboardStats({ grants, purchases });

    // Actual revenue = 299 + 199 = 498
    expect(stats.actualRevenue).toBe(498);
    // Free access count = 1 (student-4 only, since student-1 paid)
    expect(stats.freeAccessGranted).toBe(1);
    // Free access value = 299
    expect(stats.freeAccessValue).toBe(299);
    // Total Business Value = 498 + 299 = 797
    expect(stats.totalBusinessValue).toBe(797);
    // Total distinct course access = 3 (student-1, student-2, student-4)
    expect(stats.totalCourseAccess).toBe(3);
  });

  it('7. Existing admin-granted access records fall back to current course price if snapshot is missing', () => {
    const grants: GrantRecord[] = [
      {
        id: 'g-1',
        userId: 'student-1',
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: 299, // snapshot available
        currentCoursePrice: 499,
      },
      {
        id: 'g-2',
        userId: 'student-2',
        courseId: 'course-1',
        status: 'ACTIVE',
        priceSnapshot: null, // missing snapshot falls back to current price
        currentCoursePrice: 499,
      },
    ];

    const stats = calculateDashboardStats({ grants, purchases: [] });

    // 299 (snapshot) + 499 (fallback) = 798
    expect(stats.freeAccessValue).toBe(798);
    expect(stats.freeAccessGranted).toBe(2);
  });

  it('8. Free access value is strictly separated from cash revenue in financial metrics', () => {
    const stats = calculateDashboardStats({
      grants: [
        {
          id: 'g-1',
          userId: 'student-1',
          courseId: 'course-1',
          status: 'ACTIVE',
          priceSnapshot: 299,
          currentCoursePrice: 299,
        },
      ],
      purchases: [
        {
          id: 'p-1',
          userId: 'student-2',
          courseId: 'course-1',
          amount: 299,
          status: 'SUCCESS',
        },
      ],
    });

    // Actual revenue is strictly cash
    expect(stats.actualRevenue).toBe(299);
    // Free access value is strictly imputed
    expect(stats.freeAccessValue).toBe(299);
    // Combined total business value
    expect(stats.totalBusinessValue).toBe(598);
    expect(stats.freeAccessGranted).toBe(1);
    expect(stats.paidPurchasesCount).toBe(1);
    expect(stats.totalCourseAccess).toBe(2);
  });
});
