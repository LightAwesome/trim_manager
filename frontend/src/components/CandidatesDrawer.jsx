// src/components/CandidatesDrawer.jsx
import React, { useCallback } from 'react';
import useApi from '../hooks/useApi';
import { getListingCandidates } from '../lib/api';
import Spinner from './ui/Spinner';

function CandidatesDrawer({ listing, isOpen, onClose, onAssign }) {
  const getCandidates = useCallback(
    () => getListingCandidates(listing.ad_id),
    [listing.ad_id]
  );

  const { data: candidates, loading, error } = useApi(getCandidates, {
    lazy: !isOpen,
    dependencies: [isOpen],
  });

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Candidates for "{listing.trim}"</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="drawer-content">
          {loading && <Spinner />}
          {error && <p className="error-state">Error: {error.message}</p>}
          {candidates && (
            <ul className="candidate-list">
              {candidates.length === 0 && <p>No candidates found.</p>}
              {candidates.map((candidate, index) => (
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
    </>
  );
}

export default CandidatesDrawer;
