import { describe, expect, it } from "vitest";

import { createManifest, parseManifestText } from "./release-manifest.mjs";

const sha = "1".repeat(40);
const siteImage =
  "ghcr.io/delta898/bloggenius-web-site@sha256:" + "a".repeat(64);
const adminImage =
  "ghcr.io/delta898/bloggenius-web-admin@sha256:" + "b".repeat(64);

function validManifest(environment = "development") {
  return createManifest({ environment, sha, siteImage, adminImage });
}

describe("release manifest", () => {
  it("accepts an immutable Development release", () => {
    expect(parseManifestText(validManifest(), "development")).toMatchObject({
      DEPLOY_ENVIRONMENT: "development",
      RELEASE_SHA: sha,
      SITE_IMAGE: siteImage,
      ADMIN_IMAGE: adminImage,
    });
  });

  it("rejects a mutable image tag", () => {
    expect(() =>
      parseManifestText(
        validManifest().replace(
          siteImage,
          "ghcr.io/delta898/bloggenius-web-site:latest",
        ),
        "development",
      ),
    ).toThrow(/immutable digest/u);
  });

  it("rejects an environment mismatch", () => {
    expect(() =>
      parseManifestText(validManifest("production"), "development"),
    ).toThrow(/does not match/u);
  });

  it("rejects a short commit SHA", () => {
    expect(() =>
      parseManifestText(validManifest().replace(sha, "abc123"), "development"),
    ).toThrow(/40-character/u);
  });

  it("rejects missing fields", () => {
    expect(() =>
      parseManifestText(
        validManifest().replace(/^ADMIN_IMAGE=.*\n/mu, ""),
        "development",
      ),
    ).toThrow(/Missing manifest key/u);
  });

  it("rejects duplicate fields", () => {
    expect(() =>
      parseManifestText(
        validManifest() + "DEPLOY_ENVIRONMENT=development\n",
        "development",
      ),
    ).toThrow(/Duplicate manifest key/u);
  });

  it("rejects unknown fields so secrets cannot drift into the manifest", () => {
    expect(() =>
      parseManifestText(
        validManifest() + "SUPABASE_SERVICE_ROLE_KEY=secret\n",
        "development",
      ),
    ).toThrow(/Unknown manifest key/u);
  });
});
