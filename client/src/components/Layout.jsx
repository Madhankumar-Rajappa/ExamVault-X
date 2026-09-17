import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/upload-paper':
        return 'Upload Question Paper';
      case '/my-papers':
        return 'My Uploaded Papers';
      case '/review-papers':
        return 'Question Papers Awaiting Review';
      case '/question-papers':
        return 'Question Paper Management';
      case '/released-papers':
        return 'Released Question Papers';
      case '/users':
        return 'User & Role Management';
      case '/audit-logs':
        return 'System Audit Logs';
      default:
        return 'ExamVault-X';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar pageTitle={getPageTitle(location.pathname)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
