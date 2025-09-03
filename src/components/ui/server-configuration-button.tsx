import React from 'react';
import { Button } from '@/components/ui/button';
import { ServerIcon } from './server-icon';

interface ServerConfigurationButtonProps {
  serverUrl: string;
  machineName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  showText?: boolean;
  debugText?: string;
}

export function ServerConfigurationButton({
  serverUrl,
  machineName,
  size = 'md',
  variant = 'outline',
  className = '',
  onClick,
  disabled = false,
  showText = false,
  debugText = ''
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
        return 12;
      case 'lg':
        return 20;
      default: // md
        return 16;
    }
  };

  const isDisabled = disabled || !isUrlValid();

  if (debugText) {
    console.log('--------------------------------');
    console.log('ServerConfigurationButton: machineName', machineName);
    console.log('ServerConfigurationButton: isDisabled', isDisabled);
    console.log('ServerConfigurationButton: isUrlValid', isUrlValid());
    console.log('ServerConfigurationButton: disabled', disabled);
    console.log('ServerConfigurationButton: serverUrl', serverUrl);
    console.log('ServerConfigurationButton: onClick', onClick);
    console.log('ServerConfigurationButton: showText', showText);
    console.log('ServerConfigurationButton: variant', variant);
    console.log('ServerConfigurationButton: size', size);
    console.log('ServerConfigurationButton: className', className);
    console.log('ServerConfigurationButton: debugText', debugText);
    console.log('--------------------------------');
  }

  return (
    <Button
      variant={variant}
      size={size === 'md' ? 'default' : size}
      className={`${className} ${isDisabled ? 'cursor-not-allowed disabled:pointer-events-auto' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isDisabled ? "No URL configured" : (machineName ? `Open ${machineName} configuration` : "Open Duplicati configuration")}
    >
      <ServerIcon size={getIconSize()} className="mr-1" />
      {showText && "Duplicati configuration"}
    </Button>
  );
}
