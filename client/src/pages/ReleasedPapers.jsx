import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import {
  GraduationCap,
  Search,
  Download,
  Calendar,
  BookOpen,
  AlertCircle,
  FileText,
} from 'lucide-react';

const ReleasedPapers = () => {
  const [papers, setPapers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReleasedPapers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/question-papers', {
        params: {
          page,
          limit: 10,
          status: 'released',
          search: search || undefined,
          subject: subjectFilter || undefined,
        },
      });
      setPapers(response.data.questionPapers);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch released question papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleasedPapers();
  }, [page, subjectFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReleasedPapers();
  };

  const handleDownload = async (paper) => {
    try {
      const response = await api.get(`/question-papers/${paper._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', paper.fileName || `${paper.title}.pdf`);
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Released Question Papers Repository</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Browse, search, and download official verified examination papers.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Search and Subject Filter */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
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
            placeholder="Search papers by subject, exam, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
        </form>

        <input
          type="text"
          className="form-input"
          placeholder="Filter by Subject..."
          style={{ width: '220px' }}
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Paper Cards Grid */}
      {loading ? (
        <div className="empty-state">Loading released question papers...</div>
      ) : papers && papers.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {papers.map((paper) => (
            <div
              key={paper._id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <BookOpen size={12} /> {paper.subject}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PDF ({paper.fileName})
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                  {paper.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <strong>Exam:</strong> {paper.examName}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-dark)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Calendar size={14} /> Exam Date:{' '}
                  {new Date(paper.examDate).toLocaleDateString()}
                </div>

                {paper.description && (
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {paper.description}
                  </p>
                )}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleDownload(paper)}
              >
                <Download size={16} /> Download Official PDF
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No released question papers match your query criteria.
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default ReleasedPapers;
