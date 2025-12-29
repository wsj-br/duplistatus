import React from 'react';
import { Icon } from '@iconify/react'; // Assuming you named it <IIcon> in MDX, but use 'Icon' here if you're importing it directly from @iconify/react
import Link from '@docusaurus/Link';
import styles from './IconButton.module.css'; // Use CSS Modules for local styling

export default function IconButton({ icon, label, onClick, href, className }) {
  // Prepare the content to be rendered inside the element
  const content = (
    <>
      <Icon icon={icon} height="16" style={{ verticalAlign: '-0.125em' }} />
      {label && <span className={styles.label}>{label}</span>}
    </>
  );
  
  // Conditionally render as Link if href is provided, otherwise as a <button> with onClick
  if (href) {
    return (
      <Link 
        to={href}
        onClick={onClick}
        className={`${styles.iconButton} ${className || ''}`}
      >
        {content}
      </Link>
    );
  }
  
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`${styles.iconButton} ${className || ''}`}
    >
      {content}
    </button>
  );
}