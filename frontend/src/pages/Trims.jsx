// FILE: src/pages/Trims.jsx
import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../hooks/useApi';
import { getTrims, createTrim, getAliases, createAlias } from '../lib/api';
import useDebounce from '../hooks/useDebounce';
import DataTable from '../components/DataTable';
import { useToast } from '../contexts/ToastContext';
import Spinner from '../components/ui/Spinner';

// Details Drawer Component
const TrimDetailsDrawer = ({ trim, isOpen, onClose }) => {
  if (!trim) return null;
  const { data: aliases, loading, error, request: fetchAliases } = useApi(getAliases, { lazy: true });
  const [newAlias, setNewAlias] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (trim && isOpen) {
      fetchAliases({ make: trim.make, model: trim.model });
    }
  }, [trim, isOpen, fetchAliases]);

  const trimAliases = useMemo(() => {
    if (!aliases) return [];
    return aliases.filter(a => a.trim_master_id === trim.id);
  }, [aliases, trim.id]);

  const handleAddAlias = async (e) => {
    e.preventDefault();
    if (!newAlias.trim()) return;
    try {
      await createAlias({ trim_master_id: trim.id, alias: newAlias });
      showToast('Alias added successfully!', 'success');
      setNewAlias('');
      fetchAliases({ make: trim.make, model: trim.model });
    } catch (err) {
      showToast(err.message || 'Failed to add alias.', 'error');
    }
  };

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>{trim.trim_name}</h3>
        <button onClick={onClose} className="modal-close-btn">&times;</button>
      </div>
      <div className="drawer-content">
        <p><strong>Make:</strong> {trim.make}</p>
        <p><strong>Model:</strong> {trim.model}</p>
        <p><strong>Years:</strong> {trim.year_start || 'N/A'} - {trim.year_end || 'Present'}</p>
        <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
        <h4>Associated Aliases</h4>
        {loading && <Spinner />}
        {error && <p>Error loading aliases.</p>}
        {aliases && trimAliases.length === 0 && <p>No aliases found for this trim.</p>}
        <ul style={{ listStyle: 'none', padding: '0', maxHeight: '200px', overflowY: 'auto' }}>
          {trimAliases.map(alias => <li key={alias.id} style={{ background: 'var(--primary-bg)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>{alias.alias}</li>)}
        </ul>

        <form onSubmit={handleAddAlias} style={{ marginTop: '1.5rem' }}>
          <h4>Add New Alias</h4>
          <div className="form-group">
            <input
              type="text"
              className="input"
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="Enter new alias"
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Alias</button>
        </form>
      </div>
    </div>
  );
};


function Trims() {
  const [filters, setFilters] = useState({ make: '', model: '', skip: 0, limit: 10000 });
  const debouncedFilters = useDebounce(filters, 300);
  const { data: trims, loading, error, request: fetchTrims } = useApi(getTrims, { lazy: true });
  const { showToast } = useToast();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedTrim, setSelectedTrim] = useState(null);
  const [newTrim, setNewTrim] = useState({ make: '', model: '', trim_name: '', year_start: '', year_end: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTrims(debouncedFilters);
  }, [debouncedFilters, fetchTrims]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, skip: 0 }));
  };

  const handleRowClick = (trim) => {
    setSelectedTrim(trim);
    setDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrim(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTrim = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newTrim.make || !newTrim.model || !newTrim.trim_name) {
      setFormError('Make, Model, and Trim Name are required.');
      return;
    }
    try {
      const payload = {
          ...newTrim,
          year_start: newTrim.year_start ? parseInt(newTrim.year_start) : null,
          year_end: newTrim.year_end ? parseInt(newTrim.year_end) : null,
      };
      await createTrim(payload);
      showToast('Trim created successfully!', 'success');
      setNewTrim({ make: '', model: '', trim_name: '', year_start: '', year_end: '' });
      fetchTrims(filters);
    } catch (err) {
      setFormError(err.message || 'Failed to create trim.');
      showToast(err.message, 'error');
    }
  };


  const columns = useMemo(() => [
    { key: 'make', header: 'Make/Brand', sortable: true },
    { key: 'model', header: 'Model', sortable: true },
    { key: 'trim_name', header: 'Trim Name', sortable: true },
    { key: 'year_start', header: 'Year Start', sortable: true },
    { key: 'year_end', header: 'Year End', sortable: true },
  ], []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Manage Trims (TrimMaster)</h1>
        <p>The canonical source of truth for all vehicle trims.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Create New Trim</h3>
        <form onSubmit={handleCreateTrim} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label htmlFor="make">Make/Brand</label>
            <input type="text" id="make" name="make" value={newTrim.make} onChange={handleInputChange} className="input" required />
          </div>
          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input type="text" id="model" name="model" value={newTrim.model} onChange={handleInputChange} className="input" required />
          </div>
          <div className="form-group">
            <label htmlFor="trim_name">Trim Name</label>
            <input type="text" id="trim_name" name="trim_name" value={newTrim.trim_name} onChange={handleInputChange} className="input" required />
          </div>
          <div className="form-group">
            <label htmlFor="year_start">Year Start</label>
            <input type="number" id="year_start" name="year_start" value={newTrim.year_start} onChange={handleInputChange} className="input" placeholder="e.g. 2020" />
          </div>
          <div className="form-group">
            <label htmlFor="year_end">Year End</label>
            <input type="number" id="year_end" name="year_end" value={newTrim.year_end} onChange={handleInputChange} className="input" placeholder="e.g. 2024" />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
        {formError && <p className="form-error" style={{ marginTop: '1rem' }}>{formError}</p>}
      </div>

      <div className="filters-bar" style={{ padding: '1rem' }}>
        <input type="text" name="make" placeholder="Filter by Make..." value={filters.make} onChange={handleFilterChange} className="input" style={{ width: '250px' }}/>
        <input type="text" name="model" placeholder="Filter by Model..." value={filters.model} onChange={handleFilterChange} className="input" style={{ width: '250px' }}/>
      </div>

      <DataTable
        columns={columns}
        data={trims || []}
        loading={loading}
        error={error}
        onRetry={() => fetchTrims(filters)}
        onRowClick={handleRowClick}
      />

      <TrimDetailsDrawer
        trim={selectedTrim}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default Trims;
