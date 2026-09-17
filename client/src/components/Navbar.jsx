import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, User as UserIcon } from 'lucide-react';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      <h2 className="nav-page-title">{pageTitle}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span
          className="status-badge"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--primary)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Shield size={12} />
          {user?.role?.replace('_', ' ').toUpperCase()}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <UserIcon size={16} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
