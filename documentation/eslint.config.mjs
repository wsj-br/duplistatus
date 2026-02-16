import { defineConfig, globalIgnores } from 'eslint/config'
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
])

export default eslintConfig
