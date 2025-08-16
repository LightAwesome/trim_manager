// FILE: src/components/ui/Spinner.jsx
import React from 'react';

function Spinner({ size = 'md' }) {
  const style = size === 'sm'
    ? { width: '1.2rem', height: '1.2rem', borderWidth: '2px' }
    : { width: '3rem', height: '3rem', borderWidth: '4px' };

  return (
    <div
      style={{
        ...style,
        borderRadius: '50%',
        display: 'inline-block',
        borderStyle: 'solid',
        borderColor: 'var(--accent)',
        borderRightColor: 'transparent',
        animation: 'spin 1s linear infinite',
      }}
    >
        <style>
            {`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            `}
        </style>
    </div>
  );
}

export default Spinner;
