import {useEffect} from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home() {
  const introUrl = useBaseUrl('intro');
  
  useEffect(() => {
    // Redirect to the intro page immediately
    window.location.href = introUrl;
  }, [introUrl]);

  return <Redirect to={introUrl} />;
}
