// FILE: src/components/DataTable.jsx
import React, { useState, useMemo } from 'react';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import Pagination from './Pagination';

function DataTable({ columns, data, loading, error, onRetry, onRowClick, highlightRow }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Client-side pagination limit

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>;
  if (error) return (
    <div className="error-state card">
      <p>Error loading data: {error.message}</p>
      <button className="btn btn-secondary" onClick={onRetry}>Retry</button>
    </div>
  );
  if (data.length === 0) return <EmptyState message="No data available to display." />;

  return (
    <>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => col.sortable && requestSort(col.key)}>
                  {col.header}
                  {col.sortable && sortConfig.key === col.key && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.id || row.ad_id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={`${onRowClick ? 'clickable-row' : ''} ${highlightRow && highlightRow(row) ? 'highlighted-row' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

export default DataTable;
