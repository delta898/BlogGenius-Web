/**
 * 로그인 시도용 최소 in-memory rate limit.
 * 단일 프로세스 기준이므로 multi-instance 배포에서는 관대한 상한으로 보고,
 * Supabase Auth 측 rate limit과 병행한다. 영속 store는 후속 작업.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export function isRateLimited(
  key: string,
  now: number = Date.now(),
): { limited: boolean; retryAfterMs: number } {
  const bucket = buckets.get(key);
  if (bucket === undefined || now >= bucket.resetAt) {
    return { limited: false, retryAfterMs: 0 };
  }
  if (bucket.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    return { limited: true, retryAfterMs: bucket.resetAt - now };
  }
  return { limited: false, retryAfterMs: 0 };
}

export function registerAttempt(key: string, now: number = Date.now()): void {
  const bucket = buckets.get(key);
  if (bucket === undefined || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function resetAttempts(key: string): void {
  buckets.delete(key);
}

/** 테스트 격리용. */
export function clearAllBuckets(): void {
  buckets.clear();
}
