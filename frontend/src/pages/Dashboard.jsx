// FILE: src/pages/Dashboard.jsx
import React from 'react';
import useApi from '../hooks/useApi';
import { getStats } from '../lib/api';
import Spinner from '../components/ui/Spinner';
import ProcessNowCard from '../components/ProcessNowCard';

function Dashboard() {
  const { data: stats, loading, error, request: fetchStats } = useApi(getStats);

  const StatCard = ({ title, value, color }) => (
    <div className="card" style={{ borderColor: color, borderLeftWidth: '5px' }}>
      <h3 style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {loading ? '...' : new Intl.NumberFormat().format(value || 0)}
      </p>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of the listing normalization pipeline.</p>
      </div>

      {loading && <Spinner />}
      {error && <div className="error-state">Error fetching stats: {error.message}. <button className="btn btn-secondary btn-sm" onClick={fetchStats}>Retry</button></div>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard title="Total Listings" value={stats.total} color="var(--info-color)" />
          <StatCard title="Processed" value={stats.processed} color="var(--accent)" />
          <StatCard title="Needs Review" value={stats.needs_review} color="var(--warning-color)" />
        </div>
      )}

      <ProcessNowCard />
    </div>
  );
}

export default Dashboard;
