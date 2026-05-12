"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw, X } from "lucide-react";
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
  errorMessage: string;
}

interface ConnectivityErrorContextType {
  showConnectivityError: (message: string) => void;
  hideConnectivityError: () => void;
  isConnectivityErrorOpen: boolean;
}

const ConnectivityErrorContext = createContext<ConnectivityErrorContextType | undefined>(undefined);

export const ConnectivityErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ConnectivityErrorState>({
    isOpen: false,
    errorMessage: "",
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const { t } = useTranslation();

  const showConnectivityError = useCallback((message: string) => {
    setState({
      isOpen: true,
      errorMessage: message,
    });
  }, []);

  const hideConnectivityError = useCallback(() => {
    setState({
      isOpen: false,
      errorMessage: "",
    });
  }, []);

  const handleCloseWindow = useCallback(() => {
    // Attempt to close the browser window/tab
    window.close();
    // Fallback: if window.close() doesn't work (most modern browsers),
    // show an alert explaining how to close manually
    setTimeout(() => {
      alert(t("Please close this tab manually using your browser's close button."));
    }, 100);
  }, [t]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      // Try to connect to the server by making a simple health check request
      const response = await fetch("/api/health", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        // Connection restored, close the modal
        hideConnectivityError();
      } else {
        // Server returned an error status
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error) {
      // Connection still failed - keep modal open
      console.error("Retry connection failed:", error);
    } finally {
      setIsRetrying(false);
    }
  }, [hideConnectivityError]);

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
          
          {state.errorMessage && (
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              {state.errorMessage}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseWindow}
              className="mt-2 sm:mt-0 w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              {t("Close Window")}
            </Button>
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
