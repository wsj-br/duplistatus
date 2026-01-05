import React from 'react';
import Admonition from '@theme-original/Admonition';
import type {Props} from '@theme/Admonition';
import { Icon } from '@iconify/react';

/**
 * Lucide icon mapping for Docusaurus Admonitions
 * 
 * This component replaces the default Docusaurus admonition icons with
 * Lucide icons via Iconify to maintain consistency with the sidebar design.
 * 
 * Icon Mapping:
 * - note/info: lucide:info (Info icon)
 * - tip/success: lucide:check-circle (CheckCircle icon)
 * - warning: lucide:alert-triangle (AlertTriangle icon)
 * - danger/caution: lucide:alert-octagon (AlertOctagon icon)
 */
const admonitionIcons: Record<string, string> = {
  note: 'lucide:info',
  info: 'lucide:info',
  tip: 'lucide:check-circle',
  success: 'lucide:check-circle',
  warning: 'lucide:alert-triangle',
  danger: 'lucide:alert-octagon',
  caution: 'lucide:alert-octagon',
};

export default function AdmonitionWrapper(props: Props): JSX.Element {
  // Get the icon for this admonition type, default to 'note' if type is unknown
  const iconId = admonitionIcons[props.type] || admonitionIcons.note;
  
  // Create a custom icon element using Lucide via Iconify
  // The icon size matches the design system (20x20px)
  const customIcon = (
    <Icon 
      icon={iconId} 
      width={20} 
      height={20} 
      style={{ 
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0
      }} 
    />
  );

  // Override the icon prop with our custom Lucide icon
  // Docusaurus Admonition component accepts an 'icon' prop
  return <Admonition {...props} icon={customIcon} />;
}
