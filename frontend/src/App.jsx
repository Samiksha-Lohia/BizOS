import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getFirstSidebarPath } from './utils/navigation';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import CRM from './pages/CRM';
import Employees from './pages/Employees';
import EmployeeAttendance from './pages/EmployeeAttendance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

// Guard for protected routes (any authenticated user)
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="loading-spinner-screen">
        <Loader2 className="spinner-icon" size={48} />
        <p>Loading BizOS Session...</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Guard to prevent logged-in users from visiting login/register
function PublicRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="loading-spinner-screen">
        <Loader2 className="spinner-icon" size={48} />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to={isSuperAdmin ? '/superadmin' : '/dashboard'} replace />;
  }
  return children;
}

// Only SuperAdmin can access — redirects others to /login
function SuperAdminGuard({ children }) {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="loading-spinner-screen">
        <Loader2 className="spinner-icon" size={48} />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// Blocks SuperAdmin from the regular dashboard — redirects to /superadmin
function BlockSuperAdmin({ children }) {
  const { isSuperAdmin } = useAuth();
  if (isSuperAdmin) return <Navigate to="/superadmin" replace />;
  return children;
}

const EMPLOYEE_ROLES = ['Staff', 'Employee'];

// Blocks employee accounts from admin-only pages — redirects to their default page
function StaffGuard({ children }) {
  const { user } = useAuth();
  if (EMPLOYEE_ROLES.includes(user?.role)) {
    const defaultPath = getFirstSidebarPath(user?.role, false);
    return <Navigate to={defaultPath} replace />;
  }
  return children;
}

function DashboardIndexRoute() {
  const { user } = useAuth();
  const defaultPath = getFirstSidebarPath(user?.role, false);
  if (defaultPath !== '/dashboard') {
    return <Navigate to={defaultPath} replace />;
  }
  return <Dashboard />;
}

function AttendanceRoute() {
  const { user } = useAuth();
  if (EMPLOYEE_ROLES.includes(user?.role)) {
    return <EmployeeAttendance />;
  }
  return <Navigate to="/dashboard" replace />;
}

function AppContent() {
  const location = useLocation();
  const showHeaderFooter = location.pathname === '/';

  React.useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="radial-glow"></div>
      {showHeaderFooter && (
        <div className="navbar-wrapper">
          <nav className="navbar glass-panel">
            <Link to="/" className="logo-section">
              <Package className="logo-icon" />
              <span>BizOS</span>
            </Link>
            <ul className="nav-links">
              <li><a href="#home" className="nav-link">Home</a></li>
              <li><a href="#modules" className="nav-link">Modules</a></li>
              <li><a href="#comparison" className="nav-link">Comparison</a></li>
              <li><a href="#pricing" className="nav-link">Pricing</a></li>
              <li><a href="#faq" className="nav-link">FAQ</a></li>
              <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>
            <div className="nav-actions">
              <Link to="/login"><button className="btn btn-ghost">Sign In</button></Link>
              <Link to="/register"><button className="btn btn-primary">Get Started</button></Link>
            </div>
          </nav>
        </div>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1]}>
          {/* Public Routes */}
          <Route path="/" element={
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <Landing />
            </motion.div>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }} style={{ width: '100%', display: 'flex', flexGrow: 1 }}>
                <Login />
              </motion.div>
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }} style={{ width: '100%', display: 'flex', flexGrow: 1 }}>
                <Register />
              </motion.div>
            </PublicRoute>
          } />

          {/* ── Super Admin Routes (completely isolated) ── */}
          <Route path="/superadmin" element={
            <SuperAdminGuard>
              <SuperAdminLayout />
            </SuperAdminGuard>
          }>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="businesses" element={<SuperAdminDashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ── Regular Dashboard Routes ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <BlockSuperAdmin>
                <DashboardLayout />
              </BlockSuperAdmin>
            </ProtectedRoute>
          }>
            <Route index element={<DashboardIndexRoute />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="crm" element={<StaffGuard><CRM /></StaffGuard>} />
            <Route path="employees" element={<StaffGuard><Employees /></StaffGuard>} />
            <Route path="expenses" element={<StaffGuard><Expenses /></StaffGuard>} />
            <Route path="reports" element={<StaffGuard><Reports /></StaffGuard>} />
            <Route path="settings" element={<Settings />} />
            <Route path="attendance" element={<AttendanceRoute />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
