import { describe, expect, it } from "vitest";
import {
  capabilitiesFor,
  hasCapability,
  parseAdminRole,
} from "./authorization";

describe("parseAdminRole", () => {
  it("accepts super_admin and operator", () => {
    expect(parseAdminRole("super_admin")).toBe("super_admin");
    expect(parseAdminRole("operator")).toBe("operator");
  });

  it("rejects viewer, empty and non-string (deny-by-default)", () => {
    expect(parseAdminRole("viewer")).toBeNull();
    expect(parseAdminRole("")).toBeNull();
    expect(parseAdminRole(undefined)).toBeNull();
    expect(parseAdminRole(null)).toBeNull();
    expect(parseAdminRole(42)).toBeNull();
  });
});

describe("hasCapability", () => {
  it("grants super_admin everything including plan:update", () => {
    expect(hasCapability("super_admin", "plan:update")).toBe(true);
    expect(hasCapability("super_admin", "admin:role")).toBe(true);
    expect(hasCapability("super_admin", "license:read")).toBe(true);
  });

  it("denies operator plan:update, admin:invite, admin:role, export", () => {
    expect(hasCapability("operator", "plan:update")).toBe(false);
    expect(hasCapability("operator", "admin:invite")).toBe(false);
    expect(hasCapability("operator", "admin:role")).toBe(false);
    expect(hasCapability("operator", "export:request")).toBe(false);
  });

  it("grants operator everyday operations", () => {
    expect(hasCapability("operator", "license:read")).toBe(true);
    expect(hasCapability("operator", "license:pause")).toBe(true);
    expect(hasCapability("operator", "surface:publish")).toBe(true);
    expect(hasCapability("operator", "audit:read")).toBe(true);
  });

  it("denies unknown roles and unknown capabilities", () => {
    expect(hasCapability("viewer", "license:read")).toBe(false);
    expect(hasCapability(undefined, "license:read")).toBe(false);
    expect(
      hasCapability("super_admin", "nonexistent:capability" as never),
    ).toBe(false);
  });
});

describe("capabilitiesFor", () => {
  it("returns empty list for unknown roles", () => {
    expect(capabilitiesFor("viewer")).toEqual([]);
    expect(capabilitiesFor(null)).toEqual([]);
  });
});
