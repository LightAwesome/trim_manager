// FILE: src/components/CandidatesDrawer.jsx
import React from 'react';
import useApi from '../hooks/useApi';
import { getListingCandidates } from '../lib/api';
import Spinner from './ui/Spinner';

function CandidatesDrawer({ listing, isOpen, onClose, onAssign }) {
  const { data, loading, error } = useApi(() => getListingCandidates(listing.ad_id), {
    lazy: !isOpen,
    dependencies: [isOpen, listing.ad_id],
  });

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Candidates for "{listing.trim}"</h3>
        <button onClick={onClose} className="modal-close-btn">&times;</button>
      </div>
      <div className="drawer-content">
        {loading && <Spinner />}
        {error && <p className="error-state">Error: {error.message}</p>}
        {data && (
          <ul className="candidate-list">
            {data.candidates.length === 0 && <p>No candidates found.</p>}
            {data.candidates.map((candidate, index) => (
              <li key={index} className="candidate-item">
                <div>
                  <p style={{ fontWeight: 600 }}>{candidate.trim}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Score: {(candidate.score * 100).toFixed(1)}%</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => onAssign(candidate.trim)}>
                  Assign
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CandidatesDrawer;
