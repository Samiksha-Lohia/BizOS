import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Package, 
  FileSpreadsheet, 
  Users, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Building,
  UserCheck,
  FileText,
  Settings,
  CalendarCheck
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isStaff = ['Staff', 'Employee'].includes(user?.role);

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package, roles: ['Admin', 'Manager', 'Staff', 'Accountant'] },
    { name: 'Billing', path: '/dashboard/billing', icon: FileSpreadsheet, roles: ['Admin', 'Manager', 'Staff', 'Accountant'] },
    { name: 'CRM Ledger', path: '/dashboard/crm', icon: Users, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Employees', path: '/dashboard/employees', icon: UserCheck, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Expenses', path: '/dashboard/expenses', icon: CreditCard, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Attendance', path: '/dashboard/attendance', icon: CalendarCheck, roles: ['Staff', 'Employee'] },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, roles: ['Admin', 'Manager', 'Accountant'] },
  ];

  const menuItems = user?.role
    ? allMenuItems.filter(item => item.roles.includes(user.role))
    : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const businessName = user?.businessId?.name || "My Business";
  const userRole = user?.role || "Staff";
  // User-facing role label — show "Employee" instead of "Staff"
  const displayRole = ['Staff', 'Employee'].includes(userRole) ? 'Employee' : userRole;

  return (
    <div className="dashboard-root">
      {/* Sidebar container */}
      <aside className={`dashboard-sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', background: 'none', webkitTextFillColor: 'initial', webkitBackgroundClip: 'initial' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gradient-hero)', webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent', fontWeight: 700, fontSize: '20px' }}>
              <Building className="logo-icon" style={{ webkitTextFillColor: 'initial' }} />
              <span className="business-title">{businessName}</span>
            </div>
            {user?.businessId?._id && !isStaff && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', userSelect: 'all', marginTop: '2px' }} title="Share this ID with staff members to register them under your business">
                ID: {user.businessId._id}
              </span>
            )}
          </div>
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

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
            <div className="user-text">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-role-badge">{displayRole}</span>
              {isStaff && user?.designation && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.designation}</span>
              )}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
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
            <h1 className="page-heading">
              {menuItems.find(item => item.path === location.pathname)?.name || "BizOS Overview"}
            </h1>
          </div>
          <div className="topbar-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="topbar-user-badge">
              <span className="role-indicator">Role: <strong>{displayRole}</strong></span>
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

export default DashboardLayout;
