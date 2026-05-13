"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConnectivityErrorState {
  isOpen: boolean;
}

interface ConnectivityErrorContextType {
  showConnectivityError: () => void;
  hideConnectivityError: () => void;
  isConnectivityErrorOpen: boolean;
}

const CHECK_INTERVAL = 30_000;


const ConnectivityErrorContext = createContext<ConnectivityErrorContextType | undefined>(undefined);

export const ConnectivityErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ConnectivityErrorState>({
    isOpen: false,
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const { t } = useTranslation();

  const showConnectivityError = useCallback(() => {
    setState({
      isOpen: true,
    });
  }, []);

  const hideConnectivityError = useCallback(() => {
    setState({
      isOpen: false,
    });
  }, []);

  const fetchWithTimeout = useCallback(
    async (input: RequestInfo, init?: RequestInit, timeoutMs = 5000) => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(input, {
          ...init,
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timer);
      }
    },
    [],
  );



  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      const response = await fetchWithTimeout(
        "/api/ping",
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        },
        5000,
      );

      if (response.ok) {
        hideConnectivityError();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error) {
      console.error("Retry connection failed:", error);
    } finally {
      setIsRetrying(false);
    }
  }, [fetchWithTimeout, hideConnectivityError]);

  const checkPing = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(
        "/api/ping",
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        },
        5000,
      );

      if (response.ok) {
        hideConnectivityError();
      } else {
        showConnectivityError();
      }
    } catch (error) {
      showConnectivityError();
    }
  }, [fetchWithTimeout, hideConnectivityError, showConnectivityError]);

  useEffect(() => {
    checkPing();
    const intervalId = window.setInterval(checkPing, CHECK_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, [checkPing]);

  useEffect(() => {
    const handleOnline = () => {
      checkPing();
    };

    const handleOffline = () => {
      showConnectivityError();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkPing, showConnectivityError]);

  // Prevent all user interactions when modal is open
  useEffect(() => {
    if (state.isOpen) {
      // Add a class to body to prevent scrolling
      document.body.style.overflow = "hidden";
      
      // Prevent keyboard interactions
      const handleKeyDown = (e: KeyboardEvent) => {
        // Allow only Tab for accessibility and Enter/Space for buttons
        const allowedKeys = ["Tab", "Enter", "Space"];
        if (!allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [state.isOpen]);

  return (
    <ConnectivityErrorContext.Provider
      value={{
        showConnectivityError,
        hideConnectivityError,
        isConnectivityErrorOpen: state.isOpen,
      }}
    >
      {children}
      <Dialog open={state.isOpen}>
        <DialogContent 
          className="max-w-md border-destructive/50 [&>button]:hidden"
          // Prevent closing by clicking outside or pressing Escape
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          // Hide the default close button
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <DialogTitle className="text-destructive">
                {t("Connection Lost")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {t("Unable to connect to the server. The application cannot function without a connection.")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRetrying ? t("Retrying...") : t("Retry Connection")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConnectivityErrorContext.Provider>
  );
};

export const useConnectivityError = (): ConnectivityErrorContextType => {
  const context = useContext(ConnectivityErrorContext);
  if (context === undefined) {
    throw new Error("useConnectivityError must be used within a ConnectivityErrorProvider");
  }
  return context;
};

// Utility function to check if an error is a network/connectivity error
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    // TypeError is often thrown for network failures in fetch
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("failed to fetch") ||
      message.includes("unable to connect") ||
      message.includes("connection refused")
    );
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("offline") ||
      message.includes("unreachable") ||
      message.includes("unable to retrieve csrf token") ||
      message.includes("unable to create session") ||
      message.includes("failed to fetch")
    );
  }
  return false;
};
