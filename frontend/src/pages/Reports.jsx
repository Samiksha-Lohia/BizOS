import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building,
  FileText, 
  Calendar, 
  RefreshCw, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Tag, 
  Layers,
  Percent,
  Download,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const Reports = () => {
  const { token, user } = useAuth();
  const [reportType, setReportType] = useState('gst'); // 'gst', 'sales', 'inventory'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);
    try {
      const url = `/dashboard/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.message || 'Failed to fetch report metrics.');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReport();
    }
  }, [token, reportType]); // Refetch when token or report type change

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Query Filters Panel */}
      <div className="glass-panel no-print" style={{ padding: '20px' }}>
        <form onSubmit={handleQuerySubmit} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div className="form-group" style={{ flex: '1', minWidth: '220px' }}>
            <label className="form-label" htmlFor="rep-type">Report Category</label>
            <select 
              id="rep-type" 
              className="form-input" 
              value={reportType} 
              onChange={(e) => {
                setReportData(null);
                setReportType(e.target.value);
              }}
            >
              <option value="gst">GST Tax Compliance Report</option>
              <option value="sales">Sales & Invoicing Ledger</option>
              <option value="inventory">Inventory Stock Valuation Sheet</option>
            </select>
          </div>

          {reportType !== 'inventory' && (
            <>
              <div className="form-group" style={{ minWidth: '150px' }}>
                <label className="form-label" htmlFor="rep-start">From Date</label>
                <input 
                  id="rep-start" 
                  type="date" 
                  className="form-input" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ minWidth: '150px' }}>
                <label className="form-label" htmlFor="rep-end">To Date</label>
                <input 
                  id="rep-end" 
                  type="date" 
                  className="form-input" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '42px', display: 'flex', gap: '8px' }} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinner-icon' : ''} /> Generate
            </button>
            {reportData && (
              <button type="button" className="btn btn-secondary" style={{ height: '42px', display: 'flex', gap: '8px' }} onClick={handlePrint}>
                <Printer size={16} /> Print
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Errors */}
      {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="spinner-icon" size={36} />
        </div>
      )}

      {/* Report rendering block */}
      {!loading && reportData && (
        <div className="printable-report-area">
          
          {/* Printable Report Header */}
          <div className="print-header" style={{ display: 'none', borderBottom: '2px solid var(--primary)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user?.businessId?.logo ? (
                  <img src={user.businessId.logo} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '6px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={24} style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{user?.businessId?.name?.toUpperCase() || 'BIZOS MSME SYSTEM'}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.businessId?.address || 'Management System Report'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  {reportType === 'gst' ? 'GST Compliance Tax Report' :
                   reportType === 'sales' ? 'Sales Ledger Report' : 'Inventory Valuation Sheet'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {reportType !== 'inventory' 
                    ? `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                    : `Valued: ${new Date().toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* REPORT RENDER: GST COMPLIANCE */}
          {reportType === 'gst' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Stats highlights */}
              <div className="kpis-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                
                <div className="kpi-card glass-panel revenue">
                  <div className="kpi-header">
                    <span className="kpi-title">Gross Turnover</span>
                    <div className="kpi-icon-box"><DollarSign size={18} /></div>
                  </div>
                  <span className="kpi-value">₹{reportData.totalSalesAmount?.toLocaleString('en-IN') || 0}</span>
                  <span className="kpi-trend neutral">Total invoice volume</span>
                </div>

                <div className="kpi-card glass-panel info">
                  <div className="kpi-header">
                    <span className="kpi-title">Taxable Value</span>
                    <div className="kpi-icon-box"><Layers size={18} /></div>
                  </div>
                  <span className="kpi-value">₹{reportData.taxableValue?.toLocaleString('en-IN') || 0}</span>
                  <span className="kpi-trend neutral">Before taxes</span>
                </div>

                <div className="kpi-card glass-panel expense">
                  <div className="kpi-header">
                    <span className="kpi-title">Total GST Collected</span>
                    <div className="kpi-icon-box"><Percent size={18} /></div>
                  </div>
                  <span className="kpi-value">₹{reportData.totalGstCollected?.toLocaleString('en-IN') || 0}</span>
                  <span className="kpi-trend neutral">CGST + SGST breakdown</span>
                </div>

              </div>

              {/* GST breakdown table */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>CA-Ready Tax breakdown</h3>
                <div className="table-wrapper">
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Tax Category</th>
                        <th>Rate (Combined)</th>
                        <th>Taxable Subtotal</th>
                        <th>Calculated Tax Collected</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>CGST (Central Tax)</strong></td>
                        <td>9%</td>
                        <td>₹{reportData.taxableValue?.toLocaleString('en-IN') || 0}</td>
                        <td style={{ color: 'var(--accent-red)', fontWeight: 700 }}>₹{reportData.cgst?.toLocaleString('en-IN') || 0}</td>
                      </tr>
                      <tr>
                        <td><strong>SGST (State Tax)</strong></td>
                        <td>9%</td>
                        <td>₹{reportData.taxableValue?.toLocaleString('en-IN') || 0}</td>
                        <td style={{ color: 'var(--accent-red)', fontWeight: 700 }}>₹{reportData.sgst?.toLocaleString('en-IN') || 0}</td>
                      </tr>
                      <tr style={{ background: 'var(--border-color)', fontWeight: 800 }}>
                        <td>Total GST Accumulated</td>
                        <td>18%</td>
                        <td>₹{reportData.taxableValue?.toLocaleString('en-IN') || 0}</td>
                        <td style={{ color: 'var(--primary)' }}>₹{reportData.totalGstCollected?.toLocaleString('en-IN') || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT RENDER: SALES LEDGER */}
          {reportType === 'sales' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Sales Ledger Registry</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Total Invoices: <strong>{reportData.length}</strong>
                </span>
              </h3>

              {!Array.isArray(reportData) || reportData.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No transactions found for this period.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Subtotal</th>
                        <th>Taxes</th>
                        <th>Total Amount</th>
                        <th>Mode</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((inv) => (
                        <tr key={inv._id}>
                          <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.invoiceNumber}</span></td>
                          <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td>{inv.customerId?.name || 'Retail Cash Customer'}</td>
                          <td>₹{inv.subtotal.toLocaleString('en-IN')}</td>
                          <td>₹{inv.taxTotal.toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 700 }}>₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                          <td><span style={{ fontSize: '11px', fontWeight: 600 }}>{inv.paymentMode}</span></td>
                          <td>
                            <span className={`status-pill ${
                              inv.status === 'Paid' ? 'success' :
                              inv.status === 'Unpaid' ? 'danger' : 'warning'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REPORT RENDER: INVENTORY VALUATION */}
          {reportType === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Highlight Cards */}
              <div className="kpis-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                
                <div className="kpi-card glass-panel info">
                  <div className="kpi-header">
                    <span className="kpi-title">Catalog Size</span>
                    <div className="kpi-icon-box"><Layers size={18} /></div>
                  </div>
                  <span className="kpi-value">{reportData.productsCount}</span>
                  <span className="kpi-trend neutral">Total product codes</span>
                </div>

                <div className="kpi-card glass-panel expense">
                  <div className="kpi-header">
                    <span className="kpi-title">Valuation (Purchase Cost)</span>
                    <div className="kpi-icon-box"><DollarSign size={18} /></div>
                  </div>
                  <span className="kpi-value">₹{reportData.totalCostValuation?.toLocaleString('en-IN') || 0}</span>
                  <span className="kpi-trend neutral">Asset value at cost</span>
                </div>

                <div className="kpi-card glass-panel revenue">
                  <div className="kpi-header">
                    <span className="kpi-title">Valuation (Retail value)</span>
                    <div className="kpi-icon-box"><TrendingUp size={18} /></div>
                  </div>
                  <span className="kpi-value">₹{reportData.totalRetailValuation?.toLocaleString('en-IN') || 0}</span>
                  <span className="kpi-trend up">
                    Margin: ₹{(reportData.totalRetailValuation - reportData.totalCostValuation)?.toLocaleString('en-IN') || 0}
                  </span>
                </div>

              </div>

              {/* Products Inventory detail table */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>Stock Valuation Ledger</h3>
                
                {!reportData.items || !Array.isArray(reportData.items) || reportData.items.length === 0 ? (
                  <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>No products cataloged.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Unit</th>
                          <th>Cost Price</th>
                          <th>Selling Price</th>
                          <th>Total Cost Val.</th>
                          <th>Total Retail Val.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.items.map((prod) => {
                          const costVal = prod.stockQuantity * prod.purchasePrice;
                          const retailVal = prod.stockQuantity * prod.sellingPrice;
                          return (
                            <tr key={prod._id}>
                              <td><strong>{prod.name}</strong></td>
                              <td><span className="status-pill info">{prod.category}</span></td>
                              <td style={{ fontWeight: 700, color: prod.stockQuantity <= prod.minStockLevel ? 'var(--accent-red)' : 'inherit' }}>
                                {prod.stockQuantity}
                              </td>
                              <td>{prod.unit}</td>
                              <td>₹{prod.purchasePrice}</td>
                              <td>₹{prod.sellingPrice}</td>
                              <td style={{ fontWeight: 600 }}>₹{costVal.toLocaleString('en-IN')}</td>
                              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{retailVal.toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Printable Report Footer */}
          <div className="print-footer" style={{ display: 'none' }}>
            <span>© {new Date().getFullYear()} {user?.businessId?.name || 'BizOS Business'} - Confidentially generated for authorized CA/Audits</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
