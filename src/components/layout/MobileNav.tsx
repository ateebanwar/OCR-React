import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, MessageSquare, Settings, Info } from 'lucide-react';
import './MobileNav.css';

export const MobileNav: React.FC = () => {
  const links = [
    { to: '/', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { to: '/workspace', label: 'Convert', icon: <FileSpreadsheet size={20} /> },
    { to: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    { to: '/about', label: 'About', icon: <Info size={20} /> },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="mobile-icon">{link.icon}</span>
          <span className="mobile-label">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
