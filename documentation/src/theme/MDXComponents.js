
import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import { Icon } from '@iconify/react'; // Import the entire Iconify library.

// custom components
import IconButton from '@site/src/components/IconButton.js'; 
import SvgButton from '@site/src/components/SvgButton.js'; 
import SvgIcon from '@site/src/components/SvgIcon.js'; 
import IIcon2 from '@site/src/components/IIcon2.js'; 


const MDXMapping = {
  // Re-use the default mapping
  ...MDXComponents,
  IIcon: Icon, // Make the iconify Icon component available in MDX as <icon />.
  IconButton: IconButton, // same as IIcon but in a button format
  SvgButton: SvgButton, // same as IconButton component but with an SVG image
  SvgIcon: SvgIcon, // same as IconButton component but with an SVG image
  IIcon2: IIcon2, // same as SvgIcon but uses Iconify Icon instead of SVG
};

export default MDXMapping;
