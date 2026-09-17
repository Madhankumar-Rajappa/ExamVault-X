import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="empty-state" style={{ padding: '5rem 1.5rem' }}>
      <ShieldAlert size={64} style={{ color: 'var(--status-rejected)', marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 2rem', maxWidth: '400px' }}>
        You do not have administrative or role-based permission to view this resource.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
