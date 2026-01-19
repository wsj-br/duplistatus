# RTL (Right-to-Left) Support Documentation

## Overview

This application has been prepared for RTL (Right-to-Left) language support. While all current languages (English, German, French, Spanish, Portuguese) are LTR (Left-to-Right), the infrastructure is in place to support RTL languages like Arabic, Hebrew, Persian, and Urdu in the future.

## Architecture

### RTL Detection

The RTL detection system is located in `src/lib/rtl-utils.ts`:

- `isRTL(locale)` - Checks if a locale is RTL
- `getTextDirection(locale)` - Returns 'ltr' or 'rtl'
- `getLogicalProperties(direction)` - Maps physical to logical CSS properties

### RTL Hook

Use the `useRTL()` hook in components:

```typescript
import { useRTL } from '@/hooks/use-rtl';

function MyComponent() {
  const { direction, isRTL, logicalProps } = useRTL();
  
  // Use direction-aware styling
  return (
    <div className={isRTL ? 'text-right' : 'text-left'}>
      {/* Component content */}
    </div>
  );
}
```

### CSS Variables

RTL-aware CSS variables are defined in `src/app/globals.css`:

- `--direction`: 'ltr' or 'rtl'
- `--text-align-start`: 'left' (LTR) or 'right' (RTL)
- `--text-align-end`: 'right' (LTR) or 'left' (RTL)
- `--margin-start`, `--margin-end`: Logical margin values
- `--padding-start`, `--padding-end`: Logical padding values
- `--transform-rotate`: For icon rotation

### RTL Utility Classes

Use these classes instead of hardcoded left/right values:

- `.rtl-safe-ml` / `.rtl-safe-mr` - Margin start/end
- `.rtl-safe-pl` / `.rtl-safe-pr` - Padding start/end
- `.rtl-safe-text-left` / `.rtl-safe-text-right` - Text alignment
- `.rtl-safe-border-l` / `.rtl-safe-border-r` - Border start/end
- `.rtl-safe-rounded-l` / `.rtl-safe-rounded-r` - Border radius start/end

### Icon Mirroring

For directional icons (arrows, chevrons), use:

- `.rtl-mirror` - Horizontal mirror (scaleX(-1))
- `.rtl-flip-icon` - 180-degree rotation

Example:
```tsx
<ArrowLeft className="h-4 w-4 rtl-flip-icon" />
```

## Tailwind CSS v4 RTL Support

Tailwind CSS v4 has built-in support for logical properties. Use:

- `ms-*` / `me-*` instead of `ml-*` / `mr-*` (margin start/end)
- `ps-*` / `pe-*` instead of `pl-*` / `pr-*` (padding start/end)
- `text-start` / `text-end` instead of `text-left` / `text-right`
- `rounded-s-*` / `rounded-e-*` for border radius

## Automatic Direction Setting

The application automatically sets the `dir` attribute on the `<html>` element based on the current locale:

- Server-side: Set in `src/app/layout.tsx` via `getTextDirection()`
- Client-side: Updated in `src/contexts/locale-context.tsx` via `useEffect`

## Testing RTL

To test RTL support without adding a new language:

1. **Browser DevTools**: Add `dir="rtl"` to the `<html>` element
2. **CSS Override**: Add `[dir="rtl"]` selector in DevTools
3. **Component Testing**: Use the `useRTL()` hook to simulate RTL

Example test:
```tsx
// Temporarily force RTL for testing
const { direction } = useRTL();
const testDirection = 'rtl'; // Override for testing
```

## Supported RTL Languages

The following language codes are recognized as RTL:

- `ar` - Arabic
- `he` - Hebrew
- `fa` - Persian (Farsi)
- `ur` - Urdu
- `yi` - Yiddish
- And others (see `src/lib/rtl-utils.ts` for full list)

## Best Practices

1. **Use Logical Properties**: Prefer `ms-*`, `me-*`, `ps-*`, `pe-*` over `ml-*`, `mr-*`, `pl-*`, `pr-*`
2. **Use RTL-Safe Classes**: Use `.rtl-safe-*` classes when needed
3. **Test Icons**: Ensure directional icons flip correctly
4. **Test Tables**: Verify table alignment and column ordering
5. **Test Forms**: Check form field ordering and label placement
6. **Test Navigation**: Verify navigation menus and breadcrumbs

## Future Work

When adding an RTL language:

1. Add the locale to `SUPPORTED_LOCALES` in `locale-context.tsx`
2. Add translations in Intlayer content files
3. Test all components with RTL enabled
4. Verify icon mirroring works correctly
5. Check table and form layouts
6. Test navigation components

## Resources

- [MDN: Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Tailwind CSS: RTL Support](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [W3C: Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)
