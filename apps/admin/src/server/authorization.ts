/**
 * 0층 계약(admin-foundation-contract)의 역할·capability 중앙 정의.
 * 역할 이름 비교가 아니라 capability 단위로 검사한다. deny-by-default.
 */

export const adminRoles = ["super_admin", "operator"] as const;

export type AdminRole = (typeof adminRoles)[number];

export const adminCapabilities = [
  "license:read",
  "license:pause",
  "license:revoke",
  "surface:read",
  "surface:publish",
  "catalog:read",
  "catalog:publish",
  "plan:read",
  "plan:update",
  "config:read",
  "config:update",
  "admin:invite",
  "admin:role",
  "audit:read",
  "export:request",
] as const;

export type AdminCapability = (typeof adminCapabilities)[number];

const superAdminCapabilities: ReadonlySet<AdminCapability> = new Set([
  ...adminCapabilities,
]);

const operatorCapabilities: ReadonlySet<AdminCapability> = new Set([
  "license:read",
  "license:pause",
  "surface:read",
  "surface:publish",
  "catalog:read",
  "catalog:publish",
  "plan:read",
  "config:read",
  "audit:read",
]);

const roleCapabilities: Record<AdminRole, ReadonlySet<AdminCapability>> = {
  super_admin: superAdminCapabilities,
  operator: operatorCapabilities,
};

export function parseAdminRole(value: unknown): AdminRole | null {
  return typeof value === "string" &&
    (adminRoles as readonly string[]).includes(value)
    ? (value as AdminRole)
    : null;
}

/** 알 수 없는 역할·누락은 무조건 권한 없음 (deny-by-default). */
export function hasCapability(
  role: unknown,
  capability: AdminCapability,
): boolean {
  const parsed = parseAdminRole(role);
  if (parsed === null) return false;
  return roleCapabilities[parsed].has(capability);
}

export function capabilitiesFor(role: unknown): AdminCapability[] {
  const parsed = parseAdminRole(role);
  if (parsed === null) return [];
  return [...roleCapabilities[parsed]];
}
