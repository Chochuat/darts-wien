import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginReact from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      react: eslintPluginReact,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // ─── React: Core quality ────────────────────────
      "react/button-has-type": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-no-script-url": "error",
      "react/no-children-prop": "error",
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react/jsx-fragments": "error",
      "react/jsx-key": [
        "error",
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
      "react/jsx-max-depth": ["error", { max: 6 }],
      "react/function-component-definition": [
        "warn",
        { namedComponents: "arrow-function" },
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/no-array-index-key": "warn",
      "react/no-typos": "warn",
      "react/display-name": "warn",
      "react/jsx-sort-props": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // ─── React: destructuring ───────────────────────
      "react/destructuring-assignment": [
        "warn",
        "always",
        { destructureInSignature: "always" },
      ],

      // ─── React Hooks ───────────────────────────────
      "react-hooks/exhaustive-deps": "warn",

      // ─── TypeScript ────────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "@typescript-eslint/no-require-imports": "error",

      // ─── General ───────────────────────────────────
      "no-console": "warn",
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
