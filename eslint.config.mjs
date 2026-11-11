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

// Files a feature deliberately exposes to other features. Anything else under
// src/features/<name>/ is private to that feature. To share a new file, add it
// here on purpose (see CLAUDE.md > Feature-First Architecture).
const featurePublicFiles = {
  admin: [
    "api/admin-api",
    "components/filters/campaign-filters",
    "components/filters/candidate-filters",
    "components/shared/constituency-boundary-alerts",
    "components/shared/lga-checkbox-grid",
    "components/shared/list-or-custom-field",
    "components/shared/official-constituency-selector",
    "hooks/use-admin",
    "server/admin-dashboard",
  ],
  auth: ["components/auth-card", "lib/config", "schemas/auth-schemas"],
  candidates: [
    "api/candidates-api",
    "types/candidate.types",
    "types/canvasser.types",
  ],
  collect: [
    "components/admin/campaign-actions-menu",
    "components/public/form-ui",
    "components/public/registration-step-header",
    "components/public/share-invite-card",
    "hooks/use-collect",
    "lib/branding",
    "lib/campaign-health",
    "lib/display-format",
    "lib/reporting",
    "types/collect.types",
  ],
  geo: [
    "data/nigerian-constituencies",
    "data/state-lga-locations",
    "hooks/use-geo",
    "lib/constituency",
    "lib/display",
  ],
};

// Flags a feature importing another feature's private file.
const noFeatureInternals = {
  meta: {
    type: "problem",
    messages: {
      private:
        "{{path}} is private to the {{target}} feature. Import one of its public files, or add this file to featurePublicFiles in eslint.config.mjs on purpose.",
    },
  },
  create(context) {
    const ownFeature = context.filename.match(/src\/features\/([^/]+)\//)?.[1];

    if (!ownFeature) return {};

    return {
      ImportDeclaration(node) {
        const match = node.source.value.match(/^@\/features\/([^/]+)\/(.+)$/);

        if (!match) return;

        const [path, target, file] = match;
        const isPublic = featurePublicFiles[target]?.includes(file);

        if (target !== ownFeature && !isPublic) {
          context.report({
            node,
            messageId: "private",
            data: { path, target },
          });
        }
      },
    };
  },
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

  // Features may only use each other's public files (featurePublicFiles).
  {
    files: ["src/features/**"],
    plugins: {
      project: { rules: { "no-feature-internals": noFeatureInternals } },
    },
    rules: { "project/no-feature-internals": "error" },
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
