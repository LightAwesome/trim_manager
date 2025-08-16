// FILE: src/components/AliasPromptModal.jsx
import React, { useState } from 'react';
import Modal from './ui/Modal';
import { createAlias, getTrims } from '../lib/api';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import { useToast } from '../contexts/ToastContext';
import Spinner from './ui/Spinner';

function AliasPromptModal({ isOpen, onClose, listing, trimMaster }) {
  const [aliasValue, setAliasValue] = useState((listing.trim || '').toLowerCase());
  const [selectedTrimMaster, setSelectedTrimMaster] = useState(trimMaster);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // For the case where a free-text assignment was made and we need to find a trim master
  const [searchTerm, setSearchTerm] = useState(trimMaster ? '' : `${listing.brand} ${listing.model}`);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: searchResults, loading } = useApi(() => {
    if (!debouncedSearch) return null;
    const [make, model, ...trimParts] = debouncedSearch.split(' ');
    return getTrims({ make, model, trim_name: trimParts.join(' ') });
  }, { lazy: !isOpen || !!trimMaster, dependencies: [debouncedSearch] });

  const handleCreateAlias = async () => {
    if (!aliasValue || !selectedTrimMaster) return;
    setSubmitting(true);
    try {
      await createAlias({
        trim_master_id: selectedTrimMaster.id,
        alias: aliasValue
      });
      showToast('Alias created successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create alias.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Alias for Raw Trim?">
      <p>Would you like to create an alias to improve future automatic matching?</p>

      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Raw Trim (as Alias)</label>
        <input
          type="text"
          className="input"
          value={aliasValue}
          onChange={(e) => setAliasValue(e.target.value)}
        />
        <small>Original: "{listing.trim}"</small>
      </div>

      <div className="form-group">
        <label>Master Trim</label>
        {selectedTrimMaster ? (
          <div className="card" style={{ background: 'var(--primary-bg)'}}>
            <p><strong>{selectedTrimMaster.make} {selectedTrimMaster.model}</strong></p>
            <p>{selectedTrimMaster.trim_name}</p>
          </div>
        ) : (
          <div>
            <input
              type="text"
              className="input"
              placeholder="Search for master trim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <Spinner />}
            {searchResults && (
              <ul style={{ listStyle: 'none', maxHeight: '150px', overflowY: 'auto' }}>
                {searchResults.map(trim => (
                  <li key={trim.id} onClick={() => setSelectedTrimMaster(trim)} style={{ padding: '0.5rem', cursor: 'pointer' }}>
                    {trim.make} {trim.model} - {trim.trim_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onClose}>No, thanks</button>
        <button
          className="btn btn-primary"
          onClick={handleCreateAlias}
          disabled={!aliasValue || !selectedTrimMaster || submitting}
        >
          {submitting ? 'Creating...' : 'Yes, create alias'}
        </button>
      </div>
    </Modal>
  );
}

export default AliasPromptModal;
