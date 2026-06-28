import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, CheckCircle, XCircle, Clock, Building2,
  Mail, Phone, Calendar, Eye, X, TrendingUp, BarChart3,
  Package, RefreshCw, ChevronDown, Star, Zap, Crown, Layers,
  AlertTriangle, User, FileText, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLAN_COLORS = {
  Free: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  Basic: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  Pro: { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.25)' },
  Enterprise: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
};

const STATUS_COLORS = {
  Active: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', icon: CheckCircle },
  Expired: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', icon: XCircle },
  Trial: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', icon: Clock },
};

const PLAN_ICONS = { Free: Layers, Basic: Zap, Pro: Star, Enterprise: Crown };

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <motion.div
    className="sa-stat-card"
    style={{ '--sa-accent': color }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3, scale: 1.01 }}
    transition={{ duration: 0.3 }}
  >
    <div className="sa-stat-icon"><Icon size={22} /></div>
    <div className="sa-stat-body">
      <div className="sa-stat-value">{value}</div>
      <div className="sa-stat-label">{label}</div>
      {sub && <div className="sa-stat-sub">{sub}</div>}
    </div>
  </motion.div>
);

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.Trial;
  const Icon = cfg.icon;
  return (
    <span className="sa-badge" style={{ background: cfg.bg, color: cfg.text }}>
      <Icon size={11} /> {status}
    </span>
  );
};

const PlanBadge = ({ plan }) => {
  const cfg = PLAN_COLORS[plan] || PLAN_COLORS.Free;
  const Icon = PLAN_ICONS[plan] || Layers;
  return (
    <span className="sa-badge" style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      <Icon size={10} /> {plan || 'Free'}
    </span>
  );
};

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ adminId, onClose, authFetch }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editSub, setEditSub] = useState(false);
  const [subForm, setSubForm] = useState({ plan: 'Free', status: 'Trial', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await authFetch(`/superadmin/admins/${adminId}`);
        const j = await r.json();
        if (j.success) {
          setDetail(j.data);
          const sub = j.data.business?.subscription || {};
          setSubForm({
            plan: sub.plan || 'Free',
            status: sub.status || 'Trial',
            startDate: sub.startDate ? sub.startDate.slice(0, 10) : '',
            endDate: sub.endDate ? sub.endDate.slice(0, 10) : '',
          });
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [adminId]);

  const handleSaveSub = async () => {
    setSaving(true);
    try {
      await authFetch(`/superadmin/admins/${adminId}/subscription`, {
        method: 'PUT',
        body: JSON.stringify(subForm),
      });
      setDetail(prev => ({
        ...prev,
        business: { ...prev.business, subscription: { ...subForm } }
      }));
      setEditSub(false);
    } catch (_) {}
    setSaving(false);
  };

  return (
    <motion.div className="sa-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="sa-modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 22, stiffness: 220 }}>
        <div className="sa-modal-header">
          <div className="sa-modal-title">
            <Building2 size={20} />
            <span>Business Profile</span>
          </div>
          <button className="sa-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div className="sa-modal-loading">
            <RefreshCw size={28} className="sa-spin" />
            <p>Loading profile...</p>
          </div>
        ) : !detail ? (
          <div className="sa-modal-loading"><AlertTriangle size={28} /><p>Failed to load.</p></div>
        ) : (
          <div className="sa-modal-body">
            {/* Admin Info */}
            <div className="sa-detail-section">
              <div className="sa-detail-section-title"><User size={14} /> Admin Account</div>
              <div className="sa-detail-grid">
                <div className="sa-detail-item"><span>Name</span><strong>{detail.admin.name}</strong></div>
                <div className="sa-detail-item"><span>Email</span><strong>{detail.admin.email}</strong></div>
                <div className="sa-detail-item"><span>Phone</span><strong>{detail.admin.phone}</strong></div>
                <div className="sa-detail-item"><span>Registered</span><strong>{fmtDate(detail.admin.registeredAt)}</strong></div>
              </div>
            </div>

            {/* Business Info */}
            {detail.business && (
              <div className="sa-detail-section">
                <div className="sa-detail-section-title"><Building2 size={14} /> Business Details</div>
                <div className="sa-detail-grid">
                  <div className="sa-detail-item"><span>Business Name</span><strong>{detail.business.name}</strong></div>
                  <div className="sa-detail-item"><span>GSTIN</span><strong>{detail.business.gstin}</strong></div>
                  <div className="sa-detail-item"><span>Phone</span><strong>{detail.business.phone}</strong></div>
                  <div className="sa-detail-item"><span>Email</span><strong>{detail.business.email}</strong></div>
                  <div className="sa-detail-item"><span>Address</span><strong>{detail.business.address}</strong></div>
                  <div className="sa-detail-item"><span>Created</span><strong>{fmtDate(detail.business.createdAt)}</strong></div>
                </div>
              </div>
            )}

            {/* Subscription */}
            <div className="sa-detail-section">
              <div className="sa-detail-section-title" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} /> Subscription</span>
                {!editSub && (
                  <button className="sa-edit-btn" onClick={() => setEditSub(true)}>Edit</button>
                )}
              </div>
              {!editSub ? (
                <div className="sa-detail-grid">
                  <div className="sa-detail-item"><span>Plan</span><PlanBadge plan={detail.business?.subscription?.plan || 'Free'} /></div>
                  <div className="sa-detail-item"><span>Status</span><StatusBadge status={detail.business?.subscription?.status || 'Trial'} /></div>
                  <div className="sa-detail-item"><span>Start Date</span><strong>{fmtDate(detail.business?.subscription?.startDate)}</strong></div>
                  <div className="sa-detail-item"><span>End Date</span><strong>{fmtDate(detail.business?.subscription?.endDate)}</strong></div>
                </div>
              ) : (
                <div className="sa-sub-edit-form">
                  <div className="sa-sub-edit-row">
                    <label>Plan</label>
                    <select value={subForm.plan} onChange={e => setSubForm({ ...subForm, plan: e.target.value })}>
                      {['Free', 'Basic', 'Pro', 'Enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="sa-sub-edit-row">
                    <label>Status</label>
                    <select value={subForm.status} onChange={e => setSubForm({ ...subForm, status: e.target.value })}>
                      {['Trial', 'Active', 'Expired'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="sa-sub-edit-row">
                    <label>Start Date</label>
                    <input type="date" value={subForm.startDate} onChange={e => setSubForm({ ...subForm, startDate: e.target.value })} />
                  </div>
                  <div className="sa-sub-edit-row">
                    <label>End Date</label>
                    <input type="date" value={subForm.endDate} onChange={e => setSubForm({ ...subForm, endDate: e.target.value })} />
                  </div>
                  <div className="sa-sub-edit-actions">
                    <button className="sa-btn-secondary" onClick={() => setEditSub(false)}>Cancel</button>
                    <button className="sa-btn-primary" onClick={handleSaveSub} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="sa-detail-section">
              <div className="sa-detail-section-title"><BarChart3 size={14} /> Module Stats</div>
              <div className="sa-stats-row">
                <div className="sa-mini-stat"><Users size={16} /><div><strong>{detail.employeeCount}</strong><span>Employees</span></div></div>
                <div className="sa-mini-stat"><FileText size={16} /><div><strong>{detail.invoiceSummary?.totalInvoices || 0}</strong><span>Invoices</span></div></div>
                <div className="sa-mini-stat"><TrendingUp size={16} /><div><strong>₹{fmt(detail.invoiceSummary?.totalRevenue)}</strong><span>Total Revenue</span></div></div>
                <div className="sa-mini-stat"><CheckCircle size={16} /><div><strong>₹{fmt(detail.invoiceSummary?.paidRevenue)}</strong><span>Paid Revenue</span></div></div>
              </div>
            </div>

            {/* Employees list */}
            {detail.employees?.length > 0 && (
              <div className="sa-detail-section">
                <div className="sa-detail-section-title"><Users size={14} /> Employees ({detail.employeeCount})</div>
                <div className="sa-emp-list">
                  {detail.employees.slice(0, 8).map(emp => (
                    <div key={emp.id} className="sa-emp-row">
                      <span className="sa-emp-avatar">{emp.name?.[0]?.toUpperCase()}</span>
                      <span className="sa-emp-name">{emp.name}</span>
                      <span className="sa-emp-role">{emp.role}</span>
                      <span className={`sa-emp-status ${emp.status === 'Active' ? 'active' : 'inactive'}`}>{emp.status}</span>
                    </div>
                  ))}
                  {detail.employees.length > 8 && (
                    <div className="sa-emp-more">+{detail.employees.length - 8} more employees</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, adminsRes] = await Promise.all([
        authFetch('/superadmin/stats'),
        authFetch('/superadmin/admins'),
      ]);
      const sj = await statsRes.json();
      const aj = await adminsRes.json();
      if (sj.success) setStats(sj.data);
      if (aj.success) setAdmins(aj.data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = admins.filter(a => {
    const matchSearch = !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.business?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.business?.subscription?.status === filterStatus;
    const matchPlan = filterPlan === 'All' || a.business?.subscription?.plan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div className="sa-page">
      {/* Header */}
      <div className="sa-page-header">
        <div>
          <h1 className="sa-page-title">System Overview</h1>
          <p className="sa-page-subtitle">Monitor all registered businesses and subscription status</p>
        </div>
        <button className="sa-refresh-btn" onClick={loadData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'sa-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="sa-stats-grid">
        <StatCard label="Total Businesses" value={stats?.totalAdmins ?? '—'} icon={Building2} color="#6366f1" sub="Registered admins" />
        <StatCard label="Active Subscriptions" value={stats?.activeSubscriptions ?? '—'} icon={CheckCircle} color="#22c55e" sub="Currently active" />
        <StatCard label="Trial Accounts" value={stats?.trialSubscriptions ?? '—'} icon={Clock} color="#f59e0b" sub="Free trial users" />
        <StatCard label="Expired Subscriptions" value={stats?.expiredSubscriptions ?? '—'} icon={XCircle} color="#ef4444" sub="Need renewal" />
      </div>

      {/* Filters */}
      <div className="sa-filters-bar">
        <input
          className="sa-search-input"
          placeholder="Search by name, email, or business..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="sa-filter-group">
          <select className="sa-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Expired">Expired</option>
          </select>
          <select className="sa-filter-select" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
            <option value="All">All Plans</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sa-table-card">
        <div className="sa-table-header">
          <span className="sa-table-count">
            {filtered.length} of {admins.length} businesses
          </span>
        </div>
        {loading ? (
          <div className="sa-loading-state">
            <RefreshCw size={32} className="sa-spin" />
            <p>Loading businesses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sa-empty-state">
            <Building2 size={40} />
            <p>No businesses found</p>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Admin</th>
                  <th>Contact</th>
                  <th>Registered</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Subscription Period</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin, i) => (
                  <motion.tr key={admin.adminId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="sa-table-row"
                  >
                    <td>
                      <div className="sa-biz-cell">
                        <div className="sa-biz-avatar">{admin.business?.name?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <div className="sa-biz-name">{admin.business?.name || '—'}</div>
                          <div className="sa-biz-id">{admin.employeeCount} employee{admin.employeeCount !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sa-admin-name">{admin.name}</div>
                    </td>
                    <td>
                      <div className="sa-contact-cell">
                        <div><Mail size={11} /> {admin.email}</div>
                        <div><Phone size={11} /> {admin.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="sa-date-cell"><Calendar size={11} /> {fmtDate(admin.registeredAt)}</div>
                    </td>
                    <td><PlanBadge plan={admin.business?.subscription?.plan} /></td>
                    <td><StatusBadge status={admin.business?.subscription?.status || 'Trial'} /></td>
                    <td>
                      <div className="sa-date-range">
                        <span>{fmtDate(admin.business?.subscription?.startDate)}</span>
                        <ArrowUpRight size={10} />
                        <span>{fmtDate(admin.business?.subscription?.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <button className="sa-view-btn" onClick={() => setSelectedAdmin(admin.adminId)}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAdmin && (
          <DetailModal
            adminId={selectedAdmin}
            authFetch={authFetch}
            onClose={() => setSelectedAdmin(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
