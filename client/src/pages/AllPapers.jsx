import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
  Files,
  Search,
  Calendar,
  Send,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const AllPapers = () => {
  const [papers, setPapers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [releaseDate, setReleaseDate] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const fetchPapers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/question-papers', {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setPapers(response.data.questionPapers);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch question papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPapers();
  };

  const handleOpenSchedule = (paper) => {
    setSelectedPaper(paper);
    setReleaseDate('');
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!releaseDate) {
      setError('Please select a valid release date and time.');
      return;
    }

    setScheduling(true);
    setError('');

    try {
      await api.patch(`/question-papers/${selectedPaper._id}/schedule`, {
        releaseDate,
      });

      setSuccess(`Question paper scheduled for release on ${new Date(releaseDate).toLocaleString()}.`);
      setScheduleModalOpen(false);
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule question paper.');
    } finally {
      setScheduling(false);
    }
  };

  const handleReleaseNow = async (paperId) => {
    if (!window.confirm('Release this question paper to students immediately?')) return;
    try {
      await api.patch(`/question-papers/${paperId}/release`);
      setSuccess('Question paper released to students successfully!');
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release question paper.');
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (!window.confirm('Are you sure you want to soft delete this paper?')) return;
    try {
      await api.delete(`/question-papers/${paperId}`);
      setSuccess('Question paper deleted successfully.');
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question paper.');
    }
  };

  const handleDownload = async (paper) => {
    try {
      const response = await api.get(`/question-papers/${paper._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', paper.fileName || 'question-paper.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download question paper.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>All Institution Question Papers</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Overview of all question papers across workflow stages, scheduling, and publication controls.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, subject, or exam name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="released">Released</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title / Subject</th>
              <th>Exam Name</th>
              <th>Uploaded By</th>
              <th>Release Date</th>
              <th>Status</th>
              <th>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-state">Loading question papers...</td>
              </tr>
            ) : papers && papers.length > 0 ? (
              papers.map((paper) => (
                <tr key={paper._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{paper.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{paper.subject}</div>
                  </td>
                  <td>{paper.examName}</td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>{paper.uploadedBy?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{paper.uploadedBy?.email}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {paper.releaseDate
                      ? new Date(paper.releaseDate).toLocaleString()
                      : '-'}
                  </td>
                  <td><StatusBadge status={paper.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Download Copy"
                        onClick={() => handleDownload(paper)}
                      >
                        <Download size={14} />
                      </button>

                      {paper.status === 'approved' && (
                        <button
                          className="btn btn-primary btn-sm"
                          title="Schedule Release Time"
                          onClick={() => handleOpenSchedule(paper)}
                        >
                          <Calendar size={14} /> Schedule
                        </button>
                      )}

                      {paper.status === 'scheduled' && (
                        <button
                          className="btn btn-success btn-sm"
                          title="Release Now"
                          onClick={() => handleReleaseNow(paper._id)}
                        >
                          <Send size={14} /> Release Now
                        </button>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        title="Soft Delete"
                        onClick={() => handleDeletePaper(paper._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No question papers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Schedule Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Question Paper Release"
      >
        <form onSubmit={handleSaveSchedule}>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Schedule Release for: <strong>{selectedPaper?.title}</strong>
          </p>

          <div className="form-group">
            <label className="form-label">Publication Release Date & Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              required
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Students will not be able to view or download this paper before the set release time.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={scheduling}>
              {scheduling ? 'Scheduling...' : 'Set Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AllPapers;
