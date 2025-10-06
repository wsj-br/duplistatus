import {useEffect} from 'react';
import {Redirect} from '@docusaurus/router';

export default function Home() {
  useEffect(() => {
    // Redirect to the intro page immediately
    window.location.href = '/0.8/intro';
  }, []);

  return <Redirect to="/0.8/intro" />;
}
