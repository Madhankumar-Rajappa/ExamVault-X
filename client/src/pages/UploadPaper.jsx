import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileUp, AlertCircle, CheckCircle, Upload } from 'lucide-react';

const UploadPaper = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('Only PDF files are allowed.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5 MB maximum limit.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a valid PDF file to upload.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('examName', examName);
      formData.append('examDate', examDate);
      formData.append('description', description);
      formData.append('questionPaper', file);

      await api.post('/question-papers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Question paper uploaded successfully as a draft!');
      setTimeout(() => {
        navigate('/my-papers');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload question paper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="form-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileUp size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upload Question Paper</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Upload a new PDF question paper. New papers enter as initial draft status.
            </p>
          </div>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Paper Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Data Structures & Algorithms Mid-Term Question Paper"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Code / Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science - CS201"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exam Name / Semester *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Fall 2026 Semester Examination"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Scheduled Exam Date *</label>
            <input
              type="date"
              className="form-input"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Special Instructions</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Optional notes or instructions for reviewers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select PDF Document (Max 5 MB) *</label>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {file ? file.name : 'Click or drag PDF file here'}
              </p>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Only PDF files are allowed (.pdf) up to 5 MB
              </p>
              <input
                id="file-upload-input"
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/my-papers')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading File...' : 'Upload Question Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPaper;
