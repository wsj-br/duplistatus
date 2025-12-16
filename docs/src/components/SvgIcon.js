import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './IconButton.module.css'; // Re-use the existing CSS Module

export default function SvgIcon({ svgFilename, alt, className, height = 14, gap = 6, style = {} }) {
  // Construct the full path to the SVG file
  const svgPath = useBaseUrl(`/img/${svgFilename}`);

  // Merge gap spacing with any additional user-provided styles
  const gapStyle = gap ? { marginLeft: `${gap}px`, marginRight: `${gap}px` } : {};
  const mergedStyle = { ...gapStyle, ...style };

  // Render just the SVG icon without button/border styling
  // Prevent zoom behavior: add no-zoom class and data-nozoom attribute to exclude from image zoom
  return (
    <img 
      src={svgPath} 
      alt={alt || `${svgFilename} icon`}
      height={height} 
      className={`${className || ''} no-zoom`}
      style={mergedStyle}
      data-nozoom
    />
  );
}
