import type {JSX} from 'react';
import Translate from '@docusaurus/Translate';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import GetStartedNavbarItem from './GetStartedNavbarItem';

type LandingNavLinksProps = {
  mobile?: boolean;
};

function hashIsActive(hash: string) {
  return (_match: unknown, location: {hash: string}): boolean => location.hash === hash;
}

function LandingSectionLinks({mobile}: {mobile: boolean}): JSX.Element {
  return (
    <>
      <DefaultNavbarItem
        mobile={mobile}
        to="/#features"
        className="navbar-landing-link"
        isActive={hashIsActive('#features')}
        label={
          <Translate
            id="homepage.nav.features"
            description="Landing navbar link to the features section">
            Features
          </Translate>
        }
      />
      <DefaultNavbarItem
        mobile={mobile}
        to="/#workflow"
        className="navbar-landing-link"
        isActive={hashIsActive('#workflow')}
        label={
          <Translate
            id="homepage.nav.howItWorks"
            description="Landing navbar link to the workflow section">
            How it works
          </Translate>
        }
      />
      <DefaultNavbarItem
        mobile={mobile}
        to="/#security"
        className="navbar-landing-link"
        isActive={hashIsActive('#security')}
        label={
          <Translate
            id="homepage.nav.security"
            description="Landing navbar link to the security section">
            Security
          </Translate>
        }
      />
      <DefaultNavbarItem
        mobile={mobile}
        to="/#install"
        className="navbar-landing-link"
        isActive={hashIsActive('#install')}
        label={
          <Translate
            id="homepage.nav.install"
            description="Landing navbar link to the install section">
            Install
          </Translate>
        }
      />
      <GetStartedNavbarItem mobile={mobile} />
    </>
  );
}

export default function LandingNavLinks({
  mobile = false,
}: LandingNavLinksProps): JSX.Element {
  if (mobile) {
    return <LandingSectionLinks mobile />;
  }

  return (
    <div className="navbar-center">
      <LandingSectionLinks mobile={false} />
    </div>
  );
}
