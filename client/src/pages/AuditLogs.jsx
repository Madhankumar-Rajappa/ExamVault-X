import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
  ShieldCheck,
  Eye,
  AlertCircle,
  Clock,
  User,
  Monitor,
  Globe,
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/audit-logs', {
        params: {
          page,
          limit: 15,
          action: actionFilter || undefined,
        },
      });
      setLogs(response.data.auditLogs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter]);

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>System Security Audit Logs</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Complete, immutable audit history of user registrations, logins, status updates, workflow state transitions, and file downloads.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Filter Action Type:
        </span>
        <select
          className="form-select"
          style={{ width: '280px' }}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Action Events</option>
          <option value="USER_REGISTERED">USER_REGISTERED</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="USER_ACTIVATED">USER_ACTIVATED</option>
          <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
          <option value="USER_ROLE_UPDATED">USER_ROLE_UPDATED</option>
          <option value="QUESTION_PAPER_CREATED">QUESTION_PAPER_CREATED</option>
          <option value="QUESTION_PAPER_SUBMITTED_FOR_REVIEW">QUESTION_PAPER_SUBMITTED_FOR_REVIEW</option>
          <option value="QUESTION_PAPER_APPROVED">QUESTION_PAPER_APPROVED</option>
          <option value="QUESTION_PAPER_REJECTED">QUESTION_PAPER_REJECTED</option>
          <option value="QUESTION_PAPER_SCHEDULED">QUESTION_PAPER_SCHEDULED</option>
          <option value="QUESTION_PAPER_RELEASED">QUESTION_PAPER_RELEASED</option>
          <option value="QUESTION_PAPER_DOWNLOADED">QUESTION_PAPER_DOWNLOADED</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action Event</th>
              <th>Resource Type</th>
              <th>Details</th>
              <th>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-state">Loading security audit trail...</td>
              </tr>
            ) : logs && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.user?.name || 'Unknown User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user?.email}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        color: 'var(--primary)',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.resourceType}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details || '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenDetail(log)}
                    >
                      <Eye size={14} /> Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No security audit logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Audit Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Audit Log Detail Inspection"
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Log Entry ID:</span>
              <code>{selectedLog._id}</code>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Action Event:</span>
              <strong style={{ color: 'var(--primary)' }}>{selectedLog.action}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>User Account:</span>
              <strong>{selectedLog.user?.name}</strong> ({selectedLog.user?.email}) - Role: {selectedLog.user?.role}
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Target Resource:</span>
              {selectedLog.resourceType} (ID: {selectedLog.resourceId || 'N/A'})
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>IP Address & Client User Agent:</span>
              <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <div><Globe size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> IP: {selectedLog.ipAddress || '127.0.0.1'}</div>
                <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}><Monitor size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Agent: {selectedLog.userAgent || 'Browser Client'}</div>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Activity Details:</span>
              <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}>
                {selectedLog.details || 'No details specified.'}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Created Timestamp:</span>
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {new Date(selectedLog.createdAt).toUTCString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
