import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
// import pluginJsxA11y from 'eslint-plugin-jsx-a11y'; // Optional: for accessibility rules

export default tseslint.config(
  // Apply recommended configs first
  tseslint.configs.recommended, // Apply recommended TypeScript rules
  // pluginReact.configs.recommended, // Apply recommended React rules (optional, can be verbose)

  // Custom config object
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
      // 'jsx-a11y': pluginJsxA11y, // Optional
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Override or add specific rules here
      // Base ESLint rules
      "no-unused-vars": "off", // Use typescript-eslint version
      "no-console": "warn",

      // TypeScript ESLint rules (specific overrides/additions)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      // "@typescript-eslint/recommended": "warn", // Removed - applied via tseslint.configs.recommended above

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/prop-types": "off", // Not needed with TypeScript
      "react/jsx-uses-react": "off", // Not needed with new JSX transform
      "react/jsx-uses-vars": "warn",
      // "react/recommended": "warn", // Removed - potentially applied via pluginReact.configs.recommended above

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh rules
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Optional: Accessibility rules
      // ...jsxA11y.configs.recommended.rules,
    },
  },
  {
    // Files to ignore
    ignores: [
      "dist/**",
      "eslint.config.js",
      "vite.config.ts",
      "hardhat.config.ts",
      "scripts/**",
      "contracts/**",
      "typechain-types/**",
      "node_modules/**",
    ],
  }
);
