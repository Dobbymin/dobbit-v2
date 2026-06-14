import { nextJsConfig } from "@repo/eslint-config/next-js";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...nextJsConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
]);
