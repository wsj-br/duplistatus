import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import DocsNavbarItem from './DocsNavbarItem';
import LandingNavLinks from './LandingNavLinks';

const ComponentTypes = {
  ...OriginalComponentTypes,
  'custom-landingNavLinks': LandingNavLinks,
  'custom-docsLink': DocsNavbarItem,
};

export default ComponentTypes;
