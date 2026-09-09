import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '*.cjs', 'scratch/**', 'legacy/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
    },
  },
  {
    files: ['src/math/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'SACRED MATH ISOLATION: src/math must never import React.' },
            { name: 'react-dom', message: 'SACRED MATH ISOLATION: src/math must never import React DOM.' },
            { name: 'zustand', message: 'SACRED MATH ISOLATION: src/math must never import Zustand.' },
            { name: 'zustand/shallow', message: 'SACRED MATH ISOLATION: src/math must never import Zustand.' },
            { name: 'zustand/react/shallow', message: 'SACRED MATH ISOLATION: src/math must never import Zustand.' },
            { name: '../types/core', message: 'SACRED MATH ISOLATION: src/math must define its own pure geometric types in src/math/types.ts.' },
            { name: '../../types/core', message: 'SACRED MATH ISOLATION: src/math must define its own pure geometric types in src/math/types.ts.' },
          ],
          patterns: [
            {
              group: [
                '**/components/**',
                '**/hooks/**',
                '**/state/**',
                '**/ui/**',
                '**/views/**',
                '**/calculators/**',
                '**/services/**',
              ],
              message: 'SACRED MATH ISOLATION: src/math must never import from UI, hooks, state, views, calculators, or services.',
            },
          ],
        },
      ],
    },
  },
])
