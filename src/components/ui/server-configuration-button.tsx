import React from 'react';
import { Button } from '@/components/ui/button';
import { ServerIcon } from './server-icon';

interface ServerConfigurationButtonProps {
  serverUrl: string;
  serverName?: string;
  serverAlias?: string;
  size?:  'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  showText?: boolean;
  debugText?: string;
}

export function ServerConfigurationButton({
  serverUrl,
  serverName,
  serverAlias,
  size = 'md',
  variant = 'outline',
  className = '',
  onClick,
  disabled = false,
  showText = false
}: ServerConfigurationButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick();
      return;
    }

    // Default behavior: open server URL in new tab
    try {
      const url = new URL(serverUrl);
      if (['http:', 'https:'].includes(url.protocol)) {
        window.open(serverUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Invalid server URL:', error);
    }
  };

  const isUrlValid = () => {
    if (!serverUrl || serverUrl.trim() === '') return false;
    try {
      const url = new URL(serverUrl);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
          return 10;
      case 'lg':
        return 20;
      default: // md
        return 16;
    }
  };

  const isDisabled = disabled || !isUrlValid();

  return (
    <Button
      variant={variant}
      size={size === 'md' ? 'default' : size}
      className={`${className} ${isDisabled ? 'cursor-not-allowed disabled:pointer-events-auto' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isDisabled ? "No URL configured" : (serverAlias ? `Open ${serverAlias}(${serverName}) configuration` : (serverName ? `Open ${serverName} configuration` : "Open Duplicati configuration"))}
    >
      <ServerIcon size={getIconSize()} className="mr-1" />
      {showText && "Duplicati configuration"}
    </Button>
  );
}
