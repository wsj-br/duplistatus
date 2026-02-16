/**
 * Hook for RTL (Right-to-Left) support
 * Provides RTL detection and utilities for components
 */

import { useLocale } from "@/contexts/locale-context";
import { isRTL, getTextDirection, getLogicalProperties } from "@/lib/rtl-utils";
import { useMemo } from "react";

/**
 * Hook to get RTL information for the current locale
 * 
 * @returns Object with RTL detection and utilities
 */
export function useRTL() {
  const locale = useLocale();
  
  return useMemo(() => {
    const direction = getTextDirection(locale);
    const rtl = isRTL(locale);
    const logicalProps = getLogicalProperties(direction);
    
    return {
      locale,
      direction,
      isRTL: rtl,
      logicalProps,
    };
  }, [locale]);
}
