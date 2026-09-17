import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
  FileText,
  PlusCircle,
  Send,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Download,
} from 'lucide-react';

const MyPapers = () => {
  const [papers, setPapers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editExamName, setEditExamName] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Review Comment Modal State
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/question-papers', {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
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

  const handleSubmitReview = async (id) => {
    if (!window.confirm('Submit this draft question paper for review?')) return;
    try {
      await api.patch(`/question-papers/${id}/submit-review`);
      setSuccess('Question paper submitted for review!');
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit paper for review.');
    }
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    try {
      await api.delete(`/question-papers/${id}`);
      setSuccess('Question paper deleted successfully.');
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question paper.');
    }
  };

  const handleOpenEdit = (paper) => {
    setEditingPaper(paper);
    setEditTitle(paper.title);
    setEditSubject(paper.subject);
    setEditExamName(paper.examName);
    setEditExamDate(paper.examDate ? paper.examDate.split('T')[0] : '');
    setEditDescription(paper.description || '');
    setEditFile(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('subject', editSubject);
      formData.append('examName', editExamName);
      formData.append('examDate', editExamDate);
      formData.append('description', editDescription);
      if (editFile) {
        formData.append('questionPaper', editFile);
      }

      await api.patch(`/question-papers/${editingPaper._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Question paper updated successfully.');
      setEditModalOpen(false);
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question paper.');
    } finally {
      setUpdating(false);
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
      setError(err.response?.data?.message || 'Failed to download paper.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>My Uploaded Question Papers</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage draft papers, re-edit rejected submissions, and submit for review.
          </p>
        </div>
        <Link to="/upload-paper" className="btn btn-primary">
          <PlusCircle size={18} /> Upload Paper
        </Link>
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
          Filter Status:
        </span>
        <select
          className="form-select"
          style={{ width: '220px' }}
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

      {/* Papers Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title / Subject</th>
              <th>Exam Name</th>
              <th>Exam Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">Loading question papers...</td>
              </tr>
            ) : papers && papers.length > 0 ? (
              papers.map((paper) => (
                <tr key={paper._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{paper.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{paper.subject}</div>
                  </td>
                  <td>{paper.examName}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(paper.examDate).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusBadge status={paper.status} />
                    {paper.status === 'rejected' && paper.reviewComment && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: '0.5rem', padding: '0.2rem 0.4rem' }}
                        title="View Feedback"
                        onClick={() => {
                          setSelectedPaper(paper);
                          setCommentModalOpen(true);
                        }}
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Download Copy"
                        onClick={() => handleDownload(paper)}
                      >
                        <Download size={14} />
                      </button>

                      {(paper.status === 'draft' || paper.status === 'rejected') && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            title="Submit for Review"
                            onClick={() => handleSubmitReview(paper._id)}
                          >
                            <Send size={14} /> Submit
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Paper Details"
                            onClick={() => handleOpenEdit(paper)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Paper"
                            onClick={() => handleDeletePaper(paper._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No question papers found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Question Paper Details"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label">Paper Title</label>
            <input
              type="text"
              className="form-input"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              required
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Exam Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={editExamName}
              onChange={(e) => setEditExamName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Exam Date</label>
            <input
              type="date"
              className="form-input"
              required
              value={editExamDate}
              onChange={(e) => setEditExamDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Replace PDF File (Optional)</label>
            <input
              type="file"
              accept="application/pdf"
              className="form-input"
              onChange={(e) => setEditFile(e.target.files[0])}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Comment Modal */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Reviewer Feedback & Reason"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontWeight: 600, color: 'var(--status-rejected)', marginBottom: '0.5rem' }}>
            Review Comments:
          </p>
          <div
            style={{
              backgroundColor: 'var(--bg-dark)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}
          >
            {selectedPaper?.reviewComment || 'No detailed comments provided by reviewer.'}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCommentModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyPapers;
