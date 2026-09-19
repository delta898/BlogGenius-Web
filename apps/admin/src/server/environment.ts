export const runtimeEnvironments = [
  "local",
  "development",
  "production",
] as const;

export type RuntimeEnvironment = (typeof runtimeEnvironments)[number];

export function parseRuntimeEnvironment(value: string | undefined): RuntimeEnvironment {
  if (
    value === undefined ||
    !runtimeEnvironments.includes(value as RuntimeEnvironment)
  ) {
    throw new Error(
      "APP_ENVIRONMENT must be one of: local, development, production.",
    );
  }

  return value as RuntimeEnvironment;
}

export function getRuntimeEnvironment(): RuntimeEnvironment {
  return parseRuntimeEnvironment(process.env.APP_ENVIRONMENT);
}
