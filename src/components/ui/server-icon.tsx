import React from 'react';

interface ServerIconProps {
  className?: string;
  size?: number;
}

export function ServerIcon({ className = "h-4 w-4", size }: ServerIconProps) {
  const iconSize = size || 16; // Default to 16px if no size specified
  
  return (
    <svg
      className={className}
      width={iconSize}
      height={iconSize}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs id="defs6" />
      <path
        d="m 240,440 c -27.2,0 -48,-20.8 -48,-48 v -80 c 0,-27.2 20.8,-48 48,-48 h 128 c 27.2,0 48,20.8 48,48 v 80 c 0,27.2 -20.8,48 -48,48 z"
        style={{display:"inline",fill:"#9f9f9f",fillOpacity:1}}
        id="path1"
      />
      <path
        d="M368 280c17.6 0 32 14.4 32 32v80c0 17.6-14.4 32-32 32H240c-17.6 0-32-14.4-32-32v-80c0-17.6 14.4-32 32-32zm0-32H240c-35.2 0-64 28.8-64 64v80c0 35.2 28.8 64 64 64h128c35.2 0 64-28.8 64-64v-80c0-35.2-28.8-64-64-64"
        style={{fill:"#ffffff",fillOpacity:1}}
        id="path2"
      />
      <path
        d="M64 472c-27.2 0-48-20.8-48-48V312c0-27.2 20.8-48 48-48h160c27.2 0 48 20.8 48 48v112c0 27.2-20.8 48-48 48z"
        style={{fill:"#5b5b5b",fillOpacity:1}}
        id="path3"
      />
      <path
        d="m 224,280 c 17.6,0 32,14.4 32,32 v 112 c 0,17.6 -14.4,32 -32,32 H 64 C 46.4,456 32,441.6 32,424 V 312 c 0,-17.6 14.4,-32 32,-32 z m 0,-32 H 64 C 28.8,248 0,276.8 0,312 v 112 c 0,35.2 28.8,64 64,64 h 160 c 35.2,0 64,-28.8 64,-64 V 312 c 0,-35.2 -28.8,-64 -64,-64"
        style={{fill:"#ffffff",fillOpacity:1}}
        id="path4"
      />
      <path
        d="m 192,328 c -27.2,0 -48,-20.8 -48,-48 V 88 c 0,-27.2 20.8,-48 48,-48 h 256 c 27.2,0 48,20.8 48,48 v 192 c 0,27.2 -20.8,48 -48,48 z"
        style={{display:"inline",fill:"#3e3e3e",fillOpacity:1}}
        id="path5"
      />
      <path
        d="m 448,56 c 17.6,0 32,14.4 32,32 v 192 c 0,17.6 -14.4,32 -32,32 H 192 c -17.6,0 -32,-14.4 -32,-32 V 88 c 0,-17.6 14.4,-32 32,-32 z m 0,-32 H 192 c -35.2,0 -64,28.8 -64,64 v 192 c 0,35.2 28.8,64 64,64 h 256 c 35.2,0 64,-28.8 64,-64 V 88 C 512,52.8 483.2,24 448,24"
        style={{fill:"#ffffff",fillOpacity:1}}
        id="path6"
      />
    </svg>
  );
}
