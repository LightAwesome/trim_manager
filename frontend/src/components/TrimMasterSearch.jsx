// FILE: src/components/TrimMasterSearch.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../lib/api';
import { debounce } from '../lib/utils';
import Spinner from './ui/Spinner';

function TrimMasterSearch({ onSelect, selectedTrim }) {
  const [search, setSearch] = useState('');
  const [params, setParams] = useState({ make: '', model: '' });
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, loading, error, refetch } = useApi('/trims', params, 300);

  const handleSearch = debounce((value) => {
    if (value.length > 2) {
      const parts = value.split(' ');
      setParams({ make: parts[0] || '', model: parts.slice(1).join(' ') || '' });
    } else {
      setParams({ make: '', model: '' });
    }
  }, 300);

  useEffect(() => {
    handleSearch(search);
    return () => handleSearch.cancel();
  }, [search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by make, model..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <Spinner />}
      {!loading && search.length > 2 && (
        <div className="search-results">
          {searchResults?.length > 0 ? (
            searchResults.map((trim) => (
              <div
                key={trim.id}
                className="search-result-item"
                onClick={() => {
                  onSelect(trim);
                  setSearch(`${trim.make} ${trim.model} ${trim.trim_name}`);
                }}
              >
                <p>{trim.make} {trim.model} ({trim.trim_name})</p>
                <small>{trim.year_start}-{trim.year_end}</small>
              </div>
            ))
          ) : (
            <div className="search-result-item">No trims found.</div>
          )}
        </div>
      )}
      {selectedTrim && (
        <div className="selected-trim-display">
          <p>
            Selected: <strong>{selectedTrim.make} {selectedTrim.model} ({selectedTrim.trim_name})</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default TrimMasterSearch;
