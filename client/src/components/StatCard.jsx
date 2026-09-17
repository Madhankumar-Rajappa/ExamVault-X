import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'var(--primary)' }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
