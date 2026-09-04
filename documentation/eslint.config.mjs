import { defineConfig, globalIgnores } from 'eslint/config'
import tsParser from '@typescript-eslint/parser'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores for Docusaurus documentation
  globalIgnores([
    // Default ignores from eslint-config-next
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Docusaurus-specific generated files
    '.docusaurus/**',
    'build/**',
    'node_modules/**',
    // Translation cache (auto-generated)
    '.translation-cache/**',
    // Intlayer generated files
    '.intlayer/**',
  ]),
  {
    // See root eslint.config.mjs: Next's Babel parser is not ESLint 10-ready.
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      // Pin version so eslint-plugin-react 7.37.5 never calls context.getFilename()
      // (removed in ESLint 10) during "detect".
      react: { version: '19' },
    },
  },
])

export default eslintConfig
