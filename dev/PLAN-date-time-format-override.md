# Implementation Plan: Date/Time Format and Number Format Overrides

**Related Issue:** [#59](https://github.com/wsj-br/duplistatus/issues/59)

## Overview

Add configuration options in Settings > Display Settings to allow users to override the locale-based date/time and number formatting independently of their selected language.

## Current Architecture

### Settings Storage
- User preferences stored in `localStorage` via `src/lib/user-local-storage.ts`
- Managed by `ConfigContext` (`src/contexts/config-context.tsx`)
- Per-user settings with automatic persistence on change

### Current Format Handling
- `src/lib/date-format.ts`: `formatDate()`, `formatTime()`, `formatDateTime()`
- `src/lib/number-format.ts`: `formatNumber()`, `formatBytes()`, `formatInteger()`, `formatDecimal()`, `formatCurrency()`, `formatPercentage()`
- Locale determined via `useLocale()` from `src/contexts/locale-context.tsx`

### Current Format Behavior by Locale
| Locale | Date Format | Time Format | Number Format |
|--------|-------------|-------------|---------------|
| en-GB | DD/MM/YYYY | 24h | 1,234.56 |
| de | DD.MM.YYYY | 24h | 1.234,56 |
| fr | DD/MM/YYYY | 24h | 1 234,56 |
| es | DD/MM/YYYY | 24h | 1.234,56 |
| pt-BR | DD/MM/YYYY | 24h | 1.234,56 |

---

## Implementation Details

### 1. Type Definitions (`src/lib/types.ts`)

```typescript
// Date/time format override options
export type DateTimeFormatOverride = 'locale-default' | '24h' | '12h';

// Number format override options
export type NumberFormatOverride = 'locale-default' | 'en-US' | 'en-GB' | 'de' | 'fr' | 'es' | 'pt-BR';
```

### 2. Default Config (`src/lib/default-config.ts`)

```typescript
export const defaultUIConfig = {
  // ... existing defaults
  dateTimeFormat: 'locale-default' as const,
  numberFormat: 'locale-default' as const,
};
```

### 3. Config Context Updates (`src/contexts/config-context.tsx`)

Add to `ConfigContextProps` interface:
```typescript
dateTimeFormat: DateTimeFormatOverride;
setDateTimeFormat: (format: DateTimeFormatOverride) => void;
numberFormat: NumberFormatOverride;
setNumberFormat: (format: NumberFormatOverride) => void;
```

Add state management:
```typescript
const [dateTimeFormat, setDateTimeFormat] = useState<DateTimeFormatOverride>(defaultUIConfig.dateTimeFormat);
const [numberFormat, setNumberFormat] = useState<NumberFormatOverride>(defaultUIConfig.numberFormat);
```

Update localStorage persistence in the `useEffect` that saves config.

### 4. Display Settings Form (`src/components/settings/display-settings-form.tsx`)

Add two new form sections after "Start of Week":

#### Date/Time Format Override
- Dropdown with options:
  - "Based on locale (default)" - uses current locale's format
  - "24-hour format (14:30)" - forces 24-hour time display
  - "12-hour format (2:30 PM)" - forces 12-hour time with AM/PM

#### Number Format Override
- Dropdown with options:
  - "Based on locale (default)" - uses current locale's format
  - "English (1,234.56)" - en-US style: comma thousands, period decimal
  - "British English (1,234.56)" - en-GB style: comma thousands, period decimal
  - "German (1.234,56)" - period thousands, comma decimal
  - "French (1 234,56)" - space thousands, comma decimal
  - "Spanish (1.234,56)" - period thousands, comma decimal
  - "Brazilian Portuguese (1.234,56)" - period thousands, comma decimal

### 5. Date Format Library Updates (`src/lib/date-format.ts`)

Modify `formatTime()` and `formatDateTime()` to accept optional override:

```typescript
export function formatTime(dateString: string, locale: string = 'en-GB', formatOverride?: DateTimeFormatOverride): string {
  // When formatOverride is '24h', use hour12: false
  // When formatOverride is '12h', use hour12: true
  // When formatOverride is 'locale-default', use locale config
}

export function formatDateTime(dateString: string, locale: string = 'en-GB', formatOverride?: DateTimeFormatOverride): string {
  // Same override logic as formatTime
}
```

### 6. Number Format Library Updates (`src/lib/number-format.ts`)

Modify functions to accept optional format override:

```typescript
export function formatNumber(value: number, locale: string = 'en-GB', options?: Intl.NumberFormatOptions, formatOverride?: NumberFormatOverride): string {
  // When formatOverride is not 'locale-default', use the specified locale for formatting
}

// Similar updates for formatBytes, formatInteger, formatDecimal, formatCurrency, formatPercentage
```

### 7. Component Integration

Components using formatting functions need to access the overrides from config context:

```typescript
// Example pattern for components
const { dateTimeFormat, numberFormat } = useConfig();

// When calling format functions, pass the overrides
formatTime(backupDate, locale, dateTimeFormat);
formatNumber(fileSize, locale, undefined, numberFormat);
```

**Key files to update:**
- `src/app/detail/[serverId]/backup/[backupId]/page.tsx` - uses `toLocaleString()` directly, needs to use format functions
- `src/components/settings/database-maintenance-form.tsx` - uses `toLocaleString()`
- `src/components/settings/application-logs-viewer.tsx` - uses `toLocaleString()`
- Any component importing from `date-format.ts` or `number-format.ts`

---

## Implementation Checklist

- [ ] Add type definitions to `src/lib/types.ts`
- [ ] Update default config in `src/lib/default-config.ts`
- [ ] Extend `ConfigContext` with new state and persistence
- [ ] Update `formatTime()` in `src/lib/date-format.ts`
- [ ] Update `formatDateTime()` in `src/lib/date-format.ts`
- [ ] Update `formatNumber()` in `src/lib/number-format.ts`
- [ ] Update `formatBytes()` in `src/lib/number-format.ts`
- [ ] Add UI controls to `display-settings-form.tsx`
- [ ] Update components using direct `toLocaleString()` calls
- [ ] Test with various locale/format combinations
- [ ] Update `dev/CHANGELOG.md`

---

## Testing Scenarios

1. **en-GB locale with 12h override**: Should display times as "2:30 PM" instead of "14:30"
2. **de locale with en-US number override**: Should display "1,234.56" instead of "1.234,56"
3. **fr locale with locale-default**: Should use "1 234,56" format
4. **Transition between formats**: Ensure no display glitches when changing settings
5. **Persistence**: Settings should persist after page reload
6. **Preview**: Consider adding a preview of the format in the settings UI

---

## Notes

- No database migration required (settings stored in localStorage)
- Existing behavior preserved when "locale-default" is selected
- Number format override applies the locale's formatting rules but displays in the selected format