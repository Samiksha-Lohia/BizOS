import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, UserCheck, ArrowLeft, AlertCircle, CheckCircle, Tag, Shield, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMPLOYEE_DESIGNATIONS = [
  'Cashier', 'Sales Executive', 'Store Keeper', 'Warehouse Staff',
  'Inventory Manager', 'Purchase Executive', 'HR Executive', 'Receptionist',
  'Customer Support', 'Technician', 'Driver', 'Office Assistant', 'Intern', 'Other',
];

const PLAN_OPTIONS = [
  { value: 'Free',       label: 'Free Trial',      desc: 'Basic features, limited modules' },
  { value: 'Basic',      label: 'Basic Plan',       desc: 'Core business modules included' },
  { value: 'Pro',        label: 'Pro Plan',         desc: 'All modules + advanced analytics' },
  { value: 'Enterprise', label: 'Enterprise Plan',  desc: 'Unlimited access + priority support' },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessId: '',
    role: '',
    designation: '',
    superAdminId: '',
    plan: 'Free',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, businessName, businessId, role, designation, superAdminId, plan } = formData;

    if (!name || !email || !password) { setError('Please fill in all required fields.'); return; }
    if (!role) { setError('Please select your role.'); return; }
    if (role === 'Staff' && !designation) { setError('Please select your role.'); return; }
    if (role === 'Admin' && !businessName) { setError('Please fill in your Business Name.'); return; }
    if (role === 'Admin' && !superAdminId.trim()) { setError('Super Admin ID is required. Contact your Super Admin.'); return; }
    if (role !== 'Admin' && !businessId.trim()) { setError('Please fill in your Business Link ID.'); return; }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await register(
        name, email, password,
        role === 'Admin' ? businessName : undefined,
        role,
        role !== 'Admin' ? businessId.trim() : undefined,
        role === 'Staff' ? designation : undefined,
        role === 'Admin' ? superAdminId.trim() : undefined,
        role === 'Admin' ? plan : undefined
      );

      if (res.success) {
        setSuccess(
          role === 'Admin'
            ? `Business "${businessName}" registered successfully! Redirecting...`
            : role === 'Manager'
              ? 'Manager account created successfully! Redirecting...'
              : role === 'Accountant'
                ? 'Accountant account created successfully! Redirecting...'
                : 'Employee account created successfully! Redirecting...'
        );
        navigate(['Staff', 'Employee'].includes(role) ? '/dashboard/billing' : '/dashboard');
      } else {
        setError(res.message || 'Registration failed. Check if user already exists or if Business ID is valid.');
      }
    } catch (err) {
      setError(err?.message || 'Connection to registration server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.12, borderRadius: '50%', bottom: '20%', left: '50%', transform: 'translate(-50%, 50%)', zIndex: 0, pointerEvents: 'none' }}></div>

      <motion.div className="auth-card glass-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 80 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', transition: 'var(--transition-smooth)' }} className="back-link">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="auth-header">
          <h2 className="auth-title">Register</h2>
          <p className="auth-subtitle">Already have an account? <Link to="/login">Sign In</Link></p>
        </div>

        {error && (
          <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div className="success-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <CheckCircle size={16} /> {success}
          </motion.div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input id="name" type="text" name="name" placeholder="Sam Wilson" className="form-input" value={formData.name} onChange={handleChange} disabled={isLoading} required autoComplete="off" />
            </div>
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">Your Role *</label>
            <div className="input-wrapper">
              <UserCheck className="input-icon" />
              <select id="role" name="role" className="form-input" style={{ color: formData.role ? 'var(--text-primary)' : 'var(--text-muted)' }} value={formData.role} onChange={handleChange} disabled={isLoading} required>
                <option value="" disabled hidden>Select your role</option>
                <option value="Admin" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>Admin (Create Business)</option>
                <option value="Manager" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>Manager (Join existing Business)</option>
                <option value="Staff" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>Employee (Join existing Business)</option>
                <option value="Accountant" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>Accountant (Join existing Business)</option>
              </select>
            </div>
          </div>

          {/* Job Designation — only for Employee */}
          {formData.role === 'Staff' && (
            <div className="form-group">
              <label className="form-label" htmlFor="designation">Role *</label>
              <div className="input-wrapper">
                <Tag className="input-icon" />
                <select id="designation" name="designation" className="form-input" style={{ color: formData.designation ? 'var(--text-primary)' : 'var(--text-muted)' }} value={formData.designation} onChange={handleChange} disabled={isLoading} required>
                  <option value="" disabled hidden>-- Select Role --</option>
                  {EMPLOYEE_DESIGNATIONS.map(d => (
                    <option key={d} value={d} style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Admin-only fields */}
          {formData.role === 'Admin' && (
            <>
              {/* Business Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="businessName">Business / Company Name *</label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon" />
                  <input id="businessName" type="text" name="businessName" placeholder="Wilson Wholesale Ltd." className="form-input" value={formData.businessName} onChange={handleChange} disabled={isLoading} required autoComplete="off" />
                </div>
              </div>

              {/* Super Admin ID */}
              <div className="form-group">
                <label className="form-label" htmlFor="superAdminId">
                  Super Admin ID *
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                    (Provided by your Super Admin)
                  </span>
                </label>
                <div className="input-wrapper">
                  <Shield className="input-icon" />
                  <input
                    id="superAdminId"
                    type="text"
                    name="superAdminId"
                    placeholder="Paste Super Admin ID (e.g. 6a3f662e...)"
                    className="form-input"
                    value={formData.superAdminId}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    autoComplete="off"
                    style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.03em' }}
                  />
                </div>
              </div>

              {/* Subscription Plan */}
              <div className="form-group">
                <label className="form-label" htmlFor="plan">
                  Subscription Plan *
                </label>
                <div className="input-wrapper">
                  <Crown className="input-icon" />
                  <select
                    id="plan"
                    name="plan"
                    className="form-input"
                    style={{ color: 'var(--text-primary)' }}
                    value={formData.plan}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  >
                    {PLAN_OPTIONS.map(p => (
                      <option key={p.value} value={p.value} style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                        {p.label} — {p.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Business Link ID (non-Admin) */}
          {['Manager', 'Staff', 'Accountant'].includes(formData.role) && (
            <div className="form-group">
              <label className="form-label" htmlFor="businessId">Business Link ID *</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" />
                <input id="businessId" type="text" name="businessId" placeholder="Paste Business ID from Admin (e.g. 60c7...)" className="form-input" value={formData.businessId} onChange={handleChange} disabled={isLoading} required autoComplete="off" />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Work Email *</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input id="email" type="email" name="email" placeholder="sam@yourbusiness.com" className="form-input" value={formData.email} onChange={handleChange} disabled={isLoading} required autoComplete="off" />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input id="password" type="password" name="password" placeholder="Min 6 characters" className="form-input" value={formData.password} onChange={handleChange} disabled={isLoading} required autoComplete="new-password" />
            </div>
          </div>

          {/* Terms */}
          <div className="checkbox-row">
            <label className="checkbox-label" style={{ fontSize: '12px' }}>
              <input type="checkbox" className="checkbox-input" required /> I agree to the Terms of Service &amp; Privacy Policy
            </label>
          </div>

          {/* Submit */}
          <motion.button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {isLoading ? 'Creating Account...' : 'Get Started'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
