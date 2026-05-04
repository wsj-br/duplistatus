import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
 
const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Ignore Docusaurus documentation directory (auto-generated files)
    'documentation/**',
    // Ignore generated server.js file (created during build)
    'server.js',
    // Generated Intlayer typings (unused eslint-disable on generated files)
    '.intlayer/**',
  ]),
  {
    // React Compiler rules from eslint-plugin-react-hooks: many patterns below are
    // intentional (data fetch on mount, modal reset, derived sync). Full compliance
    // would require large refactors; keep core hooks rules from eslint-config-next.
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
    },
  },
])
 
export default eslintConfig
