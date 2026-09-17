import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  GraduationCap,
  FileUp,
  FileCheck,
  ShieldAlert,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Key,
} from 'lucide-react';

const roleConfigs = {
  student: {
    title: 'Student Portal Login',
    subtitle: 'Access & Download Released Question Papers',
    badge: 'STUDENT PORTAL',
    color: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
    icon: GraduationCap,
    defaultEmail: 'student@examvault.edu',
    allowRegister: true,
  },
  question_setter: {
    title: 'Question Setter Portal Login',
    subtitle: 'Upload, Draft & Manage Examination Papers',
    badge: 'QUESTION SETTER PORTAL',
    color: '#3b82f6',
    bgGlow: 'rgba(59, 130, 246, 0.15)',
    icon: FileUp,
    defaultEmail: 'setter@examvault.edu',
    allowRegister: false,
  },
  reviewer: {
    title: 'Faculty Reviewer Portal Login',
    subtitle: 'Inspect Submissions & Provide Academic Decisions',
    badge: 'REVIEWER PORTAL',
    color: '#8b5cf6',
    bgGlow: 'rgba(139, 92, 246, 0.15)',
    icon: FileCheck,
    defaultEmail: 'reviewer@examvault.edu',
    allowRegister: false,
  },
  admin: {
    title: 'Administrator Vault Security Login',
    subtitle: 'System User Control, Release Scheduling & Audit Trail',
    badge: 'ADMIN SECURITY PORTAL',
    color: '#f59e0b',
    bgGlow: 'rgba(245, 158, 11, 0.15)',
    icon: ShieldAlert,
    defaultEmail: 'admin@examvault.edu',
    allowRegister: false,
  },
};

const RoleLogin = () => {
  const { role } = useParams();
  const currentRole = roleConfigs[role] ? role : 'student';
  const config = roleConfigs[currentRole];
  const Icon = config.icon;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('session') === 'expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password, currentRole);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Invalid credentials or unauthorized for ${config.title}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoFillDemo = () => {
    setEmail(config.defaultEmail);
    setPassword('ExamVault2026!');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-dark)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${config.color}40`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: `0 10px 30px ${config.bgGlow}`,
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={16} /> Switch Role Portal
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: config.bgGlow,
              color: config.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: `1px solid ${config.color}50`,
            }}
          >
            <Icon size={32} />
          </div>

          <div>
            <span
              className="status-badge"
              style={{
                backgroundColor: config.bgGlow,
                color: config.color,
                border: `1px solid ${config.color}40`,
                marginBottom: '0.5rem',
              }}
            >
              {config.badge}
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: '0.5rem' }}>
            {config.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {config.subtitle}
          </p>
        </div>

        {/* Demo Auto fill helper */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Demo Account:</strong> {config.defaultEmail}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAutoFillDemo}
            style={{ fontSize: '0.75rem', gap: '0.3rem' }}
          >
            <Key size={12} /> Auto-Fill
          </button>
        </div>

        {isExpired && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /> Session expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{config.title.split(' ')[0]} Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder={config.defaultEmail}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.8rem',
              marginTop: '1rem',
              backgroundColor: config.color,
              color: '#fff',
              boxShadow: `0 4px 14px ${config.bgGlow}`,
            }}
          >
            {submitting ? 'Verifying Authorization...' : `Sign In to ${config.badge}`}{' '}
            <ArrowRight size={18} />
          </button>
        </form>

        {config.allowRegister ? (
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have a student account yet?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: config.color }}>
              Register here
            </Link>
          </div>
        ) : (
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            Note: Staff accounts ({config.badge}) are provisioned by Administrator. Contact system admin for account changes.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleLogin;
