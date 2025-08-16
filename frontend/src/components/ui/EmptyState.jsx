// FILE: src/components/ui/EmptyState.jsx
import React from 'react';

function EmptyState({ message }) {
  return (
    <div className="empty-state card">
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
