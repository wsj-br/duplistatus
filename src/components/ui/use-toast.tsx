"use client";

import * as React from "react";

export type ToastType = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

type ToastContextType = {
  toast: (options: Omit<ToastType, "id">) => void;
  toasts: ToastType[];
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);
  const [counter, setCounter] = React.useState(0);

  const toast = React.useCallback((options: Omit<ToastType, "id">) => {
    const id = `toast-${counter}`;
    setCounter(prev => prev + 1);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, [counter]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Update context value with memoization
  const contextValue = React.useMemo(
    () => ({
      toast,
      toasts,
      removeToast,
    }),
    [toast, toasts, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
} 