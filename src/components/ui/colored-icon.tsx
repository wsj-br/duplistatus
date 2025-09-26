"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColoredIconProps {
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
  purple: 'text-purple-500',
  gray: 'text-gray-500',
};

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function ColoredIcon({ 
  icon: Icon, 
  color = 'blue', 
  size = 'md', 
  className,
  ...props
}: ColoredIconProps) {
  return (
    <Icon 
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  );
}

// Status indicator component
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  label?: string;
  animate?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  label, 
  animate = false,
  className 
}: StatusIndicatorProps) {
  const statusClasses = {
    online: 'status-dot-success',
    offline: 'status-dot-error',
    warning: 'status-dot-warning',
    error: 'status-dot-error',
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <div 
        className={cn(
          "status-dot",
          statusClasses[status],
          animate && "animate-pulse-status"
        )} 
      />
      {label && <span>{label}</span>}
    </div>
  );
}
