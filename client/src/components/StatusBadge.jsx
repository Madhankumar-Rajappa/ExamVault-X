import React from 'react';

const StatusBadge = ({ status }) => {
  const formatLabel = (str) => {
    if (!str) return '';
    return str.replace('_', ' ').toUpperCase();
  };

  return (
    <span className={`status-badge badge-${status}`}>
      {formatLabel(status)}
    </span>
  );
};

export default StatusBadge;
