import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  Save, 
  Upload, 
  ShieldAlert, 
  Copy, 
  Check, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Percent,
  Loader2,
  AlertTriangle,
  Edit
} from 'lucide-react';

const Settings = () => {
  const { user, token, authFetch } = useAuth();
  const [business, setBusiness] = useState({
    name: '',
    address: '',
    gstin: '',
    logo: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authFetch('/business');
      const result = await response.json();
      if (result.success && result.data) {
        setBusiness(result.data);
      } else {
        setError(result.message || 'Failed to load business profile.');
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.businessId) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const handleInputChange = (e) => {
    setBusiness({
      ...business,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authFetch('/upload', {
          method: 'POST',
          body: formData,
          headers: {} 
      });
      
      const result = await response.json();
      if (result.success) {
        setBusiness(prev => ({
          ...prev,
          logo: result.fileUrl
        }));
        setSuccess('Logo uploaded successfully! Save changes to apply.');
      } else {
        setError(result.message || 'File upload failed');
      }
    } catch (err) {
      setError('Failed to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await authFetch('/business', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(business)
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Business profile configurations updated successfully.');
        // Refresh page details or state to sync
        fetchBusiness();
      } else {
        setError(result.message || 'Failed to update business profile.');
      }
    } catch (err) {
      setError('Failed to reach servers to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const copyBusinessId = () => {
    const bId = user?.businessId?._id || user?.businessId;
    if (bId) {
      navigator.clipboard.writeText(bId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="spinner-icon" size={32} />
      </div>
    );
  }

  const bId = user?.businessId?._id || user?.businessId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
      {success && <div className="success-message"><Check size={16} /> {success}</div>}

      {/* Shareable Link ID info card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Business Registry Link ID</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Share this unique database identifier with your managers, staff, and accountants so they can register under your organization.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 }}>
            {bId || 'No Business Associated'}
          </div>
        </div>
        {bId && (
          <button className="btn btn-secondary" onClick={copyBusinessId} style={{ display: 'flex', gap: '8px', height: '40px' }}>
            {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy ID'}
          </button>
        )}
      </div>

      {/* Form Settings Details */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="var(--primary)" /> Profile & Details
          </h3>
          {!isAdmin && (
            <span className="status-pill warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
              <ShieldAlert size={12} /> Read-only mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--bg-tertiary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                {business.logo ? (
                  <img src={business.logo} alt="Business logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building size={32} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              {isAdmin && (
                <label 
                  htmlFor="logo-upload-input"
                  style={{ 
                    position: 'absolute', 
                    bottom: '-6px', 
                    right: '-6px', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    border: '2px solid var(--bg-secondary)',
                    transition: 'var(--transition-smooth)'
                  }}
                  title="Upload Logo"
                >
                  <Edit size={12} />
                  <input 
                    id="logo-upload-input"
                    type="file" 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    disabled={uploading} 
                  />
                </label>
              )}
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Business Branding Logo</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allowed formats: JPEG, PNG, GIF. Max size 5MB.</span>
              </div>
            )}
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="biz-name">Company Name *</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" size={16} />
                <input
                  id="biz-name"
                  type="text"
                  name="name"
                  className="form-input"
                  value={business.name}
                  onChange={handleInputChange}
                  required
                  disabled={!isAdmin || saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="biz-gstin">GSTIN (Tax Registration)</label>
              <div className="input-wrapper">
                <Percent className="input-icon" size={16} />
                <input
                  id="biz-gstin"
                  type="text"
                  name="gstin"
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="form-input"
                  value={business.gstin || ''}
                  onChange={handleInputChange}
                  disabled={!isAdmin || saving}
                />
              </div>
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="biz-phone">Business Contact Phone</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={16} />
                <input
                  id="biz-phone"
                  type="text"
                  name="phone"
                  className="form-input"
                  value={business.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isAdmin || saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="biz-email">Business Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={16} />
                <input
                  id="biz-email"
                  type="email"
                  name="email"
                  className="form-input"
                  value={business.email || ''}
                  onChange={handleInputChange}
                  disabled={!isAdmin || saving}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="biz-address">Physical Office / Store Address</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={16} />
              <input
                id="biz-address"
                type="text"
                name="address"
                placeholder="123 Commercial St, Sector 5, New Delhi"
                className="form-input"
                value={business.address || ''}
                onChange={handleInputChange}
                disabled={!isAdmin || saving}
              />
            </div>
          </div>

          {isAdmin && (
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving || uploading}
              style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginTop: '10px', padding: '10px 24px' }}
            >
              {saving ? <Loader2 className="spinner-icon" size={16} /> : <Save size={16} />}
              {saving ? 'Saving changes...' : 'Save Configuration'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
