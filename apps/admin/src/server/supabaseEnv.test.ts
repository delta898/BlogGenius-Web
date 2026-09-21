import { describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "./supabaseEnv";

const validEnv = {
  APP_ENVIRONMENT: "local",
  SUPABASE_URL: "https://xyzcompany.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
} as unknown as NodeJS.ProcessEnv;

describe("getSupabasePublicConfig", () => {
  it("accepts https config and strips trailing slash", () => {
    const config = getSupabasePublicConfig({
      ...validEnv,
      SUPABASE_URL: "https://xyzcompany.supabase.co/",
    });
    expect(config.url).toBe("https://xyzcompany.supabase.co");
    expect(config.anonKey).toBe("anon-key");
  });

  it("rejects missing values (fail-closed)", () => {
    expect(() =>
      getSupabasePublicConfig({ ...validEnv, SUPABASE_URL: "" }),
    ).toThrow("ENV_MISCONFIGURED");
    expect(() =>
      getSupabasePublicConfig({ ...validEnv, SUPABASE_ANON_KEY: "  " }),
    ).toThrow("ENV_MISCONFIGURED");
  });

  it("rejects non-https remote URLs and invalid URLs", () => {
    expect(() =>
      getSupabasePublicConfig({
        ...validEnv,
        SUPABASE_URL: "http://example.com",
      }),
    ).toThrow("ENV_MISCONFIGURED");
    expect(() =>
      getSupabasePublicConfig({
        ...validEnv,
        SUPABASE_URL: "not-a-url",
      }),
    ).toThrow("ENV_MISCONFIGURED");
  });

  it("rejects unknown APP_ENVIRONMENT", () => {
    expect(() =>
      getSupabasePublicConfig({ ...validEnv, APP_ENVIRONMENT: "dev" }),
    ).toThrow("APP_ENVIRONMENT must be one of");
  });
});
