import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  ShoppingBag, 
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/v1/dashboard');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Could not fetch dashboard metrics');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexGrow: 1 }}>
        <Loader2 className="spinner-icon" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message" style={{ margin: '24px' }}>
        <AlertTriangle size={18} /> {error}
      </div>
    );
  }

  const {
    todaySales = 0,
    yesterdaySales = 0,
    outstandingReceivables = 0,
    topDebtors = [],
    lowStockAlertsCount = 0,
    lowStockAlerts = [],
    todayExpenses = 0,
    employeeAttendance = { total: 0, present: 0, absent: 0 },
    monthlySnapshot = { revenue: 0, expenses: 0, profitOrLoss: 0 },
    topProducts = [],
    topCustomers = []
  } = data || {};

  const totalEmp = employeeAttendance.total || 0;
  const presentEmp = employeeAttendance.present || 0;
  const attendanceRate = totalEmp > 0 ? Math.round((presentEmp / totalEmp) * 100) : 0;

  // Render comparative values for our charts
  const salesIncrease = todaySales >= yesterdaySales;
  const pctDiff = yesterdaySales > 0 ? Math.round((Math.abs(todaySales - yesterdaySales) / yesterdaySales) * 100) : 0;

  // Check if ledger is empty to render mock/demo data for analysis
  const isDemoMode = (monthlySnapshot.revenue === 0 && todaySales === 0 && todayExpenses === 0);

  // Dynamic or fallback values
  const displayTodaySales = isDemoMode ? 12500 : todaySales;
  const displayTodayExpenses = isDemoMode ? 8200 : todayExpenses;

  const displayMonthlyRevenue = isDemoMode ? 320000 : monthlySnapshot.revenue;
  const displayMonthlyExpenses = isDemoMode ? 210000 : monthlySnapshot.expenses;

  // Calculate dynamic daily averages of the current month
  console.log("CHART_LOG: " + JSON.stringify({
    isDemoMode,
    todaySales, todayExpenses,
    displayTodaySales, displayTodayExpenses,
    monthlyRevenue: monthlySnapshot.revenue,
    monthlyExpenses: monthlySnapshot.expenses,
    displayMonthlyRevenue, displayMonthlyExpenses
  }));
  const currentDay = new Date().getDate();
  const avgDailySales = (displayMonthlyRevenue || 0) / currentDay;
  const avgDailyExpenses = (displayMonthlyExpenses || 0) / currentDay;
  const maxAvg = Math.max(avgDailySales, avgDailyExpenses);
  const avgSalesHeight = maxAvg > 0 ? `${Math.min(100, Math.max(10, (avgDailySales / maxAvg) * 100))}%` : '4px';
  const avgExpenseHeight = maxAvg > 0 ? `${Math.min(100, Math.max(10, (avgDailyExpenses / maxAvg) * 100))}%` : '4px';

  return (
    <div className="dashboard-content">
      {/* Intro banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary)" /> BizOS Insights Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Live operations ledger, financial analytics, and team status.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>Refresh</button>
          <Link to="/dashboard/billing">
            <button className="btn btn-primary btn-sm">New Invoice</button>
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="kpis-grid">
        {/* KPI: Monthly Revenue */}
        <div className="kpi-card glass-panel revenue">
          <div className="kpi-header">
            <span className="kpi-title">Monthly Revenue</span>
            <div className="kpi-icon-box">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="kpi-value">₹{monthlySnapshot.revenue.toLocaleString('en-IN')}</span>
          <div className={`kpi-trend ${salesIncrease ? 'up' : 'down'}`}>
            {salesIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{pctDiff}% vs yesterday</span>
          </div>
        </div>

        {/* KPI: Monthly Expenses */}
        <div className="kpi-card glass-panel expense">
          <div className="kpi-header">
            <span className="kpi-title">Monthly Expenses</span>
            <div className="kpi-icon-box">
              <TrendingDown size={20} />
            </div>
          </div>
          <span className="kpi-value">₹{monthlySnapshot.expenses.toLocaleString('en-IN')}</span>
          <div className="kpi-trend neutral">
            <Calendar size={14} />
            <span>This calendar month</span>
          </div>
        </div>

        {/* KPI: Monthly Net Profit */}
        <div className="kpi-card glass-panel profit">
          <div className="kpi-header">
            <span className="kpi-title">Net Profit</span>
            <div className="kpi-icon-box">
              <TrendingUp size={20} />
            </div>
          </div>
          <span className="kpi-value" style={{ color: monthlySnapshot.profitOrLoss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            ₹{monthlySnapshot.profitOrLoss.toLocaleString('en-IN')}
          </span>
          <div className={`kpi-trend ${monthlySnapshot.profitOrLoss >= 0 ? 'up' : 'down'}`}>
            <span>Margin: {monthlySnapshot.revenue > 0 ? Math.round((monthlySnapshot.profitOrLoss / monthlySnapshot.revenue) * 100) : 0}%</span>
          </div>
        </div>

        {/* KPI: Team Attendance */}
        <div className="kpi-card glass-panel attendance">
          <div className="kpi-header">
            <span className="kpi-title">Attendance Rate</span>
            <div className="kpi-icon-box">
              <Users size={20} />
            </div>
          </div>
          <span className="kpi-value">{attendanceRate}%</span>
          <div className="kpi-trend info">
            <span>{presentEmp} / {totalEmp} staff present today</span>
          </div>
        </div>
      </div>

      {/* Grid of charts and metrics */}
      <div className="dashboard-grid-two">
        {/* Sales vs Expenses chart */}
        <div className="chart-card glass-panel">
          <h3 className="card-title">
            Income & Expense Overview
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
              {isDemoMode ? 'Comparison Overview (Sample Analytics)' : 'Comparison Overview'}
            </span>
          </h3>
          <div className="custom-chart-wrapper">
            <div className="chart-bars-container">
              {/* Today */}
              <div className="chart-bar-group">
                <div className="dual-bars">
                  <div className="bar-sales" style={{ height: displayTodaySales > 0 ? `${Math.min(100, Math.max(10, (displayTodaySales / Math.max(displayTodaySales, displayTodayExpenses)) * 100))}%` : '4px' }}></div>
                  <div className="bar-expense" style={{ height: displayTodayExpenses > 0 ? `${Math.min(100, Math.max(10, (displayTodayExpenses / Math.max(displayTodaySales, displayTodayExpenses)) * 100))}%` : '4px' }}></div>
                </div>
                <span className="chart-label-x">Today</span>
              </div>

              {/* Monthly totals */}
              <div className="chart-bar-group">
                <div className="dual-bars">
                  <div className="bar-sales" style={{ height: displayMonthlyRevenue > 0 ? `${Math.min(100, Math.max(10, (displayMonthlyRevenue / Math.max(displayMonthlyRevenue, displayMonthlyExpenses)) * 100))}%` : '4px' }}></div>
                  <div className="bar-expense" style={{ height: displayMonthlyExpenses > 0 ? `${Math.min(100, Math.max(10, (displayMonthlyExpenses / Math.max(displayMonthlyRevenue, displayMonthlyExpenses)) * 100))}%` : '4px' }}></div>
                </div>
                <span className="chart-label-x">Monthly</span>
              </div>

              {/* Targets */}
              <div className="chart-bar-group">
                <div className="dual-bars">
                  <div className="bar-sales" style={{ height: avgSalesHeight, opacity: 0.6 }} title={`Avg Daily Sales: ₹${avgDailySales.toFixed(2)}`}></div>
                  <div className="bar-expense" style={{ height: avgExpenseHeight, opacity: 0.6 }} title={`Avg Daily Expenses: ₹${avgDailyExpenses.toFixed(2)}`}></div>
                </div>
                <span className="chart-label-x">Averages</span>
              </div>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: 'var(--accent-green)' }}></span>
                <span>Revenue (Sales)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: 'var(--accent-red)' }}></span>
                <span>Operating Expense</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Debtors */}
        <div className="recent-activities-card glass-panel" style={{ height: 'auto' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            Immediate Alerts
            {lowStockAlertsCount > 0 && <span className="status-pill danger" style={{ fontSize: '10px' }}>{lowStockAlertsCount} stock alerts</span>}
          </h3>
          
          <div className="activity-list" style={{ maxHeight: '280px' }}>
            {lowStockAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                <ShoppingBag size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p>All product stocks are stable.</p>
              </div>
            ) : (
              lowStockAlerts.map((prod, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon-box" style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red)' }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="activity-text">
                    <span className="activity-desc">{prod.name} running low</span>
                    <span className="activity-time">Current stock: {prod.quantity} (Min threshold: {prod.minLevel})</span>
                  </div>
                  <Link to="/dashboard/inventory" className="action-btn" style={{ width: 'auto', padding: '0 8px', fontSize: '11px', fontWeight: 600 }}>
                    Restock
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Top Debtors overview */}
          <h3 className="card-title" style={{ marginTop: '20px', marginBottom: '12px', fontSize: '14px' }}>
            Top Outstanding Credits
          </h3>
          <div className="activity-list" style={{ maxHeight: '180px' }}>
            {topDebtors.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '8px' }}>No pending customer dues.</p>
            ) : (
              topDebtors.map((debtor, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 500 }}>{debtor.name}</span>
                  <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>₹{debtor.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Top Customers lists */}
      <div className="dashboard-grid-two" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Top selling products */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title" style={{ fontSize: '15px' }}>Top Performing Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {topProducts.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.revenue.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{p.quantity} units sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers list */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title" style={{ fontSize: '15px' }}>Top Loyal Customers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {topCustomers.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No customers registered yet.</p>
            ) : (
              topCustomers.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <span className="status-pill info" style={{ fontSize: '11px' }}>{c.loyaltyPoints} points</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
