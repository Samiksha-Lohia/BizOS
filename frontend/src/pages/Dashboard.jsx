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
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/dashboard');
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

  // Let's find the max value to set scale of Y axis
  const chartSalesToday = displayTodaySales;
  const chartExpenseToday = displayTodayExpenses;
  const chartSalesMonthly = displayMonthlyRevenue;
  const chartExpenseMonthly = displayMonthlyExpenses;
  const chartSalesAvg = avgDailySales;
  const chartExpenseAvg = avgDailyExpenses;

  const maxVal = Math.max(
    chartSalesToday,
    chartExpenseToday,
    chartSalesMonthly,
    chartExpenseMonthly,
    chartSalesAvg,
    chartExpenseAvg,
    1000
  );

  let yMax = 100000;
  if (maxVal > 100000) {
    yMax = Math.ceil(maxVal / 50000) * 50000;
  } else if (maxVal > 50000) {
    yMax = 100000;
  } else if (maxVal > 25000) {
    yMax = 50000;
  } else if (maxVal > 10000) {
    yMax = 25000;
  } else {
    yMax = Math.ceil(maxVal / 1000) * 1000 || 1000;
  }

  const yTicks = [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];

  return (
    <div className="dashboard-content-main">
      {/* KPIs Grid */}
      <div className="kpis-grid">
        {/* KPI: Monthly Revenue */}
        <div className="kpi-card glass-panel revenue">
          <div className="kpi-header">
            <span className="kpi-title">Monthly Revenue</span>
            <div className="kpi-icon-box font-icon-rev">
              <DollarSign size={18} />
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
            <div className="kpi-icon-box font-icon-exp">
              <TrendingDown size={18} />
            </div>
          </div>
          <span className="kpi-value">₹{monthlySnapshot.expenses.toLocaleString('en-IN')}</span>
          <div className="kpi-trend neutral">
            <TrendingDown size={14} />
            <span>This calendar month</span>
          </div>
        </div>

        {/* KPI: Monthly Net Profit */}
        <div className="kpi-card glass-panel profit">
          <div className="kpi-header">
            <span className="kpi-title">Net Profit</span>
            <div className="kpi-icon-box font-icon-prof">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="kpi-value" style={{ color: monthlySnapshot.profitOrLoss >= 0 ? 'var(--pri)' : 'var(--alr)' }}>
            ₹{monthlySnapshot.profitOrLoss.toLocaleString('en-IN')}
          </span>
          <div className={`kpi-trend ${monthlySnapshot.profitOrLoss >= 0 ? 'up' : 'down'}`}>
            {monthlySnapshot.profitOrLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>Margin: {monthlySnapshot.revenue > 0 ? Math.round((monthlySnapshot.profitOrLoss / monthlySnapshot.revenue) * 100) : 0}%</span>
          </div>
        </div>

        {/* KPI: Team Attendance */}
        <div className="kpi-card glass-panel attendance">
          <div className="kpi-header">
            <span className="kpi-title">Attendance Rate</span>
            <div className="kpi-icon-box font-icon-att">
              <Users size={18} />
            </div>
          </div>
          <span className="kpi-value">{attendanceRate}%</span>
          <div className="kpi-trend info">
            <TrendingUp size={14} />
            <span>{presentEmp} / {totalEmp} staff present today</span>
          </div>
        </div>
      </div>

      {/* Grid of charts and metrics */}
      <div className="dashboard-grid-two">
        {/* Sales vs Expenses chart */}
        <div className="chart-card glass-panel">
          <div className="chart-header-row">
            <h3 className="card-title-custom">Income & Expense Overview</h3>
            <span className="chart-comparison-sub">Comparison Overview</span>
          </div>
          
          <div className="custom-chart-wrapper-new">
            <div className="chart-layout-with-axis">
              {/* Y Axis ticks */}
              <div className="chart-y-axis">
                {yTicks.map((tick, i) => (
                  <span key={i} className="chart-y-tick">{tick.toLocaleString('en-IN')}</span>
                ))}
              </div>

              {/* Chart container wrapper */}
              <div className="chart-bars-container-wrapper">
                {/* Horizontal dotted gridlines */}
                <div className="chart-gridlines">
                  {yTicks.map((_, i) => (
                    <div key={i} className="chart-gridline"></div>
                  ))}
                </div>

                {/* Bars */}
                <div className="chart-bars-container-new">
                  {/* Today */}
                  <div 
                    className="chart-bar-group-new"
                    onMouseEnter={() => setHoveredGroup('Today')}
                    onMouseLeave={() => setHoveredGroup(null)}
                  >
                    {hoveredGroup === 'Today' && <div className="chart-group-highlight"></div>}
                    {hoveredGroup === 'Today' && (
                      <div className="chart-tooltip">
                        <h4 className="tooltip-title">Today</h4>
                        <div className="tooltip-row text-sales">
                          <span>Revenue (Sales) : </span>
                          <strong>{Math.round(chartSalesToday)}</strong>
                        </div>
                        <div className="tooltip-row text-expense">
                          <span>Operating Expense : </span>
                          <strong>{Math.round(chartExpenseToday)}</strong>
                        </div>
                      </div>
                    )}
                    <div className="dual-bars-new">
                      <div className="bar-sales-new" style={{ height: `${Math.max(4, (chartSalesToday / yMax) * 100)}%` }}></div>
                      <div className="bar-expense-new" style={{ height: `${Math.max(4, (chartExpenseToday / yMax) * 100)}%` }}></div>
                    </div>
                    <span className="chart-label-x-new">Today</span>
                  </div>

                  {/* Monthly totals */}
                  <div 
                    className="chart-bar-group-new"
                    onMouseEnter={() => setHoveredGroup('Monthly')}
                    onMouseLeave={() => setHoveredGroup(null)}
                  >
                    {hoveredGroup === 'Monthly' && <div className="chart-group-highlight"></div>}
                    {hoveredGroup === 'Monthly' && (
                      <div className="chart-tooltip">
                        <h4 className="tooltip-title">Monthly</h4>
                        <div className="tooltip-row text-sales">
                          <span>Revenue (Sales) : </span>
                          <strong>{Math.round(chartSalesMonthly)}</strong>
                        </div>
                        <div className="tooltip-row text-expense">
                          <span>Operating Expense : </span>
                          <strong>{Math.round(chartExpenseMonthly)}</strong>
                        </div>
                      </div>
                    )}
                    <div className="dual-bars-new">
                      <div className="bar-sales-new" style={{ height: `${Math.max(4, (chartSalesMonthly / yMax) * 100)}%` }}></div>
                      <div className="bar-expense-new" style={{ height: `${Math.max(4, (chartExpenseMonthly / yMax) * 100)}%` }}></div>
                    </div>
                    <span className="chart-label-x-new">Monthly</span>
                  </div>

                  {/* Targets */}
                  <div 
                    className="chart-bar-group-new"
                    onMouseEnter={() => setHoveredGroup('Averages')}
                    onMouseLeave={() => setHoveredGroup(null)}
                  >
                    {hoveredGroup === 'Averages' && <div className="chart-group-highlight"></div>}
                    {hoveredGroup === 'Averages' && (
                      <div className="chart-tooltip">
                        <h4 className="tooltip-title">Averages</h4>
                        <div className="tooltip-row text-sales">
                          <span>Revenue (Sales) : </span>
                          <strong>{Math.round(chartSalesAvg)}</strong>
                        </div>
                        <div className="tooltip-row text-expense">
                          <span>Operating Expense : </span>
                          <strong>{Math.round(chartExpenseAvg)}</strong>
                        </div>
                      </div>
                    )}
                    <div className="dual-bars-new">
                      <div className="bar-sales-new" style={{ height: `${Math.max(4, (chartSalesAvg / yMax) * 100)}%` }}></div>
                      <div className="bar-expense-new" style={{ height: `${Math.max(4, (chartExpenseAvg / yMax) * 100)}%` }}></div>
                    </div>
                    <span className="chart-label-x-new">Averages</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-legend-new">
              <div className="legend-item-new">
                <span className="legend-color-new bg-sales"></span>
                <span>Revenue (Sales)</span>
              </div>
              <div className="legend-item-new">
                <span className="legend-color-new bg-expense"></span>
                <span>Operating Expense</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Debtors */}
        <div className="recent-activities-card-new glass-panel">
          <div className="alerts-header-row">
            <h3 className="card-title-custom">Immediate Alerts</h3>
            {lowStockAlertsCount > 0 && <span className="alert-badge-danger">{lowStockAlertsCount} stock alert</span>}
          </div>
          
          <div className="activity-list-new">
            {lowStockAlerts.length === 0 ? (
              <div className="all-stable-alert">
                <ShoppingBag size={24} className="stable-icon" />
                <p>All product stocks are stable.</p>
              </div>
            ) : (
              lowStockAlerts.map((prod, i) => (
                <div key={i} className="stock-warning-box">
                  <div className="stock-warning-header">
                    <div className="warning-icon-circle">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="warning-text-container">
                      <span className="warning-title-text">{prod.name} running low</span>
                      <span className="warning-desc-text">Current stock: {prod.quantity} · Min threshold: {prod.minLevel}</span>
                    </div>
                  </div>
                  <Link to="/dashboard/inventory" className="restock-now-button">
                    Restock now
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Top Debtors overview */}
          <h3 className="card-title-custom" style={{ marginTop: '24px', marginBottom: '16px' }}>
            Top Outstanding Credits
          </h3>
          <div className="debtors-list-new">
            {topDebtors.length === 0 ? (
              <p className="no-credits-text">No pending customer dues.</p>
            ) : (
              topDebtors.map((debtor, idx) => (
                <div key={idx} className="debtor-row-new">
                  <span className="debtor-name-new">{debtor.name}</span>
                  <span className="debtor-amount-new">₹{debtor.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Top Customers lists */}
      <div className="dashboard-grid-two">
        {/* Top selling products */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title-custom" style={{ marginBottom: '16px' }}>Top Performing Products</h3>
          <div className="top-performing-products-list">
            {topProducts.length === 0 ? (
              <p className="no-sales-text">No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="product-row-new">
                  <div className="product-details-new">
                    <span className="product-name-new">{p.name}</span>
                    <span className="product-units-new">{p.quantity} unit sold</span>
                  </div>
                  <div className="product-revenue-badge">
                    ₹{p.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers list */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title-custom" style={{ marginBottom: '16px' }}>Top Loyal Customers</h3>
          <div className="top-loyal-customers-list">
            {topCustomers.length === 0 ? (
              <p className="no-customers-text">No customers registered yet.</p>
            ) : (
              topCustomers.map((c, idx) => (
                <div key={idx} className="customer-row-new">
                  <span className="customer-name-new">{c.name}</span>
                  <span className="customer-points-badge-new">{c.loyaltyPoints} points</span>
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
