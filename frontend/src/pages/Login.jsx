import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFirstSidebarPath } from '../utils/navigation';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccess('Welcome back! Redirecting...');
        const path = getFirstSidebarPath(res.role, res.isSuperAdmin);
        navigate(path);
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err?.message || 'Connection to auth server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'var(--primary)',
        filter: 'blur(150px)',
        opacity: 0.12,
        borderRadius: '50%',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <motion.div 
        className="auth-card glass-panel"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 80 }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', transition: 'var(--transition-smooth)' }} className="back-link">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="auth-header">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle size={16} /> {success}
          </motion.div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          {/* Email input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="sam@yourbusiness.com"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <a href="#" className="forgot-link" style={{ fontSize: '12px' }} onClick={(e) => e.preventDefault()}>Forgot?</a>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
