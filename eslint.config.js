import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import functional from 'eslint-plugin-functional';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      functional
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      complexity: ['error', 5],
      'max-depth': ['error', 3],
      'max-lines-per-function': ['error', 70],
      'no-magic-numbers': ['error', { ignore: [0, 1, 2] }],
      'functional/no-let': 'error',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  },
  {
    files: ['*.config.{js,ts}'],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  }
];
