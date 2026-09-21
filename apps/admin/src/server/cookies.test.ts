import { describe, expect, it } from "vitest";
import { shouldUseSecureCookies } from "./cookies";

describe("shouldUseSecureCookies", () => {
  it("is insecure on plain http", () => {
    expect(
      shouldUseSecureCookies({ host: "127.0.0.1:3000", protocol: "http:" }),
    ).toBe(false);
  });

  it("is secure on https regardless of host", () => {
    expect(
      shouldUseSecureCookies({
        host: "admin.dev.bloggenius.kr",
        protocol: "https:",
      }),
    ).toBe(true);
  });

  it("is insecure on localhost without protocol info", () => {
    expect(shouldUseSecureCookies({ host: "localhost:3000" })).toBe(false);
    expect(shouldUseSecureCookies({ host: "127.0.0.1" })).toBe(false);
  });

  it("defaults to secure when unknown (fail-closed)", () => {
    expect(shouldUseSecureCookies({})).toBe(true);
    expect(
      shouldUseSecureCookies({ host: "admin.bloggenius.kr" }),
    ).toBe(true);
  });
});
