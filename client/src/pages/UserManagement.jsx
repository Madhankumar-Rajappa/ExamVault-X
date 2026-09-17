import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  AlertCircle,
  CheckCircle,
  Edit,
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Role Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('student');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users', {
        params: {
          page,
          limit: 10,
          role: roleFilter || undefined,
          search: search || undefined,
        },
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const actionText = user.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} ${user.name}?`)) return;

    try {
      await api.patch(`/users/${user._id}/status`, {
        isActive: !user.isActive,
      });
      setSuccess(`User status changed to ${!user.isActive ? 'Active' : 'Inactive'}.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      await api.patch(`/users/${selectedUser._id}/role`, {
        role: newRole,
      });
      setSuccess(`Role for ${selectedUser.name} updated to ${newRole.replace('_', ' ')}.`);
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>User & Role Management</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Manage user account activation status and assign roles (Admin, Question Setter, Reviewer, Student).
        </p>
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

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.25rem',
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
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role Filter:</span>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="question_setter">Question Setter</option>
            <option value="reviewer">Reviewer</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Registered Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">Loading users...</td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      }}
                    >
                      <Shield size={12} /> {u.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="status-badge badge-approved">Active</span>
                    ) : (
                      <span className="status-badge badge-rejected">Deactivated</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Change User Role"
                        onClick={() => handleOpenRoleModal(u)}
                      >
                        <Edit size={14} /> Role
                      </button>
                      <button
                        className={`btn ${u.isActive ? 'btn-danger' : 'btn-success'} btn-sm`}
                        title={u.isActive ? 'Deactivate User' : 'Activate User'}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">No user records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Edit Role Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Change User Permission Role"
      >
        <form onSubmit={handleSaveRole}>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            User: <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
          </p>

          <div className="form-group">
            <label className="form-label">Select System Role *</label>
            <select
              className="form-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="student">Student (Read-only released papers)</option>
              <option value="question_setter">Question Setter (Upload & Edit Drafts)</option>
              <option value="reviewer">Reviewer (Approve / Reject Submissions)</option>
              <option value="admin">Admin (Full System Control)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? 'Saving...' : 'Update Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
