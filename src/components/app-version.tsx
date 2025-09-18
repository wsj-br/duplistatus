import React from 'react';

const AppVersion = () => {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <div className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
      v.{appVersion}
    </div>
  );
};

export default AppVersion;