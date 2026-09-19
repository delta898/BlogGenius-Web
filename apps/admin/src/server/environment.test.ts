import { describe, expect, it } from "vitest";
import { parseRuntimeEnvironment } from "./environment";

describe("parseRuntimeEnvironment", () => {
  it.each(["local", "development", "production"] as const)(
    "accepts %s",
    (environment) => {
      expect(parseRuntimeEnvironment(environment)).toBe(environment);
    },
  );

  it.each([undefined, "", "dev", "prod"])(
    "rejects invalid value %s",
    (environment) => {
      expect(() => parseRuntimeEnvironment(environment)).toThrow(
        "APP_ENVIRONMENT must be one of",
      );
    },
  );
});
