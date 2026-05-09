"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface DashboardServerFilterContextValue {
  serverFilter: string;
  setServerFilter: (value: string) => void;
}

const DashboardServerFilterContext =
  createContext<DashboardServerFilterContextValue | null>(null);

export function DashboardServerFilterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [serverFilter, setServerFilterState] = useState("");

  const setServerFilter = useCallback((value: string) => {
    setServerFilterState(value);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setServerFilterState("");
    }
  }, [pathname]);

  const value = useMemo(
    () => ({ serverFilter, setServerFilter }),
    [serverFilter, setServerFilter]
  );

  return (
    <DashboardServerFilterContext.Provider value={value}>
      {children}
    </DashboardServerFilterContext.Provider>
  );
}

export function useDashboardServerFilter(): DashboardServerFilterContextValue {
  const ctx = useContext(DashboardServerFilterContext);
  if (!ctx) {
    throw new Error(
      "useDashboardServerFilter must be used within DashboardServerFilterProvider"
    );
  }
  return ctx;
}
