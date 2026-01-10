import React from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {Icon} from '@iconify/react';
import styles from './styles.module.css';

export default function ColorModeToggle(): JSX.Element {
  const {colorMode, setColorMode} = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <button
      className={`${styles.colorModeToggle} ${isDark ? styles.dark : styles.light}`}
      type="button"
      onClick={() => setColorMode(isDark ? 'light' : 'dark')}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={styles.track}>
        <div className={styles.slider}>
          {!isDark && <Icon icon="lucide:sun" className={styles.icon} />}
          {isDark && <Icon icon="lucide:moon" className={styles.icon} />}
        </div>
      </div>
    </button>
  );
}
