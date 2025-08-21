import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useApi from '../hooks/useApi';
import {
  getUnprocessedListings,
  markListingAsReviewed,
  reprocessListing
} from '../lib/api';
import DataTable from '../components/DataTable';
import Badge from '../components/ui/Badge';
import CandidatesDrawer from '../components/CandidatesDrawer';
import AssignTrimModal from '../components/AssignTrimModal';
import AliasPromptModal from '../components/AliasPromptModal';
import { useToast } from '../contexts/ToastContext';

function Unprocessed() {
  const [limit] = useState(50);

  const {
    data: listings,
    loading,
    error,
    request: fetchListings
  } = useApi(getUnprocessedListings, { lazy: true });

  const { showToast } = useToast();

  const [activeListing, setActiveListing] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isCandidatesDrawerOpen, setCandidatesDrawerOpen] = useState(false);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [aliasPromptData, setAliasPromptData] = useState(null);

  // Fetch once on mount or when limit changes
  useEffect(() => {
    fetchListings({ limit }).catch(() => {});
  }, [limit, fetchListings]);

  const handleShowCandidates = (listing) => {
    setActiveListing(listing);
    setCandidatesDrawerOpen(true);
  };

  const handleOpenAssignModal = (listing) => {
    setActiveListing(listing);
    setAssignModalOpen(true);
  };

  const handleReprocess = async (adId) => {
    try {
      await reprocessListing(adId);
      showToast('Successfully reprocessed listing.', 'success');
      fetchListings({ limit });
    } catch (err) {
      showToast(err.message || 'Failed to reprocess listing.', 'error');
    }
  };

  const handleMarkReviewed = async (adId) => {
    try {
      await markListingAsReviewed(adId);
      showToast('Marked as reviewed.', 'info');
      fetchListings({ limit });
    } catch (err) {
      showToast(err.message || 'Failed to mark as reviewed.', 'error');
    }
  };

  const onAssignSuccess = useCallback(
    (assignedTrimMaster) => {
      setAssignModalOpen(false);
      setSelectedCandidate(null);
      showToast(`Trim assigned successfully.`, 'success');
      if (assignedTrimMaster && activeListing) {
        setAliasPromptData({
          listing: activeListing,
          trimMaster: assignedTrimMaster
        });
      }
      setActiveListing(null);
      fetchListings({ limit });
    },
    [activeListing, fetchListings, showToast, limit]
  );

  const columns = useMemo(
    () => [
      { key: 'ad_id', header: 'Ad ID', sortable: true },
      { key: 'brand', header: 'Brand', sortable: true },
      { key: 'model', header: 'Model', sortable: true },
      { key: 'year', header: 'Year', sortable: true },
      { key: 'trim', header: 'Raw Trim', sortable: true },
      {
        key: 'needs_review',
        header: 'Status',
        render: (row) =>
          row.needs_review && <Badge type="review">Needs Review</Badge>
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="table-actions">
            <button
              onClick={() => handleOpenAssignModal(row)}
              className="btn btn-primary btn-sm"
            >
              Assign
            </button>
            <button
              onClick={() => handleShowCandidates(row)}
              className="btn btn-secondary btn-sm"
            >
              Candidates
            </button>
            <button
              onClick={() => handleReprocess(row.ad_id)}
              className="btn btn-secondary btn-sm"
            >
              Reprocess
            </button>
            <button
              onClick={() => handleMarkReviewed(row.ad_id)}
              className="btn btn-secondary btn-sm"
            >
              Reviewed
            </button>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1>Unprocessed Listings</h1>
        <p>Review listings that are new or flagged for manual review.</p>
      </div>

      <DataTable
        columns={columns}
        data={listings || []}
        loading={loading}
        error={error}
        onRetry={() => fetchListings({ limit })}
        highlightRow={(row) => row.needs_review}
      />

      {activeListing && (
        <CandidatesDrawer
          listing={activeListing}
          isOpen={isCandidatesDrawerOpen}
          onClose={() => setCandidatesDrawerOpen(false)}
          onAssign={(candidateTrim) => {
            setCandidatesDrawerOpen(false);
            setSelectedCandidate(candidateTrim);
            setAssignModalOpen(true);
          }}
        />
      )}

      {isAssignModalOpen && activeListing && (
        <AssignTrimModal
          listing={activeListing}
          selectedCandidate={selectedCandidate}
          isOpen={isAssignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setActiveListing(null);
            setSelectedCandidate(null);
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
    </div>
  );
}

export default Unprocessed;
