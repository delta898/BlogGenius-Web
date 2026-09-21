import { describe, expect, it } from "vitest";
import { validateNewPassword } from "./passwordPolicy";

describe("validateNewPassword", () => {
  it("accepts matching passwords of 8 or more characters", () => {
    expect(validateNewPassword("s3cure-pw", "s3cure-pw")).toBeNull();
  });

  it("rejects mismatch, short and oversized passwords", () => {
    expect(validateNewPassword("s3cure-pw", "different")).toBe(
      "비밀번호가 일치하지 않습니다.",
    );
    expect(validateNewPassword("short", "short")).toBe(
      "비밀번호는 8자 이상이어야 합니다.",
    );
    expect(validateNewPassword("x".repeat(129), "x".repeat(129))).toBe(
      "비밀번호는 128자 이하여야 합니다.",
    );
  });
});
