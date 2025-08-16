import React, { useState, useMemo, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';
import {
  getProcessedListings,
  markListingAsReviewed,
  reprocessListing,
  getListingFullDetails,
} from '../lib/api';
import useDebounce from '../hooks/useDebounce';
import DataTable from '../components/DataTable';
import FiltersBar from '../components/FiltersBar';
import Badge from '../components/ui/Badge';
import { formatDate } from '../lib/utils';
import AssignTrimModal from '../components/AssignTrimModal';
import AliasPromptModal from '../components/AliasPromptModal';
import { useToast } from '../contexts/ToastContext';

const INITIAL_FILTERS = {
  brand: '',
  model: '',
  assignment_method: '',
  min_conf: 0,
  max_conf: 1,
  limit: 50,
};

// Improved Details Modal Component
const ListingDetailsModal = ({ isOpen, onClose, detailsData, loading }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay-fixed"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        className="modal-content-improved"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5em', fontWeight: '600' }}>
            Listing Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#666', margin: 0 }}>Loading listing details...</p>
            </div>
          ) : detailsData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Base Listing Section */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '1.2em',
                  fontWeight: '600',
                  color: '#333',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #007bff'
                }}>
                  Base Listing Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  {Object.entries(detailsData.listing).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <strong style={{
                        color: '#495057',
                        fontSize: '0.9em',
                        textTransform: 'capitalize',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {key.replace(/_/g, ' ')}:
                      </strong>
                      <span style={{
                        color: '#212529',
                        wordBreak: 'break-word'
                      }}>
                        {value !== null && value !== undefined ? String(value) : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Website Details Section */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '1.2em',
                  fontWeight: '600',
                  color: '#333',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #28a745'
                }}>
                  Website Details
                </h3>
                {detailsData.details && Object.keys(detailsData.details).length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '12px'
                  }}>
                    {Object.entries(detailsData.details).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <strong style={{
                          color: '#495057',
                          fontSize: '0.9em',
                          textTransform: 'capitalize',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {key.replace(/_/g, ' ')}:
                        </strong>
                        <span style={{
                          color: '#212529',
                          wordBreak: 'break-word'
                        }}>
                          {value !== null && value !== undefined ? String(value) : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    No additional website details available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#dc3545'
            }}>
              Failed to load listing details
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Add spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

function Processed() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const debouncedFilters = useDebounce(filters, 300);
  const { showToast } = useToast();
  const { data, loading, error, request: fetchListings } = useApi(getProcessedListings, { lazy: true });

  const [activeListing, setActiveListing] = useState(null);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [aliasPromptData, setAliasPromptData] = useState(null);
  const [detailsModalData, setDetailsModalData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch listings when filters change
 useEffect(() => {
  const params = {
    ...debouncedFilters,
    // Use 'make' directly from the brand filter
    make: debouncedFilters.brand || undefined,
    // Use 'model' directly from the model filter
    model: debouncedFilters.model || undefined,
  };

  // The previous logic was causing the issue, so remove it
  // if (params.brand) {
  //   params.make = params.brand;
  //   delete params.brand;
  // }
  // You no longer need to delete params.brand as you're not using it.

  // Remove empty or null parameters
  Object.keys(params).forEach((key) => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key];
    }
  });

  fetchListings(params);
}, [debouncedFilters, fetchListings]);

  // ---------------- Actions ----------------
  const handleOpenAssignModal = (listing) => {
    setActiveListing(listing);
    setAssignModalOpen(true);
  };

  const handleReprocess = async (adId) => {
    try {
      await reprocessListing(adId);
      showToast('Successfully reprocessed listing.', 'success');
      fetchListings(filters);
    } catch (err) {
      showToast(err.message || 'Failed to reprocess listing.', 'error');
    }
  };

  const handleMarkReviewed = async (adId) => {
    try {
      await markListingAsReviewed(adId);
      showToast('Marked as reviewed.', 'info');
      fetchListings(filters);
    } catch (err) {
      showToast(err.message || 'Failed to mark as reviewed.', 'error');
    }
  };

  const handleOpenDetailsModal = async (adId) => {
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);
    setDetailsModalData(null);

    try {
      const data = await getListingFullDetails(adId);
      setDetailsModalData(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch listing details.', 'error');
      setIsDetailsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsModalData(null);
    setDetailsLoading(false);
  };

  const onAssignSuccess = useCallback(
    (assignedTrimMaster) => {
      setAssignModalOpen(false);
      showToast('Trim assigned successfully.', 'success');

      if (assignedTrimMaster && activeListing) {
        setAliasPromptData({ listing: activeListing, trimMaster: assignedTrimMaster });
      }

      setActiveListing(null);
      fetchListings(filters);
    },
    [activeListing, fetchListings, showToast, filters]
  );

  // ---------------- Table Columns ----------------
  const columns = useMemo(
    () => [
      { key: 'ad_id', header: 'Ad ID', sortable: true },
      { key: 'brand', header: 'Brand', sortable: true },
      { key: 'model', header: 'Model', sortable: true },
      { key: 'trim', header: 'Raw Trim', sortable: true },
      { key: 'normalized_trim', header: 'Normalized', sortable: true },
      {
        key: 'confidence',
        header: 'Conf.',
        sortable: true,
        render: (row) => (row.confidence !== null ? `${(row.confidence * 100).toFixed(0)}%` : 'N/A'),
      },
      {
        key: 'method',
        header: 'Method',
        sortable: true,
        render: (row) => <Badge type={row.method}>{row.method}</Badge>,
      },
      {
        key: 'needs_review',
        header: 'Status',
        render: (row) => row.needs_review && <Badge type="review">Needs Review</Badge>,
      },
      {
        key: 'processed_at',
        header: 'Processed At',
        sortable: true,
        render: (row) => formatDate(row.processed_at),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="table-actions">
            <button onClick={() => handleOpenAssignModal(row)} className="btn btn-primary btn-sm">
              Assign
            </button>
            <button onClick={() => handleReprocess(row.ad_id)} className="btn btn-secondary btn-sm">
              Reprocess
            </button>
            {row.needs_review && (
              <button onClick={() => handleMarkReviewed(row.ad_id)} className="btn btn-secondary btn-sm">
                Reviewed
              </button>
            )}
            <button onClick={() => handleOpenDetailsModal(row.ad_id)} className="btn btn-info btn-sm">
              Details
            </button>
          </div>
        ),
      },
    ],
    [onAssignSuccess]
  );

  // ---------------- Render ----------------
  return (
    <div className="container">
      <div className="page-header">
        <h1>Processed Listings</h1>
        <p>Search, filter, and review previously processed listings.</p>
      </div>

      <FiltersBar filters={filters} onFiltersChange={setFilters} />

      <DataTable
        columns={columns}
        data={data || []}
        loading={loading}
        error={error}
        onRetry={() => fetchListings(filters)}
        highlightRow={(row) => row.needs_review}
      />

      {isAssignModalOpen && activeListing && (
        <AssignTrimModal
          listing={activeListing}
          isOpen={isAssignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setActiveListing(null);
          }}
          onSuccess={onAssignSuccess}
        />
      )}

      {aliasPromptData && (
        <AliasPromptModal
          isOpen={true}
          listing={aliasPromptData.listing}
          trimMaster={aliasPromptData.trimMaster}
          onClose={() => setAliasPromptData(null)}
        />
      )}

      {/* Improved Details Modal */}
      <ListingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        detailsData={detailsModalData}
        loading={detailsLoading}
      />
    </div>
  );
}

export default Processed;
