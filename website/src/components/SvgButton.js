import React from 'react';
import Link from '@docusaurus/Link';
import styles from './IconButton.module.css'; // Re-use the existing CSS Module

// Get the base URL path for the static assets folder
// This is required because Docusaurus moves static files to the root on build.
const staticBaseUrl = require('@docusaurus/core/lib/client/exports/useBaseUrl').default;

export default function SvgButton({ svgFilename, label, href, className, height = 14 }) {
  // 1. Construct the full path to the SVG file
  // Example: staticBaseUrl('/img/my-icon.svg') returns /docs-site/img/my-icon.svg
  const svgPath = staticBaseUrl(`/img/${svgFilename}`);

  // 2. Use a standard <img> tag to display the SVG
  // This is simpler and avoids potential issues with SVGs being rendered as React components.
  // We use the constructed path as the src.
  // Prevent zoom behavior: add no-zoom class and data-nozoom attribute to exclude from image zoom
  const SvgElement = (
    <img 
      src={svgPath} 
      alt={`${label} icon`}
      height={height} 
      className={`${styles.svgIcon} no-zoom`}
      data-nozoom
    />
  );
  
  // 3. Prepare the content to be rendered inside the element
  const content = (
    <>
      {SvgElement}
      {label && <span className={styles.label}>{label}</span>}
    </>
  );
  
  // 4. Conditionally render as Link if href is provided, otherwise as a disabled <button>
  if (href) {
    return (
      <Link 
        to={href}
        className={`${styles.iconButton} ${className || ''}`}
      >
        {content}
      </Link>
    );
  }
  
  return (
    <button 
      type="button"
      disabled
      className={`${styles.iconButton} ${className || ''}`}
    >
      {content}
    </button>
  );
}