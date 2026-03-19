import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import perfectionist from 'eslint-plugin-perfectionist';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'commitlint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      perfectionist,
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/unbound-method': 'warn',

      // Let Prettier handle line-length wrapping; just enforce consistency
      '@stylistic/object-curly-newline': ['error', {
        consistent: true,
        multiline: true,
      }],

      'perfectionist/sort-objects': ['error', {
        type: 'alphabetical',
        order: 'asc',
      }],

      'perfectionist/sort-named-imports': ['error', {
        type: 'alphabetical',
        order: 'asc',
      }],

      'perfectionist/sort-enums': ['error', {
        type: 'alphabetical',
        order: 'asc',
      }],

      'perfectionist/sort-interfaces': ['error', {
        type: 'alphabetical',
        order: 'asc',
      }],
      'perfectionist/sort-object-types': ['error', {
        type: 'alphabetical',
        order: 'asc',
      }],
    },
  },
);