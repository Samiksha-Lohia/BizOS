import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  Loader2,
  X,
  Award,
  CreditCard
} from 'lucide-react';

const CRM = () => {
  const { user, authFetch } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    tags: 'Retail',
    outstandingBalance: '0',
    loyaltyPoints: '0'
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      let url = `/api/v1/customers?search=${searchQuery}`;
      if (tagFilter) {
        url += `&tag=${tagFilter}`;
      }
      const res = await authFetch(url);
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data);
      } else {
        setError(result.message || 'Could not load customers');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, tagFilter]);

  const openPaymentModal = (customer) => {
    setCurrentCustomer(customer);
    setPaymentAmount(customer.outstandingBalance.toString());
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPaymentLoading(true);

    try {
      const res = await authFetch(`/api/v1/customers/${currentCustomer._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(paymentAmount) })
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(result.message || 'Payment recorded successfully.');
        setIsPaymentModalOpen(false);
        setPaymentAmount('');
        fetchCustomers();
      } else {
        setError(result.message || 'Could not record payment.');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await authFetch('/api/v1/customers', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          outstandingBalance: Number(formData.outstandingBalance),
          loyaltyPoints: Number(formData.loyaltyPoints)
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Customer profile created successfully!');
        setIsAddModalOpen(false);
        fetchCustomers();
      } else {
        setError(result.message || 'Creation failed');
      }
    } catch (err) {
      setError('Failed to create customer.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await authFetch(`/api/v1/customers/${currentCustomer._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          gstin: formData.gstin,
          tags: tagsArray,
          outstandingBalance: Number(formData.outstandingBalance),
          loyaltyPoints: Number(formData.loyaltyPoints)
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Customer profile updated successfully!');
        setIsEditModalOpen(false);
        fetchCustomers();
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      setError('Failed to update customer.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`/api/v1/customers/${customerId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Customer deleted successfully');
        fetchCustomers();
      } else {
        setError(result.message || 'Delete failed');
      }
    } catch (err) {
      setError('Failed to delete customer.');
    }
  };

  const viewPurchaseHistory = async (customer) => {
    setCurrentCustomer(customer);
    setIsHistoryModalOpen(true);
    setPurchasesLoading(true);
    setPurchases([]);
    try {
      const res = await authFetch(`/api/v1/customers/${customer._id}/purchases`);
      const result = await res.json();
      if (result.success) {
        setPurchases(result.data);
      }
    } catch (err) {
      console.error('Failed to load purchases history:', err);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      tags: 'Retail',
      outstandingBalance: '0',
      loyaltyPoints: '0'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      gstin: customer.gstin || '',
      tags: customer.tags ? customer.tags.join(', ') : 'Retail',
      outstandingBalance: customer.outstandingBalance.toString(),
      loyaltyPoints: customer.loyaltyPoints.toString()
    });
    setIsEditModalOpen(true);
  };

  const isRoleAllowed = (roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Notifications */}
      {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
      {success && <div className="success-message"><AlertTriangle size={16} /> {success}</div>}

      {/* Top Bar actions */}
      <div className="page-actions-row">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search name or phone..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-input"
            style={{ width: '160px', padding: '10px 16px' }}
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="VIP">VIP</option>
            <option value="Credit">Credit Customer</option>
          </select>
          
          {isRoleAllowed(['Admin', 'Manager', 'Staff']) && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Customers Data Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="spinner-icon" size={32} />
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No customer profiles found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Details</th>
                <th>Address & Tax ID</th>
                <th>Dues Balance</th>
                <th>Loyalty Points</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cust.name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Phone size={12} className="sidebar-icon" />
                      {cust.phone}
                    </div>
                    {cust.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <Mail size={12} className="sidebar-icon" />
                        {cust.email}
                      </div>
                    )}
                  </td>
                  <td>
                    {cust.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <MapPin size={12} className="sidebar-icon" />
                        {cust.address}
                      </div>
                    )}
                    {cust.gstin && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        GSTIN: <strong>{cust.gstin}</strong>
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: cust.outstandingBalance > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                      <Award size={14} color="var(--accent-orange)" />
                      {cust.loyaltyPoints} pts
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {cust.tags?.map((t, idx) => (
                        <span key={idx} className="status-pill info" style={{ fontSize: '10px', padding: '2px 6px' }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                       <button className="action-btn" title="Purchase History" onClick={() => viewPurchaseHistory(cust)}>
                        <Eye size={16} />
                      </button>
                      {cust.outstandingBalance > 0 && isRoleAllowed(['Admin', 'Manager', 'Staff']) && (
                        <button className="action-btn" title="Record Payment" onClick={() => openPaymentModal(cust)}>
                          <CreditCard size={16} style={{ color: 'var(--accent-red)' }} />
                        </button>
                      )}
                      {isRoleAllowed(['Admin', 'Manager', 'Staff']) && (
                        <button className="action-btn" title="Edit Customer" onClick={() => openEditModal(cust)}>
                          <Edit size={16} />
                        </button>
                      )}
                      {isRoleAllowed(['Admin']) && (
                        <button className="action-btn delete" title="Delete Profile" onClick={() => handleDeleteCustomer(cust._id)}>
                          <Trash2 size={16} />
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

      {/* --- ADD CUSTOMER MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Add Customer Ledger Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-name">Customer Name *</label>
                  <input id="cust-name" type="text" name="name" className="form-input" placeholder="e.g. Rahul Sharma" style={{ paddingLeft: '16px' }} value={formData.name} onChange={handleInputChange} required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-phone">Phone Number *</label>
                    <input id="cust-phone" type="text" name="phone" className="form-input" placeholder="e.g. +91 98765 43210" style={{ paddingLeft: '16px' }} value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-email">Email Address</label>
                    <input id="cust-email" type="email" name="email" className="form-input" placeholder="rahul@gmail.com" style={{ paddingLeft: '16px' }} value={formData.email} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cust-address">Shipping/Billing Address</label>
                  <textarea id="cust-address" name="address" className="form-input" style={{ paddingLeft: '16px', height: '60px', resize: 'none' }} placeholder="Plot 21, Sector 4..." value={formData.address} onChange={handleInputChange}></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-gstin">GSTIN (Tax ID)</label>
                    <input id="cust-gstin" type="text" name="gstin" className="form-input" placeholder="07AAAAA1111A1Z1" style={{ paddingLeft: '16px' }} value={formData.gstin} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-tags">Tags (Comma-separated)</label>
                    <input id="cust-tags" type="text" name="tags" className="form-input" placeholder="Retail, VIP, Wholesale" style={{ paddingLeft: '16px' }} value={formData.tags} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-balance">Initial Outstanding Balance (₹)</label>
                    <input id="cust-balance" type="number" name="outstandingBalance" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.outstandingBalance} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-points">Initial Loyalty Points</label>
                    <input id="cust-points" type="number" name="loyaltyPoints" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.loyaltyPoints} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CUSTOMER MODAL --- */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Edit Customer Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-cust-name">Customer Name *</label>
                  <input id="edit-cust-name" type="text" name="name" className="form-input" style={{ paddingLeft: '16px' }} value={formData.name} onChange={handleInputChange} required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cust-phone">Phone Number *</label>
                    <input id="edit-cust-phone" type="text" name="phone" className="form-input" style={{ paddingLeft: '16px' }} value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cust-email">Email Address</label>
                    <input id="edit-cust-email" type="email" name="email" className="form-input" style={{ paddingLeft: '16px' }} value={formData.email} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-cust-address">Address</label>
                  <textarea id="edit-cust-address" name="address" className="form-input" style={{ paddingLeft: '16px', height: '60px', resize: 'none' }} value={formData.address} onChange={handleInputChange}></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cust-gstin">GSTIN (Tax ID)</label>
                    <input id="edit-cust-gstin" type="text" name="gstin" className="form-input" style={{ paddingLeft: '16px' }} value={formData.gstin} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cust-tags">Tags (Comma-separated)</label>
                    <input id="edit-cust-tags" type="text" name="tags" className="form-input" style={{ paddingLeft: '16px' }} value={formData.tags} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cust-balance">Outstanding Balance (₹)</label>
                    <input id="edit-cust-balance" type="number" name="outstandingBalance" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.outstandingBalance} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cust-points">Loyalty Points</label>
                    <input id="edit-cust-points" type="number" name="loyaltyPoints" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.loyaltyPoints} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HISTORY / PURCHASES MODAL --- */}
      {isHistoryModalOpen && currentCustomer && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Purchase History: {currentCustomer.name}</h3>
              <button className="modal-close-btn" onClick={() => setIsHistoryModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {purchasesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                  <Loader2 className="spinner-icon" size={24} />
                </div>
              ) : purchases.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>No purchase invoices recorded for this customer.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {purchases.map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)' }}>
                      <div>
                        <strong style={{ color: 'var(--primary)' }}>{p.invoiceNumber}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Date: {new Date(p.createdAt).toLocaleDateString()}</span>
                        <span className={`status-pill ${p.status === 'Paid' ? 'success' : 'warning'}`} style={{ fontSize: '10px', marginTop: '6px', padding: '2px 6px' }}>{p.status}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '15px' }}>₹{p.totalAmount}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{p.items.length} product units</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setIsHistoryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECORD CUSTOMER PAYMENT MODAL --- */}
      {isPaymentModalOpen && currentCustomer && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Dues Payment</h3>
              <button className="modal-close-btn" onClick={() => setIsPaymentModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Record payment for <strong>{currentCustomer.name}</strong> to clear outstanding dues.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current Outstanding Dues:</span>
                    <strong style={{ color: 'var(--accent-red)' }}>₹{currentCustomer.outstandingBalance.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="payment-amount">Payment Amount (₹)</label>
                  <input
                    id="payment-amount"
                    type="number"
                    min="1"
                    max={currentCustomer.outstandingBalance}
                    required
                    className="form-input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
                  {paymentLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
