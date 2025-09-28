import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Base Next.js + TypeScript config
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Your main rules
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'build/**',
      'dist/**',
      'eslint.config.mjs',
      '.eslintrc.js',
      'next.config.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-unused-expressions': 'warn',
    },
  },

  // Disable linting for all Prisma-generated files (JS, TS, d.ts)
  {
    files: [
      'src/generated/**', 
      'src/generated/prisma/**/*.js',
      'src/generated/prisma/**/*.ts',
      'src/types/**/*.d.ts'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'off',
      'prefer-const': 'off',
      'no-unused-expressions': 'off',
    },
  },
];
