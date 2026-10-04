import {useEffect, type JSX} from 'react';
import Head from '@docusaurus/Head';
import {translate} from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import dashboardDe from '@site/i18n/de/docusaurus-plugin-content-docs/current/assets/screen-main-dashboard-card-mode.png';
import dashboardEs from '@site/i18n/es/docusaurus-plugin-content-docs/current/assets/screen-main-dashboard-card-mode.png';
import dashboardFr from '@site/i18n/fr/docusaurus-plugin-content-docs/current/assets/screen-main-dashboard-card-mode.png';
import dashboardHi from '@site/i18n/hi/docusaurus-plugin-content-docs/current/assets/screen-main-dashboard-card-mode.png';
import dashboardPtBr from '@site/i18n/pt-BR/docusaurus-plugin-content-docs/current/assets/screen-main-dashboard-card-mode.png';
import dashboardZhHans from '@site/i18n/zh-Hans/docusaurus-plugin-content-docs/current/assets/screen-main-dashboard-card-mode.png';
import landingHtmlEn from '@site/src/landing/landing.html';
import landingHtmlDe from '@site/src/landing/i18n/de/landing.html';
import landingHtmlEs from '@site/src/landing/i18n/es/landing.html';
import landingHtmlFr from '@site/src/landing/i18n/fr/landing.html';
import landingHtmlHi from '@site/src/landing/i18n/hi/landing.html';
import landingHtmlPtBr from '@site/src/landing/i18n/pt-BR/landing.html';
import landingHtmlZhHans from '@site/src/landing/i18n/zh-Hans/landing.html';
import '@site/src/landing/landing.css';
import Layout from '@theme/Layout';

const LANDING_HTML: Record<string, string> = {
  'en-GB': landingHtmlEn,
  de: landingHtmlDe,
  es: landingHtmlEs,
  fr: landingHtmlFr,
  hi: landingHtmlHi,
  'pt-BR': landingHtmlPtBr,
  'zh-Hans': landingHtmlZhHans,
};

const DASHBOARD_SHOT: Record<string, string> = {
  de: dashboardDe,
  es: dashboardEs,
  fr: dashboardFr,
  hi: dashboardHi,
  'pt-BR': dashboardPtBr,
  'zh-Hans': dashboardZhHans,
};

function isExternalOrSpecial(url: string): boolean {
  return (
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('data:') ||
    /^[a-z][a-z0-9+.-]*:/i.test(url)
  );
}

function isAssetUrl(url: string): boolean {
  const pathOnly = url.split(/[?#]/u, 1)[0] ?? url;
  return (
    pathOnly.startsWith('/assets/') ||
    pathOnly.startsWith('/img/') ||
    /\.(png|jpe?g|gif|svg|webp|ico)$/iu.test(pathOnly)
  );
}

function withSitePrefix(url: string, baseUrl: string): string {
  if (!url.startsWith('/') || url.startsWith('//')) {
    return url;
  }
  if (url.startsWith(baseUrl)) {
    return url;
  }
  const rest = url.replace(/^\//u, '');
  return `${baseUrl}${rest}`;
}

function rewriteAttr(
  html: string,
  attr: 'href' | 'src',
  rewrite: (value: string) => string,
): string {
  const re = new RegExp(`(\\s${attr}=")([^"]*)(")`, 'giu');
  return html.replace(re, (_full, prefix: string, value: string, suffix: string) => {
    return `${prefix}${rewrite(value)}${suffix}`;
  });
}

function rewriteLandingHtml(
  html: string,
  options: {
    baseUrl: string;
    dashboardSrc: string;
  },
): string {
  let next = html.replace(
    /(<img\b[^>]*\bdata-landing-shot="dashboard"[^>]*\bsrc=")([^"]*)(")/iu,
    `$1${options.dashboardSrc}$3`,
  );
  next = next.replace(
    /(<img\b[^>]*\bsrc=")([^"]*)("[^>]*\bdata-landing-shot="dashboard")/iu,
    `$1${options.dashboardSrc}$3`,
  );

  next = rewriteAttr(next, 'src', (value) => {
    if (isExternalOrSpecial(value) || value.startsWith(options.baseUrl)) {
      return value;
    }
    return withSitePrefix(value, options.baseUrl);
  });

  next = rewriteAttr(next, 'href', (value) => {
    if (isExternalOrSpecial(value) || value.startsWith(options.baseUrl)) {
      return value;
    }
    return withSitePrefix(value, options.baseUrl);
  });

  return next;
}

function collectLandingRefs(html: string): {anchors: string[]; links: string[]} {
  const anchors: string[] = [];
  const links: string[] = [];
  const idRe = /\sid="([^"]+)"/giu;
  let match = idRe.exec(html);
  while (match) {
    const id = match[1];
    if (id) {
      anchors.push(id);
    }
    match = idRe.exec(html);
  }
  const hrefRe = /\shref="(\/[^"]*)"/giu;
  match = hrefRe.exec(html);
  while (match) {
    const href = match[1];
    if (href && !href.startsWith('//') && !isAssetUrl(href) && !isExternalOrSpecial(href)) {
      links.push(href.split('#', 1)[0] ?? href);
    }
    match = hrefRe.exec(html);
  }
  return {anchors, links};
}

export default function Home(): JSX.Element {
  const {siteConfig, i18n} = useDocusaurusContext();
  const locale = i18n.currentLocale;
  const fallbackDashboard = useBaseUrl('/assets/screen-main-dashboard-card-mode.png');
  const brokenLinks = useBrokenLinks();

  const sourceHtml = LANDING_HTML[locale] ?? landingHtmlEn;
  const html = rewriteLandingHtml(sourceHtml, {
    baseUrl: siteConfig.baseUrl,
    dashboardSrc: DASHBOARD_SHOT[locale] ?? fallbackDashboard,
  });
  const {anchors, links} = collectLandingRefs(html);
  for (const anchor of anchors) {
    brokenLinks.collectAnchor(anchor);
  }
  for (const link of links) {
    brokenLinks.collectLink(link);
  }

  const pageTitle = translate({
    id: 'homepage.meta.title',
    message: 'Monitor every Duplicati backup',
    description: 'HTML document title for the landing page',
  });
  const pageDescription = translate({
    id: 'homepage.meta.description',
    message:
      'Monitor every Duplicati backup from one dashboard. Open source, self-hosted and Docker-ready, with ntfy and email alerts.',
    description: 'HTML meta description for the landing page',
  });

  useEffect(() => {
    const root = document.querySelector('.landing');
    const dialog = document.getElementById('landing-lightbox');
    if (!(root instanceof HTMLElement) || !(dialog instanceof HTMLDialogElement)) {
      return;
    }
    const enlarged = dialog.querySelector('img');
    if (!(enlarged instanceof HTMLImageElement)) {
      return;
    }

    const openShot = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const button = target.closest('[data-landing-zoom]');
      if (!(button instanceof HTMLElement) || !root.contains(button)) {
        return;
      }
      const source = button.querySelector('img');
      if (!(source instanceof HTMLImageElement)) {
        return;
      }
      enlarged.src = source.currentSrc || source.src;
      enlarged.alt = source.alt;
      const width = source.naturalWidth || source.width;
      const height = source.naturalHeight || source.height;
      if (width > 0) {
        enlarged.width = width;
      }
      if (height > 0) {
        enlarged.height = height;
      }
      if (!dialog.open) {
        dialog.showModal();
      }
    };

    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close();
      }
    };

    root.addEventListener('click', openShot);
    dialog.addEventListener('click', closeOnBackdrop);
    return () => {
      root.removeEventListener('click', openShot);
      dialog.removeEventListener('click', closeOnBackdrop);
    };
  }, [html]);

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Head>
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* TODO(author): og:url and og:image */}
      </Head>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </Layout>
  );
}
