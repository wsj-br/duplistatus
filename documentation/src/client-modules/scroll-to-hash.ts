import type {ClientModule} from '@docusaurus/types';

let pendingFrame = 0;
let pendingTimer = 0;

function cancelPendingScroll(): void {
  if (pendingFrame !== 0) {
    window.cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
  }
  if (pendingTimer !== 0) {
    window.clearTimeout(pendingTimer);
    pendingTimer = 0;
  }
}

function scrollToHash(hash: string): boolean {
  const id = decodeURIComponent(hash.substring(1));
  if (!id) {
    return true;
  }
  const element = document.getElementById(id);
  if (!element) {
    return false;
  }
  element.scrollIntoView();
  return true;
}

const clientModule: ClientModule = {
  onRouteDidUpdate({location, previousLocation}) {
    cancelPendingScroll();
    // Later navigations are scrolled by Docusaurus. The first load is not:
    // the dev shell has no headings yet, so the browser's native hash scroll
    // runs before the target exists and is never retried.
    if (previousLocation || !location.hash) {
      return;
    }
    if (scrollToHash(location.hash)) {
      return;
    }
    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0;
      if (location.hash !== window.location.hash || scrollToHash(location.hash)) {
        return;
      }
      pendingTimer = window.setTimeout(() => {
        pendingTimer = 0;
        if (location.hash === window.location.hash) {
          scrollToHash(location.hash);
        }
      }, 0);
    });
  },
};

export default clientModule;
