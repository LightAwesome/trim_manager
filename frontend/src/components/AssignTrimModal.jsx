// FILE: src/components/AssignTrimModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import useApi from '../hooks/useApi';
import { getTrims, assignTrimToListing } from '../lib/api';
import useDebounce from '../hooks/useDebounce';
import Spinner from './ui/Spinner';
import { useToast } from '../contexts/ToastContext';
import { useMemo } from 'react';


function AssignTrimModal({ listing, isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState(listing.selectedCandidate ? 'Pick Candidate' : 'Search TrimMaster');
  const [freeTextTrim, setFreeTextTrim] = useState('');
  const [searchQuery, setSearchQuery] = useState(`${listing.brand} ${listing.model}`);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

// Corrected logic
const searchFn = useMemo(() => {
  return () => {
    // Correctly get the make and model from the separate listing props
    const make = listing.brand;
    const model = listing.model;

    // Use the debouncedQuery for searching, but correctly split it
    // into make and model based on the initial listing.
    let makeToSearch = make;
    let modelToSearch = model;

    // Allow user to search, but ensure a valid make/model pair is always sent
    if (debouncedQuery !== `${make} ${model}`) {
      const parts = debouncedQuery.trim().split(/\s+/);
      makeToSearch = parts[0];
      modelToSearch = parts.slice(1).join(' ');
    }

    // Prevent bad calls if either is empty
    if (!makeToSearch || !modelToSearch) return Promise.resolve([]);

    return getTrims({ make: makeToSearch, model: modelToSearch, limit: 100 });
  };
}, [debouncedQuery, listing.brand, listing.model]);

const { data: searchResults, loading: searchLoading } = useApi(searchFn, { dependencies: [debouncedQuery] });
  useEffect(() => {
      // pre-select candidate if one was passed in
      if (listing.selectedCandidate) {
          setActiveTab('Pick Candidate');
      }
  }, [listing.selectedCandidate]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await assignTrimToListing(listing.ad_id, payload);
      let assignedTrimMaster = null;
      if (payload.trim_master_id && searchResults) {
        assignedTrimMaster = searchResults.find(t => t.id === payload.trim_master_id);
      }
      onSuccess(assignedTrimMaster);
    } catch (err) {
      showToast(err.message || 'Failed to assign trim.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Pick Candidate':
        return (
          <div>
            <p>Assigning based on a candidate suggestion.</p>
            <div className="card" style={{ background: 'var(--primary-bg)', marginTop: '1rem' }}>
              <strong>{listing.selectedCandidate}</strong>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => handleSubmit({ normalized_trim: listing.selectedCandidate })} disabled={submitting}>
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        );
      case 'Search TrimMaster':
        return (
          <div>
            <input
              type="text"
              className="input"
              placeholder="Search by make and model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchLoading && <div style={{padding: '2rem 0'}}><Spinner /></div>}
            <ul style={{ listStyle: 'none', maxHeight: '250px', overflowY: 'auto', marginTop: '1rem' }}>
              {searchResults && searchResults.map(trim => (
                <li key={trim.id} className="candidate-item">
                  <span>{trim.trim_name} ({trim.year_start}-{trim.year_end})</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleSubmit({ trim_master_id: trim.id })} disabled={submitting}>
                    Assign
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'Free Text':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ normalized_trim: freeTextTrim }); }}>
            <p>Enter a normalized trim value manually. This will not be linked to the TrimMaster.</p>
            <div className="form-group">
              <label htmlFor="free-text-trim">Normalized Trim</label>
              <input
                id="free-text-trim"
                type="text"
                className="input"
                value={freeTextTrim}
                onChange={(e) => setFreeTextTrim(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={!freeTextTrim || submitting}>
                {submitting ? 'Assigning...' : 'Assign Manually'}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Trim for ${listing.brand} ${listing.model}`}>
      <div className="tabs">
        <button className={`tab ${activeTab === 'Search TrimMaster' ? 'active' : ''}`} onClick={() => setActiveTab('Search TrimMaster')}>Search Master</button>
        <button className={`tab ${activeTab === 'Free Text' ? 'active' : ''}`} onClick={() => setActiveTab('Free Text')}>Free Text</button>
        {listing.selectedCandidate && <button className={`tab ${activeTab === 'Pick Candidate' ? 'active' : ''}`} onClick={() => setActiveTab('Pick Candidate')}>From Candidate</button>}
      </div>
      <div>{renderContent()}</div>
    </Modal>
  );
}

export default AssignTrimModal;
