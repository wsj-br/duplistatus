# Phase 4.3 Testing Guide

## Quick Start

### 1. Pre-Testing Verification
Before manual testing, run the verification script to check component integration:

```bash
pnpm tsx dev/verify-i18n-integration.ts
```

This will verify:
- All content files exist
- Components are using `useIntlayer` hook
- Content files have correct structure
- All 5 languages are present in content files

### 2. Start Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:8666`

### 3. Test URLs by Locale

Test each locale by navigating to:
- **English**: `http://localhost:8666/en/dashboard`
- **German**: `http://localhost:8666/de/dashboard`
- **French**: `http://localhost:8666/fr/dashboard`
- **Spanish**: `http://localhost:8666/es/dashboard`
- **Portuguese**: `http://localhost:8666/pt-BR/dashboard`

### 4. Use the Testing Checklist
Open `dev/phase4-testing-checklist.md` and check off items as you test.

## Quick Testing Workflow

### For Each Component:
1. **Navigate to the component** in the app (e.g., Dashboard, Settings, Server Details)
2. **Switch locales** using the locale selector (if available) or by changing the URL
3. **Verify translations**:
   - Component-specific content translates
   - Common UI elements (buttons, status) translate
   - No English fallback text
4. **Check for issues**:
   - Console errors (F12 → Console)
   - UI breaks (text overflow, layout issues)
   - Missing translations
5. **Document issues** in the checklist

### For Each Language:
1. **Test all pages** in that language
2. **Check text expansion** (German/French are longer)
3. **Verify special characters** display correctly
4. **Check date/number formatting** (if applicable)

## Common Issues to Look For

### Missing Translations
- **Symptom**: Text appears in English when it should be translated
- **Check**: Browser console for errors, verify content file exists
- **Fix**: Add missing translation to content file

### Broken Imports
- **Symptom**: Component doesn't render, console shows import errors
- **Check**: Verify `useIntlayer('component-key')` uses correct key
- **Fix**: Ensure content file key matches component key

### Type Errors
- **Symptom**: TypeScript errors in IDE or build
- **Check**: Run `pnpm typecheck`
- **Fix**: Update type definitions in `src/app/[locale]/content/types.ts`

### UI Breaks
- **Symptom**: Text overflows containers, buttons break layout
- **Check**: Test with German (longest text) and French
- **Fix**: Adjust CSS, use responsive design, truncate long text

### Inconsistent Terminology
- **Symptom**: Same term translated differently in different components
- **Check**: Compare translations across components
- **Fix**: Standardize terminology, use common content where appropriate

## Testing Tools

### Browser DevTools
- **Console**: Check for errors and warnings
- **Elements**: Inspect translated text
- **Network**: Check if content files load correctly

### React DevTools
- Verify component state
- Check if `useIntlayer` hooks are working
- Inspect component props

### Manual Checks
- Test with different screen sizes (responsive)
- Test with different data states (empty, loading, error, success)
- Test locale switching
- Test direct URL access with locale parameter

## Testing Priority

### High Priority (Must Test)
1. Dashboard components (main page)
2. Settings forms (user interaction)
3. Server details (data display)
4. Common UI elements (used everywhere)

### Medium Priority
1. UI components (tooltips, modals)
2. Authentication pages
3. Error pages

### Low Priority
1. Edge cases
2. Performance testing
3. Accessibility testing

## Reporting Issues

When documenting issues in the checklist, include:
1. **Component name**: Which component has the issue
2. **Language**: Which language(s) are affected
3. **Description**: What's wrong
4. **Steps to reproduce**: How to see the issue
5. **Screenshot**: If applicable (UI breaks)
6. **Console errors**: Copy any error messages

## Completion Criteria

Phase 4.3 is complete when:
- ✅ All components tested in all 5 languages
- ✅ All critical issues fixed
- ✅ No console errors
- ✅ No missing translations
- ✅ UI doesn't break with longer text
- ✅ Ready to proceed to Phase 5 (AI Translation)

## Next Steps After Testing

Once testing is complete:
1. Fix all critical issues
2. Document non-critical issues for Phase 5
3. Update `dev/CHANGELOG.md` with testing results
4. Proceed to Phase 5: AI-Powered Translation
