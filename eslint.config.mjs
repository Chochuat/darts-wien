import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginReact from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsdoc from "eslint-plugin-jsdoc";
import tsdoc from "eslint-plugin-tsdoc";

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
  // JSDoc recommended config for TypeScript projects
  jsdoc.configs["flat/recommended-typescript"],
  {
    plugins: {
      react: eslintPluginReact,
      "react-hooks": reactHooksPlugin,
      tsdoc,
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

      // ─── JSDoc / TSDoc ────────────────────────────
      // Overrides & additions on top of jsdoc/recommended-typescript
      "jsdoc/require-throws": "error",
      "jsdoc/check-indentation": "error",
      "jsdoc/no-blank-blocks": "error",
      "jsdoc/require-asterisk-prefix": "error",
      "jsdoc/require-description": "error",
      "jsdoc/sort-tags": "error",
      "jsdoc/check-syntax": "error",
      "jsdoc/tag-lines": ["error", "never", { startLines: 1 }],
      "jsdoc/require-param": ["error", { checkDestructuredRoots: false }],
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            FunctionExpression: true,
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            MethodDefinition: true,
          },
          contexts: [
            "VariableDeclaration",
            "TSTypeAliasDeclaration",
          ],
          enableFixer: true,
        },
      ],
      "jsdoc/require-hyphen-before-param-description": "off",
      "jsdoc/require-returns": "off",
      "tsdoc/syntax": "error",

      // Override inherited recommended-typescript rules to error
      "jsdoc/check-access": "error",
      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": ["error", { checkDestructured: false }],
      "jsdoc/check-property-names": "error",
      "jsdoc/check-tag-names": ["error", { typed: true }],
      "jsdoc/check-types": "error",
      "jsdoc/check-values": "error",
      "jsdoc/empty-tags": "error",
      "jsdoc/implements-on-classes": "error",
      "jsdoc/multiline-blocks": "error",
      "jsdoc/no-defaults": "error",
      "jsdoc/no-multi-asterisks": "error",
      "jsdoc/no-types": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-name": "error",
      "jsdoc/require-returns-check": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/valid-types": "error",
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
