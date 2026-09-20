import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  MessageSquare,
  Settings,
  Info,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';
import './Sidebar.css';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { document, canonicalDataset } = useDocumentSession();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { to: '/workspace', label: 'Convert & Data', icon: <FileSpreadsheet size={19} /> },
    { to: '/chat', label: 'Financial Chat', icon: <MessageSquare size={19} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={19} /> },
    { to: '/about', label: 'About & Security', icon: <Info size={19} /> },
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-badge">
          <ShieldCheck size={20} className="brand-logo-icon" />
        </div>
        {!isCollapsed && (
          <div className="brand-text">
            <span className="brand-title">LedgerAI</span>
            <span className="brand-tag">FINANCIAL INTEL</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="sidebar-collapse-btn"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-text">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Active Document Context Pill in Sidebar */}
      {!isCollapsed && document && (
        <div className="sidebar-active-doc-card">
          <div className="active-doc-badge">Active Document</div>
          <p className="active-doc-name" title={document.name}>{document.name}</p>
          <div className="active-doc-meta">
            <span>{document.metadata.pageCount} pgs</span>
            <span>•</span>
            <span>{canonicalDataset?.totals.rowCount ?? 0} rows</span>
            <span>•</span>
            <span className={`status-dot ${canonicalDataset?.validation.isValid ? 'valid' : 'warning'}`} />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <span className="sidebar-version">v2.4.0 • Enterprise Core</span>
        )}
      </div>
    </aside>
  );
};
