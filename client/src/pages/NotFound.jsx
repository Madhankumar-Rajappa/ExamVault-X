import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="empty-state" style={{ padding: '5rem 1.5rem' }}>
      <FileQuestion size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>404 - Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 2rem', maxWidth: '400px' }}>
        The requested page or resource could not be found.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
