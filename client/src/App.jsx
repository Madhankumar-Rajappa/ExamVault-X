import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Auth Pages
import RolePortal from './pages/RolePortal';
import RoleLogin from './pages/RoleLogin';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Protected Pages
import Dashboard from './pages/Dashboard';
import UploadPaper from './pages/UploadPaper';
import MyPapers from './pages/MyPapers';
import ReviewPapers from './pages/ReviewPapers';
import AllPapers from './pages/AllPapers';
import ReleasedPapers from './pages/ReleasedPapers';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<RolePortal />} />
          <Route path="/login/:role" element={<RoleLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes inside Main App Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Question Setter Routes */}
            <Route
              path="/upload-paper"
              element={
                <ProtectedRoute allowedRoles={['admin', 'question_setter']}>
                  <UploadPaper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-papers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'question_setter']}>
                  <MyPapers />
                </ProtectedRoute>
              }
            />

            {/* Reviewer Routes */}
            <Route
              path="/review-papers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'reviewer']}>
                  <ReviewPapers />
                </ProtectedRoute>
              }
            />

            {/* Student & General Released Papers */}
            <Route path="/released-papers" element={<ReleasedPapers />} />

            {/* Admin Routes */}
            <Route
              path="/question-papers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AllPapers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
