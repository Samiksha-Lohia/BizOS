import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  RotateCw 
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Settings', path: '/superadmin/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar container */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-profile-section">
          <div className="sidebar-avatar-container">
            <div className="sidebar-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
          </div>
          <h3 className="sidebar-username">{user?.name || "Super Admin"}</h3>
          <span className="sidebar-email">{user?.email || "superadmin@bizos.internal"}</span>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} className="sidebar-icon" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer-custom">
          <button className="logout-btn-custom" onClick={handleLogout}>
            <LogOut size={18} className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main dashboard content body */}
      <div className="dashboard-main">
        <header className="dashboard-topbar glass-panel">
          <div className="topbar-left">
            <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="topbar-titles">
              <h1 className="page-heading">
                {menuItems.find(item => item.path === location.pathname)?.name || "Super Admin Control"}
              </h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button onClick={() => window.location.reload()} className="topbar-action-btn" aria-label="Refresh Dashboard">
              <RotateCw size={18} />
            </button>
            <div className="topbar-role-badge">
              <Shield size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              <span>Super Admin</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
