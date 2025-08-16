// FILE: src/pages/Aliases.jsx
import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../hooks/useApi';
import { getAliases, deleteAlias, createAlias, getTrims } from '../lib/api';
import useDebounce from '../hooks/useDebounce';
import DataTable from '../components/DataTable';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../lib/utils';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';


function AliasCreateForm({ onCancel, onSuccess }) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTrim, setSelectedTrim] = useState(null);
  const [alias, setAlias] = useState('');
  const [formError, setFormError] = useState('');

  const { data: trims, loading } = useApi(() => getTrims({ make: debouncedSearchTerm.split(' ')[0] || '', model: debouncedSearchTerm.split(' ')[1] || '', trim_name: debouncedSearchTerm.split(' ')[2] || '' }), {
    lazy: false,
    dependencies: [debouncedSearchTerm]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrim || !alias) {
      setFormError('Please select a trim and provide an alias.');
      return;
    }
    setFormError('');
    try {
      await createAlias({ trim_master_id: selectedTrim.id, alias: alias.toLowerCase() });
      showToast('Alias created successfully!', 'success');
      onSuccess();
    } catch (err) {
      setFormError(err.message);
      showToast(err.message, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Search and Select Master Trim</label>
        <input
            type="text"
            className="input"
            placeholder="Search by make, model, trim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        {selectedTrim && (
          <div style={{ background: 'var(--primary-bg)', padding: '0.5rem 1rem', borderRadius: '4px', marginTop: '0.5rem' }}>
            Selected: <strong>{selectedTrim.make} {selectedTrim.model} - {selectedTrim.trim_name}</strong>
          </div>
        )}
      </div>

      {loading && <Spinner />}
      {trims && trims.length > 0 && !selectedTrim && (
        <ul style={{ listStyle: 'none', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          {trims.map(trim => (
            <li key={trim.id} onClick={() => setSelectedTrim(trim)} style={{ padding: '0.5rem', cursor: 'pointer' }}>
              {trim.make} {trim.model} - {trim.trim_name}
            </li>
          ))}
        </ul>
      )}

      <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Alias Name</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., sport tech"
            value={alias}
            onChange={e => setAlias(e.target.value)}
            required
          />
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={!selectedTrim || !alias}>Create Alias</button>
      </div>
    </form>
  )
}


function Aliases() {
  const [filters, setFilters] = useState({ make: '', model: '' });
  const debouncedFilters = useDebounce(filters, 300);
  const { data: aliases, loading, error, request: fetchAliases } = useApi(getAliases, { lazy: true });
  const { showToast } = useToast();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [aliasToDelete, setAliasToDelete] = useState(null);

  useEffect(() => {
    fetchAliases(debouncedFilters);
  }, [debouncedFilters, fetchAliases]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!aliasToDelete) return;
    try {
      await deleteAlias(aliasToDelete.id);
      showToast('Alias deleted successfully', 'success');
      setAliasToDelete(null);
      fetchAliases(filters);
    } catch(err) {
      showToast(err.message || 'Failed to delete alias', 'error');
      setAliasToDelete(null);
    }
  };

  const onCreateSuccess = () => {
    setCreateModalOpen(false);
    fetchAliases(filters);
  };


  const columns = useMemo(() => [
    { key: 'alias', header: 'Alias', sortable: true },
    {
      key: 'trim',
      header: 'Master Trim',
      sortable: true,
      render: (row) => `${row.make} ${row.model} - ${row.trim_name}`
    },
    { key: 'created_at', header: 'Created At', sortable: true, render: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button onClick={() => setAliasToDelete(row)} className="btn btn-danger btn-sm">Delete</button>
      )
    }
  ], []);

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h1>Manage Aliases</h1>
            <p>View and manage alternative names for master trims.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>Add New Alias</button>
      </div>

      <div className="filters-bar" style={{ padding: '1rem' }}>
        <input type="text" name="make" placeholder="Filter by Make..." value={filters.make} onChange={handleFilterChange} className="input" style={{ width: '250px' }}/>
        <input type="text" name="model" placeholder="Filter by Model..." value={filters.model} onChange={handleFilterChange} className="input" style={{ width: '250px' }}/>
      </div>

      <DataTable
        columns={columns}
        data={aliases || []}
        loading={loading}
        error={error}
        onRetry={() => fetchAliases(filters)}
      />

      {isCreateModalOpen && (
        <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Alias">
          <AliasCreateForm onCancel={() => setCreateModalOpen(false)} onSuccess={onCreateSuccess} />
        </Modal>
      )}

      {aliasToDelete && (
        <ConfirmDialog
          isOpen={!!aliasToDelete}
          title="Delete Alias"
          onConfirm={handleDelete}
          onCancel={() => setAliasToDelete(null)}
        >
          Are you sure you want to delete the alias "<strong>{aliasToDelete.alias}</strong>"? This action cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  );
}

export default Aliases;
