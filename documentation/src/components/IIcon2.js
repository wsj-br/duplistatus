import React from 'react';
import { Icon } from '@iconify/react';

export default function IIcon2({ icon, alt, className, height = 14, gap = 6, style = {}, color }) {
  // Merge gap spacing with any additional user-provided styles
  const gapStyle = gap ? { marginLeft: `${gap}px`, marginRight: `${gap}px` } : {};
  const colorStyle = color ? { color } : {};
  const mergedStyle = { ...gapStyle, ...colorStyle, ...style };

  // Render the Iconify icon (same as IIcon in MDX)
  return (
    <Icon 
      icon={icon}
      height={height}
      aria-label={alt || `${icon} icon`}
      className={className || ''}
      style={{ ...mergedStyle, verticalAlign: 'middle' }}
    />
  );
}

