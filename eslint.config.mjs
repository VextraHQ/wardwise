import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = defineConfig([
  // Next.js recommended configs (need FlatCompat since they're CommonJS)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Prettier config - disables ESLint rules that conflict with Prettier
  prettierConfig,

  // TypeScript files configuration
  {
    files: ["**/*.{ts,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // ===== React Rules =====
      // Next.js auto-imports React, no need for explicit import
      "react/react-in-jsx-scope": "off",
      // TypeScript handles prop type checking
      "react/prop-types": "off",
      // Allow quotes in JSX text (e.g., "don't" without escaping)
      "react/no-unescaped-entities": "off",

      // ===== TypeScript Rules =====
      // Warn on unused variables, but allow underscore-prefixed ones
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // Don't require explicit return types - TypeScript infers them well
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // Discourage `any` type to maintain type safety
      "@typescript-eslint/no-explicit-any": "warn",
      // Enforce consistent type-only imports for better tree-shaking
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },

  // JavaScript files configuration (for config files, scripts, etc.)
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "*.config.js",
    "*.config.ts",
    "*.config.mjs",
    "*.d.ts",
    "node_modules/**",
    "public/**",
    "prisma/**",
  ]),
]);

export default eslintConfig;
