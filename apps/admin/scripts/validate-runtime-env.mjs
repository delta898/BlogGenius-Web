const allowedEnvironments = new Set([
  "local",
  "development",
  "production",
]);

const environment = process.env.APP_ENVIRONMENT;

if (!allowedEnvironments.has(environment)) {
  process.stderr.write(
    "APP_ENVIRONMENT must be one of: local, development, production.\n",
  );
  process.exit(1);
}
