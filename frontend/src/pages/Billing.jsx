import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building,
  FileSpreadsheet, 
  Plus, 
  Search, 
  Eye, 
  CornerUpLeft, 
  AlertTriangle, 
  Loader2,
  X,
  Trash2,
  Printer,
  Calendar,
  CreditCard
} from 'lucide-react';

const Billing = () => {
  const { user, authFetch } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal toggles
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Payment states
  const [payAmount, setPayAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  // Invoice wizard form state
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    paymentMode: 'Cash',
    paidAmount: '',
    dueDate: '',
    items: [
      { productId: '', quantity: 1, discount: 0 }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [invRes, custRes, prodRes] = await Promise.all([
        authFetch('/invoices'),
        authFetch('/customers'),
        authFetch('/products')
      ]);

      const [invData, custData, prodData] = await Promise.all([
        invRes.json(),
        custRes.json(),
        prodRes.json()
      ]);

      if (invData.success) setInvoices(invData.data);
      if (custData.success) setCustomers(custData.data);
      if (prodData.success) setProducts(prodData.data);

    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvoiceFormChange = (e) => {
    setInvoiceForm({
      ...invoiceForm,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index][field] = value;
    setInvoiceForm({
      ...invoiceForm,
      items: updatedItems
    });
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { productId: '', quantity: 1, discount: 0 }]
    });
  };

  const removeInvoiceItem = (index) => {
    if (invoiceForm.items.length === 1) return;
    const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({
      ...invoiceForm,
      items: updatedItems
    });
  };

  // UI Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    invoiceForm.items.forEach(item => {
      const product = products.find(p => p._id === item.productId);
      if (product) {
        const itemPrice = product.sellingPrice;
        const discountVal = Number(item.discount || 0);
        const itemSubtotal = (itemPrice - discountVal) * Number(item.quantity || 1);
        const itemTax = (itemSubtotal * 18) / 100; // Fixed GST in backend is 18%

        subtotal += itemSubtotal;
        taxTotal += itemTax;
        discountTotal += (discountVal * Number(item.quantity || 1));
      }
    });

    const grandTotal = subtotal + taxTotal;

    return {
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal
    };
  };

  const totals = calculateTotals();

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSuccess('');

    // Validations
    if (!invoiceForm.customerId) {
      setModalError('Please select a customer.');
      return;
    }
    
    const invalidItems = invoiceForm.items.some(item => !item.productId || Number(item.quantity) <= 0);
    if (invalidItems) {
      setModalError('Please select valid products and positive quantities.');
      return;
    }

    const grandTotal = totals.grandTotal;
    let paidAmountVal = invoiceForm.paidAmount !== '' ? Number(invoiceForm.paidAmount) : null;

    if (paidAmountVal === null) {
      if (invoiceForm.paymentMode === 'Credit') {
        paidAmountVal = 0;
      } else {
        paidAmountVal = grandTotal;
      }
    }

    if (paidAmountVal > grandTotal) {
      setModalError(`Paid amount (₹${paidAmountVal}) cannot exceed the grand total (₹${grandTotal.toFixed(2)}).`);
      return;
    }

    if (paidAmountVal < 0) {
      setModalError('Paid amount cannot be negative.');
      return;
    }

    try {
      const response = await authFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customerId: invoiceForm.customerId,
          paymentMode: invoiceForm.paymentMode,
          paidAmount: paidAmountVal,
          dueDate: invoiceForm.dueDate || undefined,
          items: invoiceForm.items.map(i => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            discount: Number(i.discount)
          }))
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Invoice generated successfully!');
        setIsCreateModalOpen(false);
        fetchData();
        setSelectedInvoice(result.data);
        setIsDetailModalOpen(true);
        // Reset form
        setInvoiceForm({
          customerId: '',
          paymentMode: 'Cash',
          paidAmount: '',
          dueDate: '',
          items: [{ productId: '', quantity: 1, discount: 0 }]
        });
      } else {
        setModalError(result.message || 'Invoice generation failed');
      }
    } catch (err) {
      setModalError('Failed to contact invoice endpoint.');
    }
  };

  const handleProcessReturn = async (invoiceId) => {
    if (!window.confirm('Process full items return for this invoice? This will restore stock levels.')) return;
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`/invoices/${invoiceId}/return`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Invoice items returned and inventory updated.');
        setIsDetailModalOpen(false);
        fetchData();
      } else {
        setError(result.message || 'Return processing failed');
      }
    } catch (err) {
      setError('Failed to process return.');
    }
  };

  const handleRecordPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      setPayError('Please enter a valid amount.');
      return;
    }
    
    if (Number(payAmount) > selectedInvoice.outstandingAmount) {
      setPayError(`Payment cannot exceed outstanding balance of ₹${selectedInvoice.outstandingAmount.toFixed(2)}.`);
      return;
    }

    setPayLoading(true);
    setPayError('');
    try {
      const response = await authFetch(`/invoices/${selectedInvoice._id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(payAmount) })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Payment recorded successfully!');
        setSelectedInvoice(result.data);
        setPayAmount('');
        fetchData();
      } else {
        setPayError(result.message || 'Payment recording failed');
      }
    } catch (err) {
      setPayError('Failed to connect to payment endpoint.');
    } finally {
      setPayLoading(false);
    }
  };

  const viewInvoiceDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setPayAmount('');
    setPayError('');
    setIsDetailModalOpen(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-area').innerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach(styleNode => {
      doc.write(styleNode.outerHTML);
    });
    doc.write('</head><body style="background: white; padding: 20px;">');
    doc.write(printContent);
    doc.write('</body></html>');
    doc.close();
    
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  const isRoleAllowed = (roles) => {
    return user && roles.includes(user.role);
  };

  const filteredInvoices = invoices.filter(inv => {
    const custName = inv.customerId?.name || '';
    const invNum = inv.invoiceNumber || '';
    return custName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           invNum.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Messages */}
      {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
      {success && <div className="success-message"><AlertTriangle size={16} /> {success}</div>}

      {/* Action panel */}
      <div className="page-actions-row">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isRoleAllowed(['Admin', 'Manager', 'Staff']) && (
          <button className="btn btn-primary" onClick={() => { setModalError(''); setError(''); setSuccess(''); setIsCreateModalOpen(true); }}>
            <Plus size={16} />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {/* Invoice Ledger Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="spinner-icon" size={32} />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <FileSpreadsheet size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No invoices found in record ledger.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Billing Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv._id}>
                  <td><strong style={{ color: 'var(--primary)' }}>{inv.invoiceNumber}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.customerId?.name || 'Walk-in Customer'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inv.customerId?.phone}</div>
                  </td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-pill ${
                      inv.status === 'Paid' ? 'success' :
                      inv.status === 'Unpaid' ? 'danger' :
                      inv.status === 'Partially Paid' ? 'warning' : 'neutral'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CreditCard size={13} className="sidebar-icon" />
                      {inv.paymentMode}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn" title="View details" onClick={() => viewInvoiceDetail(inv)}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- CREATE INVOICE MODAL --- */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Sales Invoice</h3>
              <button className="modal-close-btn" onClick={() => { setIsCreateModalOpen(false); setModalError(''); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {modalError && <div className="error-message"><AlertTriangle size={16} /> {modalError}</div>}
                {/* Customer dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="billing-customer">Select Customer *</label>
                  <select
                    id="billing-customer"
                    name="customerId"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={invoiceForm.customerId}
                    onChange={handleInvoiceFormChange}
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                {/* Items listing builder */}
                <div className="form-group">
                  <div className="invoice-items-header">
                    <span>Product Item</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span>Discount (₹)</span>
                    <span>Actions</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {invoiceForm.items.map((item, idx) => {
                      const selectedProd = products.find(p => p._id === item.productId);
                      const availableStock = selectedProd ? selectedProd.stockQuantity : 0;
                      return (
                        <div key={idx} className="invoice-item-row">
                          <select
                            className="form-input"
                            style={{ paddingLeft: '12px' }}
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            required
                          >
                            <option value="">-- Choose Item --</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id} disabled={p.stockQuantity <= 0}>
                                {p.name} (Stock: {p.stockQuantity} {p.unit}) - ₹{p.sellingPrice}
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="number"
                            min="1"
                            max={availableStock || undefined}
                            placeholder="Qty"
                            className="form-input"
                            style={{ paddingLeft: '12px' }}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            required
                          />
                          
                          <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '12px' }}
                            value={selectedProd ? `₹${selectedProd.sellingPrice}` : '-'}
                            disabled
                          />
                          
                          <input
                            type="number"
                            min="0"
                            placeholder="Discount"
                            className="form-input"
                            style={{ paddingLeft: '12px' }}
                            value={item.discount}
                            onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                          />
                          
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => removeInvoiceItem(idx)}
                            disabled={invoiceForm.items.length === 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'max-content', marginTop: '10px' }}
                    onClick={addInvoiceItem}
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                {/* Subtotals & Payment parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="billing-payment">Payment Mode</label>
                    <select
                      id="billing-payment"
                      name="paymentMode"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      value={invoiceForm.paymentMode}
                      onChange={handleInvoiceFormChange}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="billing-paidAmount">Paid Amount (₹)</label>
                    <input
                      id="billing-paidAmount"
                      type="number"
                      name="paidAmount"
                      placeholder={`Total: ₹${totals.grandTotal}`}
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      value={invoiceForm.paidAmount}
                      onChange={handleInvoiceFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="billing-dueDate">Due Date (For Unpaid/Credit Sales)</label>
                  <input
                    id="billing-dueDate"
                    type="date"
                    name="dueDate"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={invoiceForm.dueDate}
                    onChange={handleInvoiceFormChange}
                  />
                </div>

                {/* Calculation Summary Box */}
                <div className="invoice-totals">
                  <div className="invoice-total-row">
                    <span>Taxable Subtotal:</span>
                    <strong>₹{totals.subtotal.toFixed(2)}</strong>
                  </div>
                  <div className="invoice-total-row">
                    <span>Discount Deducted:</span>
                    <strong>-₹{totals.discountTotal.toFixed(2)}</strong>
                  </div>
                  <div className="invoice-total-row">
                    <span>GST (18%):</span>
                    <strong>₹{totals.taxTotal.toFixed(2)}</strong>
                  </div>
                  <div className="invoice-total-row grand">
                    <span>Grand Total:</span>
                    <strong>₹{totals.grandTotal.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setIsCreateModalOpen(false); setModalError(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE VIEW DETAIL MODAL --- */}
      {isDetailModalOpen && selectedInvoice && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Sales Invoice Details</h3>
              <button className="modal-close-btn" onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              {/* Receipt Area */}
              <div id="print-area" className="printable-invoice">
                <div className="invoice-top-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {user?.businessId?.logo ? (
                      <img src={user.businessId.logo} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '6px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                    )}
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>{user?.businessId?.name || 'BIZOS INVOICE'}</h2>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.businessId?.address || 'Operations Ledger Receipt'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{selectedInvoice.invoiceNumber}</h3>
                    <span style={{ fontSize: '12px' }}>Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="invoice-bill-grid">
                  <div>
                    <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Billed To:</strong>
                    <strong>{selectedInvoice.customerId?.name}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Phone: {selectedInvoice.customerId?.phone}</p>
                    {selectedInvoice.customerId?.email && <p style={{ margin: '2px 0 0 0', fontSize: '13px' }}>Email: {selectedInvoice.customerId?.email}</p>}
                    {selectedInvoice.customerId?.address && <p style={{ margin: '2px 0 0 0', fontSize: '13px' }}>Address: {selectedInvoice.customerId?.address}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Status Summary:</strong>
                    <span className={`status-pill ${
                      selectedInvoice.status === 'Paid' ? 'success' :
                      selectedInvoice.status === 'Unpaid' ? 'danger' :
                      selectedInvoice.status === 'Partially Paid' ? 'warning' : 'neutral'
                    }`} style={{ display: 'inline-block' }}>
                      {selectedInvoice.status}
                    </span>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Payment Mode: <strong>{selectedInvoice.paymentMode}</strong></p>
                    {selectedInvoice.dueDate && <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--accent-red)' }}>Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>}
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0' }}>Product / Service</th>
                      <th style={{ textAlign: 'center', padding: '8px 0' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px 0' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '8px 0' }}>GST</th>
                      <th style={{ textAlign: 'right', padding: '8px 0' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                        <td style={{ padding: '10px 0' }}>{item.name}</td>
                        <td style={{ textAlign: 'center', padding: '10px 0' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '10px 0' }}>₹{(item.sellingPrice - item.discount).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '10px 0' }}>₹{item.taxAmount.toFixed(2)} ({item.taxRate}%)</td>
                        <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: 600 }}>₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginTop: '24px', borderTop: '2px solid var(--border-color)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '32px', fontSize: '13px' }}>
                    <span>Taxable Subtotal:</span>
                    <strong>₹{selectedInvoice.subtotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '32px', fontSize: '13px' }}>
                    <span>CGST/SGST Total:</span>
                    <strong>₹{selectedInvoice.taxTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '32px', fontSize: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span>Grand Total:</span>
                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>₹{selectedInvoice.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '32px', fontSize: '13px', color: 'var(--accent-green)' }}>
                    <span>Amount Paid:</span>
                    <strong>₹{selectedInvoice.paidAmount.toFixed(2)}</strong>
                  </div>
                  {selectedInvoice.outstandingAmount > 0 && (
                    <div style={{ display: 'flex', gap: '32px', fontSize: '13px', color: 'var(--accent-red)' }}>
                      <span>Outstanding Balance:</span>
                      <strong>₹{selectedInvoice.outstandingAmount.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
                
                {/* Print Branding Footer */}
                <div className="print-footer" style={{ display: 'none' }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>Thank you for your business!</p>
                  <p style={{ fontSize: '7pt', margin: '2px 0 0 0' }}>Generated via BizOS MSME Management System</p>
                </div>
              </div>
              
              {selectedInvoice.outstandingAmount > 0 && selectedInvoice.status !== 'Returned' && (
                <div className="no-print" style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  background: 'var(--primary-light)', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-color)', 
                  width: '100%',
                  color: 'var(--text-primary)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={16} color="var(--primary)" /> Record Customer Payment
                  </h4>
                  {payError && <div className="error-message" style={{ marginBottom: '8px' }}>{payError}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder={`Enter amount (max ₹${selectedInvoice.outstandingAmount.toFixed(2)})`}
                      className="form-input"
                      style={{ paddingLeft: '12px', flexGrow: 1, background: 'var(--bg-secondary)' }}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      max={selectedInvoice.outstandingAmount}
                      min="1"
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ padding: '0 16px', height: '42px', flexShrink: 0 }}
                      onClick={handleRecordPayment}
                      disabled={payLoading}
                    >
                      {payLoading ? 'Processing...' : 'Pay'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {isRoleAllowed(['Admin', 'Manager']) && selectedInvoice.status !== 'Returned' && (
                <button type="button" className="btn btn-outline" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)', marginRight: 'auto' }} onClick={() => handleProcessReturn(selectedInvoice._id)}>
                  <CornerUpLeft size={16} /> Process Return
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={16} /> Print Receipt
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsDetailModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
