import type {JSX} from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';

type GetStartedNavbarItemProps = {
  mobile?: boolean;
};

export default function GetStartedNavbarItem({
  mobile = false,
}: GetStartedNavbarItemProps): JSX.Element {
  const label = (
    <Translate
      id="homepage.nav.getStarted"
      description="Landing navbar call-to-action that scrolls to install">
      Get Started
    </Translate>
  );

  if (mobile) {
    return (
      <li className="menu__list-item">
        <Link className="menu__link navbar-get-started-mobile" to="/#install">
          {label}
        </Link>
      </li>
    );
  }

  return (
    <div className="navbar__item">
      <Link className="button button--primary navbar-get-started" to="/#install">
        {label}
      </Link>
    </div>
  );
}
