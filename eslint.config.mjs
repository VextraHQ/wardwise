import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Underscore-prefixed names are deliberately unused (e.g. `_req`).
const unusedVarsOptions = {
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
  destructuredArrayIgnorePattern: "^_",
};

const eslintConfig = defineConfig([
  // Next.js rules (React, hooks, accessibility, Core Web Vitals, TypeScript).
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // Allow quotes in JSX text (e.g. "don't" without escaping).
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": ["warn", unusedVarsOptions],
      // Discourage `any` to keep type safety.
      "@typescript-eslint/no-explicit-any": "warn",
      // `import { type X }` keeps type-only imports out of the bundle.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },

  // Architecture boundary: base layers must not import feature code.
  // `components/ui`, `components/shared`, `hooks/shared`, and `lib/core` are
  // feature-agnostic. Features depend on them, never the other way around.
  // See docs/wardwise-app-architecture-spec.md > Import Direction Rules.
  {
    files: [
      "src/components/ui/**",
      "src/components/shared/**",
      "src/hooks/shared/**",
      "src/lib/core/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/*/**"],
              message:
                "Base layers (components/ui, components/shared, hooks/shared, lib/core) must not import feature code. If a primitive needs feature data, it belongs in the owning feature — not the base layer.",
            },
          ],
        },
      ],
    },
  },

  // Turns off rules that would fight Prettier. Keep last.
  eslintConfigPrettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    ".pnpm-store/**",
    "next-env.d.ts",
    "*.d.ts",
    "public/**",
    "prisma/**",
  ]),
]);

export default eslintConfig;
