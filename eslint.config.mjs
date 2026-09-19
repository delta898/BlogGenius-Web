import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/coverage/**",
    "**/next-env.d.ts",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
]);
