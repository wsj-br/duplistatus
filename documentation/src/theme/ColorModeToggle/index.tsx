import React from 'react';
import type {Props} from '@theme/ColorModeToggle';
import {Icon} from '@iconify/react';

import styles from './styles.module.css';

/**
 * Custom ColorModeToggle component using Lucide icons
 * 
 * Pill-shaped segmented toggle matching the Lucide website design:
 * - Both Sun and Moon icons visible
 * - Active mode is highlighted with background
 * 
 * Props received from Docusaurus:
 * - value: 'light' | 'dark' - current color mode
 * - onChange: (colorMode: ColorMode) => void - callback to change mode
 */
export default function ColorModeToggle({value, onChange}: Props): JSX.Element {
  const isDarkMode = value === 'dark';

  return (
    <div className={styles.toggleContainer} role="radiogroup" aria-label="Color mode">
      <button
        className={`${styles.toggleOption} ${!isDarkMode ? styles.active : ''}`}
        onClick={() => onChange('light')}
        title="Light mode"
        aria-label="Light mode"
        aria-checked={!isDarkMode}
        role="radio"
        type="button"
      >
        <Icon
          icon="lucide:sun"
          width={16}
          height={16}
          className={styles.toggleIcon}
        />
      </button>
      <button
        className={`${styles.toggleOption} ${isDarkMode ? styles.active : ''}`}
        onClick={() => onChange('dark')}
        title="Dark mode"
        aria-label="Dark mode"
        aria-checked={isDarkMode}
        role="radio"
        type="button"
      >
        <Icon
          icon="lucide:moon"
          width={16}
          height={16}
          className={styles.toggleIcon}
        />
      </button>
    </div>
  );
}
