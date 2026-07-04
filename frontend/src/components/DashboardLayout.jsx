import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  FileSpreadsheet, 
  Users, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  RotateCw,
  UserCheck,
  FileText,
  Settings,
  CalendarCheck
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isStaff = ['Staff', 'Employee'].includes(user?.role);

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package, roles: ['Admin', 'Manager', 'Staff', 'Accountant'] },
    { name: 'Billing', path: '/dashboard/billing', icon: FileSpreadsheet, roles: ['Admin', 'Manager', 'Staff', 'Accountant'] },
    { name: 'CRM Ledger', path: '/dashboard/crm', icon: Users, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Employees', path: '/dashboard/employees', icon: UserCheck, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Expenses', path: '/dashboard/expenses', icon: CreditCard, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText, roles: ['Admin', 'Manager', 'Accountant'] },
    { name: 'Attendance', path: '/dashboard/attendance', icon: CalendarCheck, roles: ['Staff', 'Employee'] },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, roles: ['Admin', 'Manager', 'Accountant', 'Staff', 'Employee'] },
  ];

  const menuItems = user?.role
    ? allMenuItems.filter(item => item.roles.includes(user.role))
    : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userRole = user?.role || "Staff";
  // User-facing role label — show "Employee" instead of "Staff"
  const displayRole = ['Staff', 'Employee'].includes(userRole) ? 'Employee' : userRole;

  return (
    <div className="dashboard-root">
      {/* Sidebar container */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-profile-section">
          <div className="sidebar-avatar-container">
            <div className="sidebar-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
          <h3 className="sidebar-username">{user?.name || "User Profile"}</h3>
          <span className="sidebar-email">{user?.email || "user@example.com"}</span>
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
                {menuItems.find(item => item.path === location.pathname)?.name || "Dashboard"}
              </h1>
              {location.pathname === '/dashboard' && (
                <p className="page-subheading">Welcome back, {user?.name?.split(' ')[0] || "User"}</p>
              )}
            </div>
          </div>
          <div className="topbar-actions">
            <button onClick={() => window.location.reload()} className="topbar-action-btn" aria-label="Refresh Dashboard">
              <RotateCw size={18} />
            </button>
            <div className="topbar-role-badge">
              <span>Role: {displayRole}</span>
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
