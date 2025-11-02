import { useState, useEffect } from 'react';

export const ZoomMermaid = ({ children }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!isZoomed) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isZoomed]);

  if (isZoomed) {
    return (
      <div
        onClick={() => setIsZoomed(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          cursor: 'pointer',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--ifm-background-color, #ffffff)',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              transform: 'scale(6)',
              transformOrigin: 'center center',
              minWidth: 'fit-content',
              minHeight: 'fit-content',
              cursor: 'pointer',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsZoomed(true)}
      style={{
        cursor: 'pointer',
        transform: 'scale(3)',
        transformOrigin: 'top left',
        display: 'inline-block',
        marginBottom: '100px',
      }}
    >
      {children}
    </div>
  );
};