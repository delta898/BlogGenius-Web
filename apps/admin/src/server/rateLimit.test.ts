import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAllBuckets,
  isRateLimited,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
  registerAttempt,
  resetAttempts,
} from "./rateLimit";

beforeEach(() => {
  clearAllBuckets();
});

describe("login rate limit", () => {
  it("allows attempts below the threshold", () => {
    const now = 1_000_000;
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX_ATTEMPTS; i += 1) {
      expect(isRateLimited("ip-1", now).limited).toBe(false);
      registerAttempt("ip-1", now);
    }
    expect(isRateLimited("ip-1", now).limited).toBe(true);
  });

  it("resets after the window and on success", () => {
    const now = 1_000_000;
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX_ATTEMPTS; i += 1) {
      registerAttempt("ip-1", now);
    }
    expect(isRateLimited("ip-1", now).limited).toBe(true);
    expect(
      isRateLimited("ip-1", now + LOGIN_RATE_LIMIT_WINDOW_MS + 1).limited,
    ).toBe(false);

    registerAttempt("ip-2", now);
    resetAttempts("ip-2");
    expect(isRateLimited("ip-2", now).limited).toBe(false);
  });

  it("tracks keys independently", () => {
    const now = 1_000_000;
    registerAttempt("ip-1", now);
    expect(isRateLimited("ip-2", now).limited).toBe(false);
  });
});
