import React from 'react';
import DocSidebarItem from '@theme-original/DocSidebarItem';
import type {Props} from '@theme/DocSidebarItem';
import { Icon } from '@iconify/react';

// Lucide icon mapping
const icons: Record<string, string> = {
  wrench: 'lucide:wrench',
  bookOpen: 'lucide:book-open',
  settings: 'lucide:settings',
  arrowRightLeft: 'lucide:arrow-right-left',
  code2: 'lucide:code-2',
  terminal: 'lucide:terminal',
  history: 'lucide:history',
};

export default function DocSidebarItemWrapper(props: Props): JSX.Element {
  // Check if this is a category item with a custom icon prop
  if (props.item.type === 'category' && (props.item as any).customProps?.icon) {
    const iconName = (props.item as any).customProps.icon as keyof typeof icons;
    const iconId = icons[iconName];
    
    if (iconId) {
      // Clone the item and prepend the icon to the label
      // Docusaurus supports React elements as labels in category items
      const itemWithIcon = {
        ...props.item,
        label: (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Icon 
              icon={iconId} 
              width={16} 
              height={16} 
              style={{ marginRight: '12px', verticalAlign: 'middle' }} 
            />
            <span>{props.item.label}</span>
          </span>
        ) as any, // Type assertion needed as Docusaurus types may not include React elements
      };
      
      return <DocSidebarItem {...props} item={itemWithIcon} />;
    }
  }
  
  return <DocSidebarItem {...props} />;
}
