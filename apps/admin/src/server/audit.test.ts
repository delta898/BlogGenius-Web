import { describe, expect, it, vi } from "vitest";
import {
  buildAuditEvent,
  maskEmail,
  recordAuditEvent,
  type AuditEvent,
} from "./audit";

describe("maskEmail", () => {
  it("masks local part and domain", () => {
    expect(maskEmail("admin@example.com")).toBe("a***@e***.c***");
  });

  it("returns null for nullish input and *** for malformed", () => {
    expect(maskEmail(null)).toBeNull();
    expect(maskEmail(undefined)).toBeNull();
    expect(maskEmail("not-an-email")).toBe("***");
  });
});

describe("buildAuditEvent", () => {
  it("includes environment, UTC timestamp and safe fields", () => {
    const event = buildAuditEvent({
      actor: "user-id",
      action: "auth.login",
      requestId: "req-1",
      result: "success",
    });
    expect(event.environment).toBe("local");
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(event.actorRole).toBeNull();
    expect(event.target).toBeNull();
  });
});

describe("recordAuditEvent", () => {
  it("writes through the sink and returns the event", () => {
    const written: AuditEvent[] = [];
    const event = recordAuditEvent(
      {
        actor: "user-id",
        actorRole: "operator",
        action: "license.pause",
        target: "license-id",
        requestId: "req-2",
        result: "failure",
        reasonCode: "FORBIDDEN",
        detail: { method: "totp" },
      },
      { write: (e) => written.push(e) },
    );
    expect(written).toHaveLength(1);
    expect(written[0]).toBe(event);
  });

  it("does not swallow sink failures", () => {
    expect(() =>
      recordAuditEvent(
        {
          actor: "user-id",
          action: "license.pause",
          requestId: "req-3",
          result: "success",
        },
        {
          write: () => {
            throw new Error("AUDIT_FAILED");
          },
        },
      ),
    ).toThrow("AUDIT_FAILED");
  });

  it("never carries raw secrets in the event payload", () => {
    const spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    try {
      recordAuditEvent({
        actor: "user-id",
        action: "auth.login",
        requestId: "req-4",
        result: "success",
        detail: { method: "totp" },
      });
      const logged = String(spy.mock.calls[0][0]);
      expect(logged).not.toContain("service_role");
      expect(logged).not.toContain("password");
    } finally {
      spy.mockRestore();
    }
  });
});
