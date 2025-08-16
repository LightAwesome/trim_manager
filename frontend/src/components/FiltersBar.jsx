// FILE: src/components/FiltersBar.jsx
import React from 'react';
import { clamp } from '../lib/utils';

function FiltersBar({ filters, onFiltersChange }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    onFiltersChange(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleConfidenceChange = (e) => {
    const { name, value } = e.target;
    const clampedValue = clamp(parseFloat(value) || 0, 0, 1);
    onFiltersChange(prev => ({ ...prev, [name]: clampedValue }));
  }

  return (
    <div className="filters-bar">
      <div className="form-group">
        <label>Brand/Make</label>
        <input
          type="text"
          name="brand"
          className="input"
          placeholder="e.g. Toyota"
          value={filters.brand}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Model</label>
        <input
          type="text"
          name="model"
          className="input"
          placeholder="e.g. Camry"
          value={filters.model}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Assignment Method</label>
        <select
          name="assignment_method"
          className="select"
          value={filters.assignment_method}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="exact">Exact</option>
          <option value="fuzzy">Fuzzy</option>
          <option value="manual">Manual</option>
          <option value="unmatched">Unmatched</option>
        </select>
      </div>
      <div className="form-group">
        <label>Min Confidence</label>
        <input
          type="number"
          name="min_conf"
          className="input"
          value={filters.min_conf}
          onChange={handleConfidenceChange}
          step="0.01" min="0" max="1"
        />
      </div>
      <div className="form-group">
        <label>Max Confidence</label>
        <input
          type="number"
          name="max_conf"
          className="input"
          value={filters.max_conf}
          onChange={handleConfidenceChange}
          step="0.01" min="0" max="1"
        />
      </div>
    </div>
  );
}

export default FiltersBar;
