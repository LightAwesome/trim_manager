// FILE: src/components/ui/Badge.jsx
import React from 'react';

function Badge({ children, type = 'default' }) {
  // type can be: review, exact, fuzzy, manual, unmatched
  const className = `badge badge-${type}`;
  return <span className={className}>{children}</span>;
}

export default Badge;
