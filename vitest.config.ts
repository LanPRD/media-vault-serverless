import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["__tests__/**/*.spec.ts"],
    exclude: ["node_modules"],
    env: {
      NODE_ENV: "test"
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["**/*.ts"],
      exclude: [
        "**/__tests__/**",
        "**/*.spec.ts",
        "/dist/**",
        "*.config.*ts",
        "/scripts/**",
        "/node_modules/**",
        "**/dtos/**",
        "**/infra/http/**",
        "**/infra/database/**",
        "**/domain/repositories/**"
      ]
    }
  },
  plugins: [tsconfigPaths()]
});
