// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const angularPlugin = require('@angular-eslint/eslint-plugin');
const angularTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const prettierConfig = require('eslint-config-prettier');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // ── TypeScript source files ───────────────────────────────────────────────
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Angular
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'bc', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'bc', style: 'camelCase' },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
    },
  },

  // ── Angular HTML templates ────────────────────────────────────────────────
  {
    files: ['src/**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    languageOptions: {
      parser: angularTemplateParser,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/accessibility-alt-text': 'warn',
      '@angular-eslint/template/accessibility-label-for': 'warn',
      '@angular-eslint/template/accessibility-interactive-supports-focus': 'warn',
    },
  },

  // ── Prettier (must be last to disable conflicting formatting rules) ───────
  prettierConfig,

  // ── Ignore patterns ───────────────────────────────────────────────────────
  {
    ignores: ['dist/', 'node_modules/', '.angular/', 'coverage/'],
  },
];
