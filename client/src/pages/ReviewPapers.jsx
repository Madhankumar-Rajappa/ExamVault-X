import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';

const ReviewPapers = () => {
  const [papers, setPapers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Decision Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingPapers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/question-papers', {
        params: {
          page,
          limit: 10,
          status: 'under_review',
        },
      });
      setPapers(response.data.questionPapers);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending question papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPapers();
  }, [page]);

  const handleOpenDecision = (paper, type) => {
    setSelectedPaper(paper);
    setActionType(type);
    setReviewComment('');
    setModalOpen(true);
  };

  const handleProcessDecision = async (e) => {
    e.preventDefault();
    if (actionType === 'reject' && !reviewComment.trim()) {
      setError('Please provide a reason or comment for rejecting the paper.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const endpoint =
        actionType === 'approve'
          ? `/question-papers/${selectedPaper._id}/approve`
          : `/question-papers/${selectedPaper._id}/reject`;

      await api.patch(endpoint, {
        reviewComment: reviewComment.trim(),
      });

      setSuccess(
        `Question paper successfully ${actionType === 'approve' ? 'approved' : 'rejected'}.`
      );
      setModalOpen(false);
      fetchPendingPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Question Papers Awaiting Review</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Evaluate submitted question papers, check quality standards, and approve or reject with comments.
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

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title / Subject</th>
              <th>Exam Name</th>
              <th>Uploaded By</th>
              <th>Exam Date</th>
              <th>Status</th>
              <th>Review Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-state">Loading pending reviews...</td>
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
                    {new Date(paper.examDate).toLocaleDateString()}
                  </td>
                  <td><StatusBadge status={paper.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Download & Inspect PDF"
                        onClick={() => handleDownload(paper)}
                      >
                        <Download size={14} /> View PDF
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        title="Approve Paper"
                        onClick={() => handleOpenDecision(paper, 'approve')}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Reject Paper"
                        onClick={() => handleOpenDecision(paper, 'reject')}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No question papers are currently awaiting review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={actionType === 'approve' ? 'Approve Question Paper' : 'Reject Question Paper'}
      >
        <form onSubmit={handleProcessDecision}>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Selected Paper: <strong>{selectedPaper?.title}</strong> ({selectedPaper?.subject})
          </p>

          <div className="form-group">
            <label className="form-label">
              Review Comments {actionType === 'reject' && '*'}
            </label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder={
                actionType === 'approve'
                  ? 'Optional review notes or feedback...'
                  : 'Specify reason for rejection (e.g. syllabus mismatch, formatting error)...'
              }
              required={actionType === 'reject'}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
              disabled={submitting}
            >
              {submitting
                ? 'Processing...'
                : actionType === 'approve'
                ? 'Confirm Approval'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewPapers;
