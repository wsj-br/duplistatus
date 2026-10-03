import type {JSX} from 'react';
import Translate from '@docusaurus/Translate';
import LucideIcon from '@site/src/components/LucideIcon';
import DocSidebarNavbarItem from '@theme/NavbarItem/DocSidebarNavbarItem';

type DocsNavbarItemProps = {
  mobile?: boolean;
};

export default function DocsNavbarItem({
  mobile = false,
}: DocsNavbarItemProps): JSX.Element {
  return (
    <DocSidebarNavbarItem
      mobile={mobile}
      sidebarId="mainSidebar"
      className="navbar-docs-link"
      label={
        <>
          <LucideIcon name="book-open" size={16} />
          <Translate
            id="homepage.nav.docs"
            description="Landing navbar link to the documentation">
            Docs
          </Translate>
        </>
      }
    />
  );
}
