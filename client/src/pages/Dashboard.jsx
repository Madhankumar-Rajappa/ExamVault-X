import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Files,
  FileCheck,
  Clock,
  Send,
  AlertTriangle,
  GraduationCap,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading dashboard metrics...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  // Admin View
  if (user?.role === 'admin') {
    const { users, questionPapers, recentAudits } = data || {};
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Welcome back, Administrator {user?.name}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Overview of system users, question papers workflow state, and live security audit logs.
          </p>
        </div>

        {/* User Stats */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
          USER MANAGEMENT STATS
        </h3>
        <div className="grid-stats">
          <StatCard icon={Users} label="Total Users" value={users?.total || 0} color="var(--primary)" />
          <StatCard icon={UserCheck} label="Active Users" value={users?.active || 0} color="var(--status-approved)" />
          <StatCard icon={UserX} label="Deactivated Users" value={users?.inactive || 0} color="var(--status-rejected)" />
        </div>

        {/* Question Paper Stats */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
          QUESTION PAPERS WORKFLOW STATS
        </h3>
        <div className="grid-stats">
          <StatCard icon={Files} label="Total Question Papers" value={questionPapers?.total || 0} color="var(--accent)" />
          <StatCard icon={Clock} label="Under Review" value={questionPapers?.under_review || 0} color="var(--status-review)" />
          <StatCard icon={FileCheck} label="Approved" value={questionPapers?.approved || 0} color="var(--status-approved)" />
          <StatCard icon={Send} label="Scheduled / Released" value={(questionPapers?.scheduled || 0) + (questionPapers?.released || 0)} color="var(--primary)" />
          <StatCard icon={AlertTriangle} label="Rejected Papers" value={questionPapers?.rejected || 0} color="var(--status-rejected)" />
        </div>

        {/* Recent Audits */}
        <div className="table-container" style={{ marginTop: '2rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Security Audit Trail</h3>
            <Link to="/audit-logs" className="btn btn-secondary btn-sm">View All Logs</Link>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Resource Type</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentAudits && recentAudits.length > 0 ? (
                recentAudits.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.user?.name || 'System'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user?.email}</div>
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{log.action}</span></td>
                    <td>{log.resourceType}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.details || '-'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No audit logs recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Question Setter View
  if (user?.role === 'question_setter') {
    const { stats, recentPapers } = data || {};
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Setter Portal – Welcome {user?.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Manage your draft papers, submit question papers for review, and track approval status.
            </p>
          </div>
          <Link to="/upload-paper" className="btn btn-primary">
            <PlusCircle size={18} /> Upload New Paper
          </Link>
        </div>

        <div className="grid-stats">
          <StatCard icon={Files} label="Total Uploads" value={stats?.total || 0} color="var(--primary)" />
          <StatCard icon={Clock} label="Draft Papers" value={stats?.draft || 0} color="var(--status-draft)" />
          <StatCard icon={Send} label="Under Review" value={stats?.under_review || 0} color="var(--status-review)" />
          <StatCard icon={FileCheck} label="Approved" value={stats?.approved || 0} color="var(--status-approved)" />
          <StatCard icon={AlertTriangle} label="Rejected" value={stats?.rejected || 0} color="var(--status-rejected)" />
        </div>

        <div className="table-container" style={{ marginTop: '1.5rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>My Recently Uploaded Papers</h3>
            <Link to="/my-papers" className="btn btn-secondary btn-sm">Manage All My Papers</Link>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Exam</th>
                <th>Status</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {recentPapers && recentPapers.length > 0 ? (
                recentPapers.map((paper) => (
                  <tr key={paper._id}>
                    <td style={{ fontWeight: 600 }}>{paper.title}</td>
                    <td>{paper.subject}</td>
                    <td>{paper.examName}</td>
                    <td><StatusBadge status={paper.status} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No question papers uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Reviewer View
  if (user?.role === 'reviewer') {
    const { stats, recentReviews } = data || {};
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Reviewer Portal – Welcome {user?.name}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Evaluate submitted question papers, check syllabus standards, and approve or reject papers with comments.
          </p>
        </div>

        <div className="grid-stats">
          <StatCard icon={Clock} label="Papers Awaiting Review" value={stats?.awaitingReview || 0} color="var(--status-review)" />
          <StatCard icon={FileCheck} label="Approved by Me" value={stats?.approvedByMe || 0} color="var(--status-approved)" />
          <StatCard icon={AlertTriangle} label="Rejected by Me" value={stats?.rejectedByMe || 0} color="var(--status-rejected)" />
        </div>

        <div style={{ margin: '1.5rem 0' }}>
          <Link to="/review-papers" className="btn btn-primary">
            Review Pending Question Papers <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Student View
  if (user?.role === 'student') {
    const { totalReleased, recentlyReleased } = data || {};
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Student Portal – Welcome {user?.name}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Access and download verified released question papers for your courses and exams.
          </p>
        </div>

        <div className="grid-stats">
          <StatCard icon={GraduationCap} label="Released Question Papers" value={totalReleased || 0} color="var(--primary)" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recently Released Papers</h3>
          <Link to="/released-papers" className="btn btn-secondary btn-sm">Browse All Papers</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {recentlyReleased && recentlyReleased.length > 0 ? (
            recentlyReleased.map((paper) => (
              <div
                key={paper._id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span className="status-badge badge-released" style={{ marginBottom: '0.75rem' }}>
                    {paper.subject}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
                    {paper.title}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Exam: {paper.examName} ({new Date(paper.examDate).toLocaleDateString()})
                  </p>
                </div>
                <Link to="/released-papers" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  View & Download PDF
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              No released question papers available at this time.
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
