import { describe, expect, it } from "vitest";
import { buildAppUrl, getRequestHost } from "./requestHost";

describe("getRequestHost", () => {
  it("prefers the browser host over server-reported values", () => {
    // 관측된 dev 현상: request.url은 localhost, Host 헤더는 127.0.0.1.
    expect(
      getRequestHost({
        hostHeader: "127.0.0.1:3000",
        fallbackProtocol: "http:",
      }),
    ).toEqual({ protocol: "http:", host: "127.0.0.1:3000" });
  });

  it("prefers forwarded host/proto behind a proxy", () => {
    expect(
      getRequestHost({
        hostHeader: "internal:3000",
        forwardedHost: "admin.dev.bloggenius.kr",
        forwardedProto: "https:",
        fallbackProtocol: "http:",
      }),
    ).toEqual({ protocol: "https:", host: "admin.dev.bloggenius.kr" });
  });

  it("rejects non-allowlisted hosts (fail-closed)", () => {
    expect(
      getRequestHost({ hostHeader: "evil.example.com" }),
    ).toBeNull();
    expect(getRequestHost({})).toBeNull();
  });
});

describe("buildAppUrl", () => {
  it("builds absolute URLs on the same host", () => {
    expect(
      buildAppUrl({ protocol: "http:", host: "127.0.0.1:3000" }, "/login"),
    ).toBe("http://127.0.0.1:3000/login");
  });
});
