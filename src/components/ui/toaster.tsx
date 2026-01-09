"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, duration, ...props }) {
        // Error toasts (destructive) should persist until manually closed
        // Success/info toasts should auto-dismiss after their specified duration or default 3 seconds
        const toastDuration = variant === "destructive" 
          ? Infinity 
          : (typeof duration === "number" ? duration : 3000);
        
        return (
          <Toast 
            key={id}
            variant={variant}
            onOpenChange={(open) => {
              if (!open) removeToast(id);
            }}
            duration={toastDuration}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
