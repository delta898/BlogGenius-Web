#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

const requiredKeys = [
  "RELEASE_SCHEMA_VERSION",
  "DEPLOY_ENVIRONMENT",
  "RELEASE_SHA",
  "SITE_IMAGE",
  "ADMIN_IMAGE",
];

const imagePatterns = {
  SITE_IMAGE:
    /^ghcr\.io\/delta898\/bloggenius-web-site@sha256:[a-f0-9]{64}$/,
  ADMIN_IMAGE:
    /^ghcr\.io\/delta898\/bloggenius-web-admin@sha256:[a-f0-9]{64}$/,
};

function fail(message) {
  throw new Error(message);
}

export function parseManifestText(text, expectedEnvironment) {
  const values = {};

  for (const [index, rawLine] of text.split(/\r?\n/u).entries()) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }

    const match = /^([A-Z][A-Z0-9_]*)=(.+)$/u.exec(line);
    if (!match) {
      fail(`Invalid manifest line ${index + 1}.`);
    }

    const [, key, value] = match;
    if (!requiredKeys.includes(key)) {
      fail(`Unknown manifest key: ${key}.`);
    }
    if (Object.hasOwn(values, key)) {
      fail(`Duplicate manifest key: ${key}.`);
    }
    values[key] = value;
  }

  for (const key of requiredKeys) {
    if (!Object.hasOwn(values, key)) {
      fail(`Missing manifest key: ${key}.`);
    }
  }

  if (values.RELEASE_SCHEMA_VERSION !== "1") {
    fail("RELEASE_SCHEMA_VERSION must be 1.");
  }
  if (!["development", "production"].includes(values.DEPLOY_ENVIRONMENT)) {
    fail("DEPLOY_ENVIRONMENT must be development or production.");
  }
  if (
    expectedEnvironment &&
    values.DEPLOY_ENVIRONMENT !== expectedEnvironment
  ) {
    fail(
      `Manifest environment ${values.DEPLOY_ENVIRONMENT} does not match ${expectedEnvironment}.`,
    );
  }
  if (!/^[a-f0-9]{40}$/u.test(values.RELEASE_SHA)) {
    fail("RELEASE_SHA must be a full lowercase 40-character Git SHA.");
  }

  for (const [key, pattern] of Object.entries(imagePatterns)) {
    if (!pattern.test(values[key])) {
      fail(`${key} must use the approved GHCR repository and an immutable digest.`);
    }
  }

  return Object.freeze(values);
}

export function createManifest({
  environment,
  sha,
  siteImage,
  adminImage,
}) {
  const text = [
    "RELEASE_SCHEMA_VERSION=1",
    `DEPLOY_ENVIRONMENT=${environment}`,
    `RELEASE_SHA=${sha}`,
    `SITE_IMAGE=${siteImage}`,
    `ADMIN_IMAGE=${adminImage}`,
    "",
  ].join("\n");

  parseManifestText(text, environment);
  return text;
}

async function main(argv) {
  const [command, ...args] = argv;

  if (command === "verify") {
    const [file, expectedEnvironment] = args;
    if (!file || !expectedEnvironment || args.length !== 2) {
      fail("Usage: release-manifest.mjs verify <file> <environment>");
    }
    const manifest = parseManifestText(
      await readFile(file, "utf8"),
      expectedEnvironment,
    );
    process.stdout.write(
      `Verified ${manifest.DEPLOY_ENVIRONMENT} release ${manifest.RELEASE_SHA}.\n`,
    );
    return;
  }

  if (command === "create") {
    const [environment, sha, siteImage, adminImage] = args;
    if (!adminImage || args.length !== 4) {
      fail(
        "Usage: release-manifest.mjs create <environment> <sha> <site-image> <admin-image>",
      );
    }
    process.stdout.write(
      createManifest({ environment, sha, siteImage, adminImage }),
    );
    return;
  }

  fail("Expected create or verify command.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`Manifest error: ${error.message}\n`);
    process.exitCode = 1;
  });
}
