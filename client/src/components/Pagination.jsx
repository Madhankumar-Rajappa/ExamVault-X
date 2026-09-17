import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalRecords, recordsPerPage } = pagination;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginTop: '1rem',
      }}
    >
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Showing {(currentPage - 1) * recordsPerPage + 1} to{' '}
        {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords}{' '}
        entries
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem' }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
