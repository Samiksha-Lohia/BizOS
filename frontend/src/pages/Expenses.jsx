import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Check, 
  X, 
  AlertTriangle, 
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  User,
  Upload,
  ExternalLink
} from 'lucide-react';

const Expenses = () => {
  const { user, token, authFetch } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // tracks which expense ID is being actioned
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: 'Rent',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    employeeId: ''
  });

  // State to fetch employees list for assigning expenses (reimbursements)
  const [employees, setEmployees] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `/expenses?`;
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      
      const res = await authFetch(url);
      const result = await res.json();
      if (result.success) {
        setExpenses(result.data);
      } else {
        setError(result.message || 'Could not load expenses ledger');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancials = async () => {
    try {
      setReportLoading(true);
      const res = await authFetch('/expenses/profit-loss');
      const result = await res.json();
      if (result.success) {
        setProfitLoss(result.data);
      }
    } catch (err) {
      console.error('Failed to load P&L reports:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await authFetch('/employees');
      const result = await res.json();
      if (result.success) {
        setEmployees(result.data.filter(e => e.status === 'Active'));
      }
    } catch (err) {
      console.error('Could not fetch employee list for claims:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    fetchFinancials();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append('file', file);

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fileData
      });
      const result = await response.json();
      if (result.success) {
        setReceiptUrl(result.fileUrl);
        setSuccess('Receipt uploaded successfully! Complete the form to log cost.');
      } else {
        setError(result.message || 'File upload failed');
      }
    } catch (err) {
      setError('Connection to file server failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          receiptUrl: receiptUrl || undefined,
          employeeId: formData.employeeId || undefined
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Expense logged successfully!');
        setIsAddModalOpen(false);
        fetchData();
        fetchFinancials();
        setReceiptUrl('');
        setFormData({
          category: 'Rent',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          employeeId: ''
        });
      } else {
        setError(result.message || 'Log failed');
      }
    } catch (err) {
      setError('Failed to log expense.');
    }
  };

  const handleApprove = async (expenseId, statusVal, reimburseVal = null) => {
    if (statusVal === 'Rejected') {
      if (!window.confirm('Reject this expense? This cannot be undone.')) return;
    }
    setError('');
    setSuccess('');
    setActionLoading(expenseId);

    const body = {};
    if (statusVal) body.status = statusVal;
    if (reimburseVal) body.reimbursementStatus = reimburseVal;

    try {
      const response = await authFetch(`/expenses/${expenseId}/approve`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(statusVal === 'Approved' ? '✅ Expense approved successfully!' : statusVal === 'Rejected' ? '❌ Expense rejected.' : 'Reimbursement recorded.');
        fetchData();
        fetchFinancials();
      } else {
        setError(result.message || 'Failed to update expense status. Check your role permissions.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please check if the server is running.');
    } finally {
      setActionLoading(null);
    }
  };

  const isRoleAllowed = (roles) => {
    return user && roles.includes(user.role);
  };

  const categories = ["Rent", "Salaries", "Utilities", "Raw Materials", "Transport", "Marketing", "Misc"];

  return (
    <div style={{ width: '100%' }}>
      {/* Alert overlays */}
      {error && <div className="error-message" style={{ marginBottom: '24px' }}><AlertTriangle size={16} /> {error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '24px' }}><AlertTriangle size={16} /> {success}</div>}

      {/* Financials Overview Bar */}
      {reportLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', marginBottom: '24px' }}>
          <Loader2 className="spinner-icon" size={24} />
        </div>
      ) : profitLoss && (
        <div className="kpis-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card glass-panel revenue" style={{ padding: '16px' }}>
            <span className="kpi-title" style={{ fontSize: '11px' }}>Gross Revenue</span>
            <span className="kpi-value" style={{ fontSize: '20px' }}>₹{profitLoss.financials.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="kpi-card glass-panel expense" style={{ padding: '16px' }}>
            <span className="kpi-title" style={{ fontSize: '11px' }}>Cost of Goods (COGS)</span>
            <span className="kpi-value" style={{ fontSize: '20px' }}>₹{profitLoss.financials.totalCostOfGoodsSold.toLocaleString('en-IN')}</span>
          </div>
          <div className="kpi-card glass-panel profit" style={{ padding: '16px' }}>
            <span className="kpi-title" style={{ fontSize: '11px' }}>Category Expenses</span>
            <span className="kpi-value" style={{ fontSize: '20px' }}>₹{profitLoss.financials.totalExpenses.toLocaleString('en-IN')}</span>
          </div>
          <div className="kpi-card glass-panel attendance" style={{ padding: '16px' }}>
            <span className="kpi-title" style={{ fontSize: '11px' }}>Net Operating Profit</span>
            <span className="kpi-value" style={{ fontSize: '20px', color: profitLoss.financials.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              ₹{profitLoss.financials.netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      <div className="page-actions-row" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            style={{ width: '150px', padding: '10px 16px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="form-input"
            style={{ width: '150px', padding: '10px 16px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {isRoleAllowed(['Admin', 'Manager', 'Staff']) && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Log Expense
          </button>
        )}
      </div>

      {/* Main page layout splits */}
      <div className="dashboard-grid-two" style={{ gridTemplateColumns: '1fr 320px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {/* Expenses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader2 className="spinner-icon" size={32} />
            </div>
          ) : expenses.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <CreditCard size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
              <p>No logged expenses found matching criteria.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Expense Description</th>
                    <th>Category</th>
                    <th>Logged Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{exp.description || 'General Outflow'}</div>
                        {exp.employeeId && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={10} />
                            Claim by: <strong>{exp.employeeId.name}</strong> ({exp.reimbursementStatus})
                          </div>
                        )}
                        {exp.receiptUrl && (
                          <div style={{ marginTop: '4px' }}>
                            <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                              View Receipt <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </td>
                      <td><span className="status-pill info">{exp.category}</span></td>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-red)' }}>₹{exp.amount}</td>
                      <td>
                        <span className={`status-pill ${
                          exp.status === 'Approved' ? 'success' :
                          exp.status === 'Pending' ? 'warning' : 'danger'
                        }`}>{exp.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {isRoleAllowed(['Admin', 'Manager']) && exp.status === 'Pending' && (
                            <>
                              <button
                                className="action-btn"
                                title="Approve expense"
                                disabled={actionLoading === exp._id}
                                onClick={() => handleApprove(exp._id, 'Approved')}
                                style={{ opacity: actionLoading === exp._id ? 0.6 : 1 }}
                              >
                                {actionLoading === exp._id
                                  ? <Loader2 size={14} className="spinner-icon" />
                                  : <Check size={14} style={{ color: 'var(--accent-green)' }} />}
                              </button>
                              <button
                                className="action-btn delete"
                                title="Reject expense"
                                disabled={actionLoading === exp._id}
                                onClick={() => handleApprove(exp._id, 'Rejected')}
                                style={{ opacity: actionLoading === exp._id ? 0.6 : 1 }}
                              >
                                {actionLoading === exp._id
                                  ? <Loader2 size={14} className="spinner-icon" />
                                  : <X size={14} style={{ color: 'var(--accent-red)' }} />}
                              </button>
                            </>
                          )}
                          {isRoleAllowed(['Admin', 'Accountant']) && exp.reimbursementStatus === 'Pending' && (
                            <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} disabled={actionLoading === exp._id} onClick={() => handleApprove(exp._id, null, 'Reimbursed')}>
                              {actionLoading === exp._id ? <Loader2 size={14} className="spinner-icon" /> : 'Reimburse'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses Category Chart Breakdowns */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content', width: '100%' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', marginTop: 0, marginBottom: '16px' }}>
            <PieChart size={18} style={{ color: 'var(--primary)' }} /> <span>Category Cost Share</span>
          </h3>
          
          {reportLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Loader2 className="spinner-icon" size={20} />
            </div>
          ) : !profitLoss || Object.keys(profitLoss.expenseBreakdown).length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No costs documented for calculations.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(profitLoss.expenseBreakdown).map(([cat, amt]) => {
                const total = profitLoss.financials.totalExpenses || 1;
                const share = Math.round((amt / total) * 100);
                return (
                  <div key={cat} style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 500 }}>
                      <span>{cat}</span>
                      <span>₹{amt.toLocaleString('en-IN')} ({share}%)</span>
                    </div>
                    {/* Visual Progress bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${share}%`, 
                        height: '100%', 
                        background: cat === 'Rent' ? 'var(--accent-purple)' : 
                                    cat === 'Salaries' ? 'var(--primary)' : 
                                    cat === 'Utilities' ? 'var(--accent-cyan)' :
                                    cat === 'Raw Materials' ? 'var(--accent-green)' : 'var(--accent-orange)',
                        borderRadius: '4px' 
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- LOG EXPENSE MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Operating Cost</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-cat">Category *</label>
                  <select
                    id="exp-cat"
                    name="category"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-amount">Amount (₹) *</label>
                    <input id="exp-amount" type="number" name="amount" min="1" className="form-input" placeholder="Amount spent" style={{ paddingLeft: '16px' }} value={formData.amount} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-date">Date *</label>
                    <input id="exp-date" type="date" name="date" className="form-input" style={{ paddingLeft: '16px' }} value={formData.date} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-desc">Description / Reference Note</label>
                  <input id="exp-desc" type="text" name="description" className="form-input" placeholder="e.g. Electricity bill or raw materials invoice" style={{ paddingLeft: '16px' }} value={formData.description} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-emp">Assign to Employee (For reimbursement claim)</label>
                  <select
                    id="exp-emp"
                    name="employeeId"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.employeeId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Personal/Business Capital (No Employee) --</option>
                    {employees.map(e => (
                      <option key={e._id} value={e._id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-receipt">Receipt Image / PDF</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', gap: '6px', margin: 0 }}>
                      {uploading ? <Loader2 className="spinner-icon" size={14} /> : <Upload size={14} />}
                      {uploading ? 'Uploading...' : 'Attach Receipt'}
                      <input type="file" onChange={handleFileUpload} accept="image/*,application/pdf" style={{ display: 'none' }} disabled={uploading} />
                    </label>
                    {receiptUrl && (
                      <span style={{ fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Check size={14} /> Receipt Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Cost</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
