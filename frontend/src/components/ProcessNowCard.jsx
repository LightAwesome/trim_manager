// FILE: src/components/ProcessNowCard.jsx
import React, { useState } from 'react';
import { processListings } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import Spinner from './ui/Spinner';

function ProcessNowCard() {
  const [limit, setLimit] = useState(500);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleProcess = async () => {
    if (!limit || limit <= 0) {
      showToast('Please enter a valid limit greater than 0.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await processListings(limit);
      const summary = `Processed: ${result.processed}, Exact: ${result.exact_matches}, Fuzzy: ${result.fuzzy_matches}, Unmatched: ${result.unmatched}, LLM : ${result.llm_matches}`;
      showToast(summary, 'success');
    } catch (error) {
      showToast(error.message || 'Processing failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      // Reset to default if cleared
      setLimit(500);
    } else {
      const parsed = parseInt(val, 10);
      setLimit(isNaN(parsed) ? 500 : parsed);
    }
  };

  return (
    <div className="card">
      <h3>Process New Listings</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Run the normalization pipeline on unprocessed listings.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="limit" style={{ marginBottom: '0.25rem' }}>Limit</label>
          <input
            id="limit"
            type="number"
            className="input"
            min={1}
            value={limit}
            onChange={handleLimitChange}
            style={{ width: '120px' }}
          />
        </div>
        <button
          onClick={handleProcess}
          className="btn btn-primary"
          disabled={loading}
          style={{ alignSelf: 'flex-end' }}
        >
          {loading ? <><Spinner size="sm" /> Processing...</> : 'Process Now'}
        </button>
      </div>
    </div>
  );
}

export default ProcessNowCard;
