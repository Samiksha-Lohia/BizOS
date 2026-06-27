import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, LayoutDashboard, Users, LogOut, Menu, X, Sun, Moon, ChevronRight, Copy, CheckCheck, Key } from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/superadmin', icon: LayoutDashboard },
    { name: 'All Businesses', path: '/superadmin/businesses', icon: Users },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const superAdminId = user?._id || user?.id || '—';

  const handleCopyId = () => {
    if (superAdminId && superAdminId !== '—') {
      navigator.clipboard.writeText(superAdminId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  return (
    <div className="superadmin-root">
      {/* Sidebar */}
      <aside className={`superadmin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Branding */}
        <div className="superadmin-sidebar-header">
          <div className="superadmin-brand">
            <div className="superadmin-brand-icon">
              <Shield size={22} />
            </div>
            <div className="superadmin-brand-text">
              <span className="superadmin-brand-name">BizOS</span>
              <span className="superadmin-brand-sub">System Control Panel</span>
            </div>
          </div>
          <button className="superadmin-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Super Admin ID Card */}
        <div className="sa-id-card">
          <div className="sa-id-card-label">
            <Key size={12} />
            <span>Super Admin ID</span>
            <span style={{ fontSize: '10px', opacity: 0.6 }}>(Share with Admins)</span>
          </div>
          <div className="sa-id-card-value">
            <code className="sa-id-code">{superAdminId}</code>
            <button className="sa-id-copy-btn" onClick={handleCopyId} title="Copy ID">
              {copied ? <CheckCheck size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
            </button>
          </div>
          {copied && <div className="sa-id-copied-msg">✓ Copied to clipboard!</div>}
        </div>

        {/* Nav */}
        <nav className="superadmin-nav">
          <div className="superadmin-nav-label">ADMINISTRATION</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/superadmin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`superadmin-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={14} className="superadmin-nav-chevron" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer user info */}
        <div className="superadmin-sidebar-footer">
          <div className="superadmin-user-info">
            <div className="superadmin-user-avatar">
              <Shield size={16} />
            </div>
            <div className="superadmin-user-text">
              <span className="superadmin-user-name">{user?.name || 'Super Admin'}</span>
              <span className="superadmin-user-badge">Super Admin</span>
            </div>
          </div>
          <button className="superadmin-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="superadmin-main">
        {/* Topbar */}
        <header className="superadmin-topbar">
          <div className="superadmin-topbar-left">
            <button className="superadmin-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="superadmin-topbar-title">
              <Shield size={16} />
              <span>
                {menuItems.find(item =>
                  item.path === location.pathname ||
                  (item.path !== '/superadmin' && location.pathname.startsWith(item.path))
                )?.name || 'Super Admin Panel'}
              </span>
            </div>
          </div>
          <div className="superadmin-topbar-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="superadmin-role-chip">
              <Shield size={12} />
              <span>Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="superadmin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
