import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  FileUp,
  FileCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const RolePortal = () => {
  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      subtitle: 'Access & Download Released Papers',
      description:
        'Search verified exam question papers, view metadata, and download official PDF files.',
      icon: GraduationCap,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      path: '/login/student',
    },
    {
      id: 'question_setter',
      title: 'Question Setter Portal',
      subtitle: 'Upload & Draft Management',
      description:
        'Upload PDF papers, manage drafts, edit papers, and submit for academic review.',
      icon: FileUp,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.12)',
      path: '/login/question_setter',
    },
    {
      id: 'reviewer',
      title: 'Faculty Reviewer Portal',
      subtitle: 'Syllabus & Quality Evaluation',
      description:
        'Inspect pending question papers, provide review feedback, and approve or reject submissions.',
      icon: FileCheck,
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.12)',
      path: '/login/reviewer',
    },
    {
      id: 'admin',
      title: 'Administrator Security Vault',
      subtitle: 'System Control & Audits',
      description:
        'User activation, role permissions, publication release scheduling, and security audit logs.',
      icon: ShieldAlert,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      path: '/login/admin',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-dark)',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1080px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '1.25rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Shield size={36} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff' }}>
            ExamVault-X Portal Selection
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1rem',
              marginTop: '0.5rem',
              maxWidth: '600px',
              margin: '0.5rem auto 0',
            }}
          >
            Select your institutional role to proceed to your dedicated authentication portal.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: 'var(--shadow-md)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = r.color;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${r.bgGlow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: r.bgGlow,
                      color: r.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={28} />
                  </div>

                  <h2
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {r.title}
                  </h2>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: r.color,
                      marginBottom: '0.85rem',
                    }}
                  >
                    {r.subtitle}
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.5',
                      marginBottom: '1.75rem',
                    }}
                  >
                    {r.description}
                  </p>
                </div>

                <Link
                  to={r.path}
                  className="btn"
                  style={{
                    backgroundColor: r.bgGlow,
                    color: r.color,
                    border: `1px solid ${r.color}40`,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  Enter Portal <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '3rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-dark)',
          }}
        >
          ExamVault-X Institutional Role Security Protocol • Strict Backend Authorization Enforced
        </div>
      </div>
    </div>
  );
};

export default RolePortal;
