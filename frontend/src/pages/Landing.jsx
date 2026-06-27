import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  FileText, 
  Users, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Zap, 
  Camera,
  ChevronDown,
  Check,
  X,
  Mail,
  Phone,
  Clock,
  Send,
  Building,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

const Landing = () => {
  const [activeChartBar, setActiveChartBar] = useState(4);
  const [attendanceCheckedIn, setAttendanceCheckedIn] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('inventory');
  const [isAnnualPricing, setIsAnnualPricing] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [callbackForm, setCallbackForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessSize: '1-5',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const stats = [
    { value: '35%', desc: 'Reduction in manual entries' },
    { value: '15+', desc: 'Hours saved weekly per owner' },
    { value: '99.9%', desc: 'GST billing accuracy' },
    { value: '2.5x', desc: 'Faster inventory turnover' }
  ];

  const showcaseTabs = [
    {
      id: 'inventory',
      title: 'Inventory',
      icon: <Package size={16} />,
      heading: 'Automated Stock Allocations',
      description: 'The BizOS smart inventory catalog decrements stock levels automatically on sales checkout and triggers warnings when products fall below safe limits.',
      features: [
        'Real-time automated quantity tracking per product',
        'Configurable minimum warning alerts to prevent stockouts',
        'Valuation sheets calculated at cost and retail rates'
      ],
      visual: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
          <div className="preview-stat-card glass-panel" style={{ background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-red)' }}>
            <span className="stat-label">Basmati Rice (25kg)</span>
            <span className="stat-value" style={{ color: 'var(--accent-red)', fontSize: '20px' }}>8 bags left</span>
            <span className="stat-trend" style={{ color: 'var(--accent-red)' }}>Below safe limit (10)</span>
          </div>
          <div className="preview-stat-card glass-panel" style={{ background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-green)' }}>
            <span className="stat-label">Total Catalog Valuation</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>₹2,84,500</span>
            <span className="stat-trend" style={{ color: 'var(--accent-green)' }}>50 product types</span>
          </div>
        </div>
      )
    },
    {
      id: 'billing',
      title: 'GST Invoicing',
      icon: <FileText size={16} />,
      heading: 'Generate Bills in 30 Seconds',
      description: 'Run checkout transactions smoothly. Standard GST breakups (CGST/SGST/IGST) are calculated and structured for you instantly.',
      features: [
        '18% GST Compliance auto-calculated in backend',
        'Cash, UPI, Card, and Credit invoice allocations',
        'Open and preview invoices immediately on submit'
      ],
      visual: (
        <div className="glass-panel" style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <strong>INV-00042</strong>
              <span className="status-pill success" style={{ padding: '2px 8px', fontSize: '10px' }}>Paid (UPI)</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Gupta General Store</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Subtotal:</span>
              <span>₹2,076.27</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>GST (18%):</span>
              <span>₹373.73</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
              <span>Grand Total:</span>
              <span>₹2,450.00</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'crm',
      title: 'CRM & Loyalty',
      icon: <Users size={16} />,
      heading: 'Track Credit & Loyalty',
      description: 'Create a permanent registry of customer contact information, billing histories, and automatic loyalty point trackers.',
      features: [
        'Automatic loyalty engine (1 point per ₹100 spent)',
        'Detailed outstanding balance ledgers for credit sales',
        'Quick profiles search by name or phone'
      ],
      visual: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
          <div className="preview-stat-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '12px', borderLeft: '3px solid var(--accent)' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block', color: 'var(--txt1)' }}>Arun Electronics</strong>
              <span style={{ fontSize: '11px', color: 'var(--txt2)' }}>Loyalty: 142 pts</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--alr)', fontWeight: 700 }}>Due: ₹8,500</span>
          </div>
          <div className="preview-stat-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '12px', borderLeft: '3px solid var(--suc)' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block', color: 'var(--txt1)' }}>Gupta General Store</strong>
              <span style={{ fontSize: '11px', color: 'var(--txt2)' }}>Loyalty: 88 pts</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--suc)', fontWeight: 700 }}>Clear</span>
          </div>
        </div>
      )
    },
    {
      id: 'attendance',
      title: 'HR & Attendance',
      icon: <Calendar size={16} />,
      heading: 'GPS Selfie Check-ins',
      description: 'Staff record attendance via secure, location-verified punches. The system automatically tabulates shift hours and calculates payroll.',
      features: [
        'GPS location verification prevents off-site punches',
        'Facial selfie uploads prevent buddy punching',
        'Automated payroll sheet showing net salary, leaves, and overtime'
      ],
      visual: (
        <div className="preview-stat-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center', padding: '16px', background: 'var(--bg-primary)', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--suc-bg)', color: 'var(--suc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '14px', display: 'block' }}>Ravi Shankar (Present)</strong>
            <span style={{ fontSize: '11px', color: 'var(--txt2)' }}>Checked in at: 09:02 AM</span>
            <div style={{ display: 'inline-block', fontSize: '10px', background: 'var(--suc-bg)', color: 'var(--suc)', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontWeight: 600 }}>GPS & Selfie Verified</div>
          </div>
        </div>
      )
    },
    {
      id: 'expenses',
      title: 'Expenses',
      icon: <CreditCard size={16} />,
      heading: 'Control Spending Leakage',
      description: 'Log and organize monthly operations expenditures (salaries, utilities, raw materials) and handle employee reimbursement claims.',
      features: [
        'Detailed spending reports by category',
        'Manager dashboard for expense claims verification',
        'Profit and loss statements updated in real time'
      ],
      visual: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
          <div className="preview-stat-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-primary)', borderLeft: '3px solid var(--alr)', fontSize: '13px' }}>
            <span>Office Rent (Rent)</span>
            <strong style={{ color: 'var(--alr)' }}>-₹35,000</strong>
          </div>
          <div className="preview-stat-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-primary)', borderLeft: '3px solid var(--alr)', fontSize: '13px' }}>
            <span>Google Ads (Marketing)</span>
            <strong style={{ color: 'var(--alr)' }}>-₹15,000</strong>
          </div>
        </div>
      )
    }
  ];

  const comparisons = [
    { task: 'Stock tracking', old: 'Excel sheet or register updated manually once a week', new: 'Live tracking. Updates automatically on every sale.' },
    { task: 'Creating a bill', old: 'Write by hand or type in Excel (5-10 minutes)', new: 'Choose items & tap (30 seconds). PDF sent via WhatsApp.' },
    { task: 'Customer records', old: 'WhatsApp chat history or handwritten notebooks', new: 'Organized database with credit ledgers and loyalty.' },
    { task: 'Staff attendance', old: 'Paper registers (unverified logs)', new: 'Selfie + GPS punch-in. Tamper-proof logs.' },
    { task: 'Monthly payroll', old: 'Manual calculations (takes 3-4 hours of work)', new: 'Auto-calculated in seconds based on attendance.' },
    { task: 'Expense tracking', old: 'Scattered paper slips, mostly forgotten', new: 'Digital photo uploads + category tagging. Organized.' },
    { task: 'Business health checks', old: 'Guesswork until month-end audits', new: 'Live P&L snapshot on owner dashboard.' }
  ];

  const pricingPlans = [
    {
      title: 'Starter',
      priceMonthly: 0,
      priceAnnual: 0,
      desc: 'Great for single-counter retail shops taking their first digital steps.',
      features: [
        { text: '1 User Account', included: true },
        { text: 'Sales Invoicing', included: true },
        { text: 'Limited Inventory Management', included: true },
        { text: 'Email Support', included: true },
        { text: 'CRM Credit Ledger', included: false },
        { text: 'Staff Attendance', included: false },
        { text: 'Expense Claims Workflow', included: false },
        { text: 'Multi-Location Sync', included: false }
      ]
    },
    {
      title: 'Basic',
      priceMonthly: 499,
      priceAnnual: 399,
      desc: 'Perfect for small retailers needing inventory and customer ledgers.',
      features: [
        { text: '3 User Accounts', included: true },
        { text: 'Sales Invoicing', included: true },
        { text: 'Full Inventory Management', included: true },
        { text: 'CRM & Loyalty Engine', included: true },
        { text: 'GST compliance reports', included: true },
        { text: 'Email Support', included: true },
        { text: 'Staff Attendance', included: false },
        { text: 'Expense Claims Workflow', included: false }
      ]
    },
    {
      title: 'Professional',
      priceMonthly: 999,
      priceAnnual: 799,
      popular: true,
      desc: 'Complete suite for growing MSMEs with staff and expense tracking.',
      features: [
        { text: '10 User Accounts', included: true },
        { text: 'Sales Invoicing & Full Inventory', included: true },
        { text: 'CRM & Loyalty Engine', included: true },
        { text: 'Staff Attendance (Selfie + GPS)', included: true },
        { text: 'Expense Claims & Cashflow', included: true },
        { text: 'GST Compliance Reports', included: true },
        { text: 'Priority Phone & Chat Support', included: true },
        { text: 'Multi-Location Sync', included: false }
      ]
    },
    {
      title: 'Enterprise',
      priceMonthly: 1999,
      priceAnnual: 1599,
      desc: 'For larger networks and franchise systems with multiple warehouses.',
      features: [
        { text: 'Unlimited User Accounts', included: true },
        { text: 'Sales Invoicing & Full Inventory', included: true },
        { text: 'CRM & Loyalty Engine', included: true },
        { text: 'Staff Attendance (Selfie + GPS)', included: true },
        { text: 'Expense Claims & Cashflow', included: true },
        { text: 'Multi-Warehouse & Locations', included: true },
        { text: 'Dedicated Account Manager', included: true },
        { text: 'On-Site Setup Assistance', included: true }
      ]
    }
  ];

  const faqs = [
    {
      question: 'Is BizOS fully GST compliant?',
      answer: 'Yes! BizOS is designed to meet Indian GST guidelines. The system automatically calculates CGST, SGST, and IGST breakdowns at checkout, structures invoice numbers per financial year, and exports GSTR-1 and GSTR-3B ready compliance ledgers for your CA.'
    },
    {
      question: 'Does the staff attendance system require biometric hardware?',
      answer: 'No dedicated biometric devices are required. Your employees download the BizOS app on their smartphones and punch in using their phone camera (taking a selfie) and location (GPS verification) directly at your store or office location.'
    },
    {
      question: 'Can BizOS run offline if my internet goes down?',
      answer: 'Absolutely. The core billing, invoicing, and inventory search features are built to work completely offline. Transactions are queued locally on the browser/device database and sync automatically to the cloud once an active connection is restored.'
    },
    {
      question: 'How safe is my customer and business data on BizOS?',
      answer: 'We secure all database transactions using enterprise-grade JWT headers and SSL encryption. All business records are backed up daily. Your data belongs 100% to you and is always exportable as clean CSV/Excel spreadsheets.'
    },
    {
      question: 'Do you help migrate product listings from old software or Excel?',
      answer: 'Yes! Our dedicated support team provides free bulk data migration. Simply share your existing Excel product lists or inventory registers with us, and we will upload them into your account within 24 hours so you are ready on Day 1.'
    }
  ];

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!callbackForm.name || !callbackForm.phone) {
      setFormError('Name and Phone number are required.');
      return;
    }
    setFormSubmitted(true);
  };

  const handleFormChange = (e) => {
    setCallbackForm({
      ...callbackForm,
      [e.target.name]: e.target.value
    });
  };

  const selectedTab = showcaseTabs.find(tab => tab.id === activeShowcaseTab);
  const chartData = [35, 45, 60, 50, 80, 65, 75];

  return (
    <div className="landing-content">
      <section className="hero-section" id="home">
        <motion.div 
          className="hero-text-container"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="badge">
            <span className="badge-dot"></span>
            Digitizing Small Businesses
          </div>
          <h1 className="hero-title">
            The Business Operating System for <span>MSMEs</span>
          </h1>
          <p className="hero-subtitle">
            BizOS consolidates Billing, Inventory, CRM, Employee Attendance, and Expenses into a single, cohesive interface. Ditch Excel files and WhatsApp groups.
          </p>
          <div className="hero-ctas">
            <Link to="/register">
              <motion.button 
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button 
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log In
              </motion.button>
            </Link>
          </div>

          <div className="hero-stats-row">
            {stats.map((st, idx) => (
              <motion.div 
                key={idx}
                className="hero-stat-item"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <span className="hero-stat-number">{st.value}</span>
                <span className="hero-stat-desc">{st.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div style={{
            position: 'absolute',
            width: '250px',
            height: '250px',
            background: 'var(--primary)',
            filter: 'blur(100px)',
            opacity: 0.15,
            borderRadius: '50%',
            zIndex: 1
          }}></div>

          <motion.div 
            className="dashboard-preview glass-panel"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className="preview-header">
              <div className="preview-window-dots">
                <span className="preview-dot red"></span>
                <span className="preview-dot orange"></span>
                <span className="preview-dot green"></span>
              </div>
              <span className="preview-title">BizOS Dashboard v1.0</span>
            </div>

            <div className="preview-stats-grid">
              <div className="preview-stat-card glass-panel" style={{ background: 'var(--bg-primary)' }}>
                <span className="stat-label">Daily Sales</span>
                <span className="stat-value">₹45,230</span>
                <span className="stat-trend"><TrendingUp size={12} /> +12.4%</span>
              </div>
              <div className="preview-stat-card glass-panel" style={{ background: 'var(--bg-primary)' }}>
                <span className="stat-label">Stock Status</span>
                <span className="stat-value" style={{ color: 'var(--accent-green)' }}>Healthy</span>
                <span className="stat-trend" style={{ color: 'var(--accent-green)' }}>234 Items</span>
              </div>
            </div>

            <div className="preview-chart-container glass-panel" style={{ background: 'var(--bg-primary)' }}>
              <div className="preview-chart-bars">
                {chartData.map((val, idx) => (
                  <motion.div 
                    key={idx}
                    className={`chart-bar ${activeChartBar === idx ? 'active' : ''}`}
                    style={{ height: `${val}%`, cursor: 'pointer' }}
                    onClick={() => setActiveChartBar(idx)}
                    whileHover={{ scaleY: 1.1 }}
                  />
                ))}
              </div>
              <div className="preview-chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="floating-card-1 glass-panel"
            animate={{
              y: [0, 8, 0],
              x: [0, -4, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--accent-green)" />
              <div>
                <p style={{ fontWeight: 600 }}>Invoice Approved</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>GST Breakdown (18%)</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="floating-card-2 glass-panel"
            style={{ cursor: 'pointer' }}
            onClick={() => setAttendanceCheckedIn(!attendanceCheckedIn)}
            animate={{
              y: [0, -8, 0],
              x: [0, 4, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: attendanceCheckedIn ? 'var(--accent-green-bg)' : 'var(--primary-light)',
                color: attendanceCheckedIn ? 'var(--accent-green)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {attendanceCheckedIn ? <CheckCircle size={14} /> : <Camera size={14} />}
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>{attendanceCheckedIn ? 'Verified check-in' : 'Verify Attendance'}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {attendanceCheckedIn ? 'GPS & Selfie OK' : 'Click to simulate selfie'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="showcase-section" id="modules">
        <div className="showcase-split-container">
          <div className="showcase-sidebar">
            <span className="section-subtitle">Interactive Deep-Dive</span>
            <h2 className="section-title">Explore the Core Modules</h2>
            <p className="section-desc" style={{ marginBottom: '32px' }}>
              See how BizOS consolidates scattered spreadsheets and paper documents into a fast, integrated operations system.
            </p>
            <div className="showcase-vertical-tabs">
              {showcaseTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`showcase-tab-btn-vertical ${activeShowcaseTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveShowcaseTab(tab.id)}
                >
                  <span className="tab-btn-icon">{tab.icon}</span>
                  <span className="tab-btn-text">{tab.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="showcase-content-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeShowcaseTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="showcase-card glass-panel"
              >
                <div className="showcase-card-text">
                  <h3 className="showcase-card-heading">
                    {selectedTab.heading}
                  </h3>
                  <p className="showcase-card-desc">
                    {selectedTab.description}
                  </p>
                  <ul className="showcase-feature-list">
                    {selectedTab.features.map((feat, fIdx) => (
                      <li key={fIdx} className="showcase-feature-item">
                        <CheckCircle size={16} className="showcase-feature-icon" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="showcase-card-visual">
                  <div className="showcase-visual-panel glass-panel" style={{ background: 'var(--bg-secondary)' }}>
                    {selectedTab.visual}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="comparison-section" id="comparison">
        <div className="section-header">
          <span className="section-subtitle">Comparison Sheet</span>
          <h2 className="section-title">Ditch the Paper & Notebooks</h2>
          <p className="section-desc">
            Compare Tally, Excel sheets, and handwritten books with the real-time operational efficiency of BizOS.
          </p>
        </div>

        <div className="comparison-table-wrapper table-wrapper glass-panel">
              <table className="comparison-table styled-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Business Task</th>
                    <th style={{ width: '38%' }}>Traditional Method</th>
                    <th style={{ width: '37%' }}>With BizOS</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comp, idx) => (
                    <tr key={idx}>
                      <td><strong>{comp.task}</strong></td>
                      <td>
                        <div className="comparison-status-cell danger">
                          <X size={16} />
                          <span>{comp.old}</span>
                        </div>
                      </td>
                      <td>
                        <div className="comparison-status-cell success">
                          <CheckCircle size={16} color="var(--accent-green)" />
                          <strong style={{ color: 'var(--text-primary)' }}>{comp.new}</strong>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-header-row">
          <div className="pricing-title-block">
            <span className="section-subtitle">Subscription Tiers</span>
            <h2 className="section-title">Transparent, Affordable Pricing</h2>
            <p className="section-desc">
              Choose a plan tailored to your business scale. No hidden fees. Save with annual subscriptions.
            </p>
          </div>

          <div className="pricing-toggle-wrapper">
            <span className={`pricing-toggle-label ${!isAnnualPricing ? 'active' : ''}`}>Monthly Billing</span>
            <button 
              type="button"
              className={`pricing-toggle-btn ${isAnnualPricing ? 'active' : ''}`}
              onClick={() => setIsAnnualPricing(!isAnnualPricing)}
              aria-label="Toggle annual pricing"
            >
              <div className="pricing-toggle-dot"></div>
            </button>
            <span className={`pricing-toggle-label ${isAnnualPricing ? 'active' : ''}`}>
              Annual Billing <span style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 700 }}>(Save 15%)</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, idx) => {
            const priceVal = isAnnualPricing ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div 
                key={idx} 
                className={`pricing-card glass-panel ${plan.popular ? 'featured' : ''}`}
              >
                {plan.popular && <span className="pricing-card-badge">POPULAR</span>}
                <span className="pricing-card-title">{plan.title}</span>
                <p className="pricing-card-desc">{plan.desc}</p>
                <div className="pricing-card-price">
                  ₹{priceVal}
                  <span>/ month</span>
                </div>
                {isAnnualPricing && priceVal > 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, display: 'block', margin: '-4px 0 12px 0' }}>
                    Billed annually (₹{priceVal * 12}/yr)
                  </span>
                )}
                
                <ul className="pricing-card-features-list">
                  {plan.features.map((feat, fIdx) => (
                    <li 
                      key={fIdx} 
                      className={`pricing-card-feature ${!feat.included ? 'disabled' : ''}`}
                    >
                      <CheckCircle 
                        size={14} 
                        color={feat.included ? 'var(--primary)' : 'var(--text-muted)'} 
                        className="pricing-card-feature-icon" 
                      />
                      <span>{feat.text}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register" style={{ marginTop: 'auto' }}>
                  <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                    Choose {plan.title}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="faq-split-container">
          <div className="faq-sidebar">
            <span className="section-subtitle">FAQ Summary</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc" style={{ marginBottom: '24px' }}>
              Everything you need to know about setting up BizOS for your business.
            </p>
            <p className="faq-support-text">
              Have a unique question? <a href="#contact" style={{ color: 'var(--pri)', fontWeight: 600, textDecoration: 'underline' }}>Talk to our onboarding team</a>.
            </p>
          </div>

          <div className="faq-content">
            <div className="faq-grid">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className={`faq-item glass-panel ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={18} className="faq-arrow" />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="faq-answer-content">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-header">
          <span className="section-subtitle">Get In Touch</span>
          <h2 className="section-title">Request a Free Demo</h2>
          <p className="section-desc">
            Want to see how BizOS works for your specific business? Fill in details and our onboarding team will contact you.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-panel">
            <div className="contact-card glass-panel">
              <div className="contact-card-icon-box">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="contact-card-title">Call Sales & Onboarding</h4>
                <p className="contact-card-value">+91 98765 43210</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Mon - Sat: 09:00 AM - 07:00 PM</p>
              </div>
            </div>

            <div className="contact-card glass-panel">
              <div className="contact-card-icon-box">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="contact-card-title">Technical Support</h4>
                <p className="contact-card-value">info@bizos.in</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>24/7 ticket response window</p>
              </div>
            </div>

            <div className="contact-card glass-panel">
              <div className="contact-card-icon-box">
                <Building size={20} />
              </div>
              <div>
                <h4 className="contact-card-title">Corporate Office</h4>
                <p className="contact-card-value">89, Ring Road, Sector 5, Surat, Gujarat - 395002</p>
              </div>
            </div>
          </div>

          <div className="contact-form-panel glass-panel">
            {!formSubmitted ? (
              <form onSubmit={handleCallbackSubmit} className="auth-form" style={{ gap: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Request Onboarding Support</h3>
                {formError && <div className="error-message" style={{ padding: '8px' }}>{formError}</div>}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="cnt-name">Your Name *</label>
                  <input
                    id="cnt-name"
                    type="text"
                    name="name"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Enter name"
                    value={callbackForm.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cnt-phone">Phone Number *</label>
                    <input
                      id="cnt-phone"
                      type="tel"
                      name="phone"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="e.g. +91 9876543210"
                      value={callbackForm.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cnt-size">Business Size</label>
                    <select
                      id="cnt-size"
                      name="businessSize"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      value={callbackForm.businessSize}
                      onChange={handleFormChange}
                    >
                      <option value="1-5">1-5 Employees</option>
                      <option value="6-20">6-20 Employees</option>
                      <option value="21-50">21-50 Employees</option>
                      <option value="50+">50+ Employees</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cnt-msg">Message / Requirements</label>
                  <textarea
                    id="cnt-msg"
                    name="message"
                    className="form-input"
                    style={{ paddingLeft: '16px', minHeight: '80px', borderRadius: '8px', resize: 'vertical' }}
                    placeholder="Tell us about your business..."
                    value={callbackForm.message}
                    onChange={handleFormChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  <Send size={16} /> Request Callback
                </button>
              </form>
            ) : (
              <motion.div 
                className="contact-form-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--suc-bg)', color: 'var(--suc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Request Received Successfully</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Thank you, <strong>{callbackForm.name}</strong>! Our onboarding team will call you back at <strong>{callbackForm.phone}</strong> within the next 2 hours.
                </p>
                <button type="button" className="btn btn-secondary" onClick={() => { setFormSubmitted(false); setCallbackForm({ name: '', email: '', phone: '', businessSize: '1-5', message: '' }); }}>
                  Submit Another Request
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <footer className="rich-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <Building className="logo-icon" />
              <span>BizOS</span>
            </div>
            <p className="footer-desc">
              All-in-one small business operations system consolidating inventory catalogs, invoicing checkout, employee records, and cash flow.
            </p>
            <div className="footer-social-row">
              <a href="#" className="footer-social-btn" aria-label="LinkedIn"><Users size={16} /></a>
              <a href="#" className="footer-social-btn" aria-label="Support"><HelpCircle size={16} /></a>
              <a href="#" className="footer-social-btn" aria-label="Contact"><Mail size={16} /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Product</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#features">Features pillars</a></li>
              <li className="footer-link-item"><a href="#pricing">Pricing plans</a></li>
              <li className="footer-link-item"><Link to="/login">Portal login</Link></li>
              <li className="footer-link-item"><Link to="/register">Create business</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Modules</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); setActiveShowcaseTab('inventory'); }}>Stock inventory</a></li>
              <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); setActiveShowcaseTab('billing'); }}>GST checkout</a></li>
              <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); setActiveShowcaseTab('crm'); }}>CRM outstanding</a></li>
              <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); setActiveShowcaseTab('attendance'); }}>GPS selfie attendance</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Resources</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#">GSTR-1 calculator</a></li>
              <li className="footer-link-item"><a href="#">Video manuals</a></li>
              <li className="footer-link-item"><a href="#">MSME blog updates</a></li>
              <li className="footer-link-item"><a href="#">Tally sheets imports</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Legal</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#">Terms of service</a></li>
              <li className="footer-link-item"><a href="#">Privacy policies</a></li>
              <li className="footer-link-item"><a href="#">Daily backups policy</a></li>
              <li className="footer-link-item"><a href="#">SLA & security logs</a></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <span>© 2026 BizOS MSME Business Systems. All rights reserved.</span>
          <span>Security Certified (SSL & daily encrypted backups)</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
