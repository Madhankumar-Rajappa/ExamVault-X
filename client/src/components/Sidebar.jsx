import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileUp,
  Files,
  FileCheck,
  Users,
  ShieldCheck,
  LogOut,
  Shield,
  GraduationCap,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/question-papers', label: 'All Question Papers', icon: Files },
          { to: '/users', label: 'User Management', icon: Users },
          { to: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
        ];
      case 'question_setter':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/upload-paper', label: 'Upload Paper', icon: FileUp },
          { to: '/my-papers', label: 'My Question Papers', icon: Files },
        ];
      case 'reviewer':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/review-papers', label: 'Pending Reviews', icon: FileCheck },
        ];
      case 'student':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/released-papers', label: 'Released Papers', icon: GraduationCap },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Shield size={20} />
        </div>
        <span className="brand-title">ExamVault-X</span>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role-tag">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Log Out"
            style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
