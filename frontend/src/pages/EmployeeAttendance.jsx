import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  LogOut,
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Sun,
  Moon,
  Coffee,
  X
} from 'lucide-react';

const EmployeeAttendance = () => {
  const { user, token, authFetch } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = () => new Date().toTimeString().split(' ')[0].substring(0, 5);

  // Today's record state
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Recent attendance history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Selfie modal
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'checkin' | 'checkout'
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Employee record linked to this user
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  const fetchMyEmployee = async () => {
    try {
      const res = await authFetch('/employees/me');
      const data = await res.json();
      if (data.success && data.data) {
        setEmployeeId(data.data._id);
        setEmployeeData(data.data);
        return data.data._id;
      }
    } catch (e) {
      // fallback — might not exist
    }
    return null;
  };

  const fetchTodayRecord = async (empId) => {
    try {
      const res = await authFetch(`/attendance/my?date=${todayStr}`);
      const data = await res.json();
      if (data.success) {
        const myRecord = data.data.find(r => r.employeeId?._id === empId) || data.data[0];
        setTodayRecord(myRecord || null);
      }
    } catch (e) {
      setError('Failed to load attendance record.');
    }
  };

  const fetchHistory = async (empId) => {
    setHistoryLoading(true);
    try {
      // Fetch last 7 days
      const past7 = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        past7.push(d.toISOString().split('T')[0]);
      }
      const results = await Promise.all(
        past7.map(date => authFetch(`/attendance/my?date=${date}`).then(r => r.json()))
      );
      const records = results.map((res, i) => {
        const record = res.success
          ? res.data.find(r => r.employeeId?._id === empId) || res.data[0]
          : null;
        return { date: past7[i], record };
      });
      setHistory(records);
    } catch (e) {
      // non-critical
    } finally {
      setHistoryLoading(false);
    }
  };

  const init = async () => {
    setLoading(true);
    setError('');
    const empId = await fetchMyEmployee();
    if (empId) {
      await fetchTodayRecord(empId);
      fetchHistory(empId);
    } else {
      setError('No employee profile found for your account. Please contact your admin.');
    }
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const handleCheckIn = () => {
    // Always prompt selfie for check-in
    setPendingAction('checkin');
    setSelfieModalOpen(true);
  };

  const handleCheckOut = () => {
    setPendingAction('checkout');
    setSelfieModalOpen(true);
  };

  const submitCheckIn = async (selfieUrl) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authFetch('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          date: todayStr,
          status: 'Present',
          timeIn: nowTime(),
          selfieUrl
        })
      });
      const result = await res.json();
      if (result.success) {
        setSuccess('Check-in recorded successfully! Have a great day at work. 🎉');
        setSelfieModalOpen(false);
        await fetchTodayRecord(employeeId);
        fetchHistory(employeeId);
      } else {
        setError(result.message || 'Check-in failed.');
      }
    } catch (e) {
      setError('Failed to connect. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitCheckOut = async (selfieUrl) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authFetch('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          date: todayStr,
          timeOut: nowTime(),
          selfieUrl
        })
      });
      const result = await res.json();
      if (result.success) {
        setSuccess('Check-out recorded. Great work today! 👋');
        setSelfieModalOpen(false);
        await fetchTodayRecord(employeeId);
        fetchHistory(employeeId);
      } else {
        setError(result.message || 'Check-out failed.');
      }
    } catch (e) {
      setError('Failed to connect. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfieUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append('file', file);
    setUploadingSelfie(true);
    setError('');

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fileData
      });
      const result = await response.json();
      if (result.success) {
        if (pendingAction === 'checkin') {
          await submitCheckIn(result.fileUrl);
        } else {
          await submitCheckOut(result.fileUrl);
        }
      } else {
        setError(result.message || 'Selfie upload failed.');
      }
    } catch (e) {
      setError('Failed to upload selfie.');
    } finally {
      setUploadingSelfie(false);
    }
  };

  const handleSkipSelfie = async () => {
    if (pendingAction === 'checkin') {
      await submitCheckIn(undefined);
    } else {
      await submitCheckOut(undefined);
    }
  };

  // Compute stats from history
  const presentDays = history.filter(h => h.record?.status === 'Present').length;
  const halfDays = history.filter(h => h.record?.status === 'Half Day').length;
  const absentDays = history.filter(h => h.record?.status === 'Absent').length;

  const getStatusColor = (status) => {
    if (status === 'Present') return 'success';
    if (status === 'Absent') return 'danger';
    if (status === 'Leave') return 'warning';
    if (status === 'Half Day') return 'info';
    return 'neutral';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Current time display
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const GreetIcon = currentHour < 12 ? Sun : currentHour < 17 ? Coffee : Moon;

  const isCheckedIn = todayRecord?.status === 'Present' || todayRecord?.status === 'Half Day';
  const isCheckedOut = isCheckedIn && !!todayRecord?.timeOut;
  const isMarked = !!todayRecord;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Alerts */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 className="spinner-icon" size={36} />
        </div>
      ) : !employeeId ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ color: 'var(--accent-red)', marginBottom: '16px', opacity: 0.7 }} />
          <h3 style={{ marginBottom: '8px' }}>Employee Profile Not Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your account is not linked to an employee profile yet. Please ask your admin to set this up.
          </p>
        </div>
      ) : (
        <>
          {/* Greeting & Profile Header */}
          <div className="glass-panel" style={{
            padding: '28px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'var(--gradient-hero)',
            color: '#fff',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 700, color: '#fff',
                border: '2px solid rgba(255,255,255,0.4)'
              }}>
                {user?.name?.[0]?.toUpperCase() || 'E'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GreetIcon size={18} style={{ opacity: 0.9 }} />
                  <span style={{ fontSize: '13px', opacity: 0.85 }}>{greeting}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{user?.name || 'Employee'}</h2>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                  {employeeData?.role || user?.designation || 'Staff'} • {employeeData?.shiftTimings?.start || '09:00'} – {employeeData?.shiftTimings?.end || '18:00'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '2px' }}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Today's Attendance Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* Status */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Status</span>
              {isMarked ? (
                <span className={`status-pill ${getStatusColor(todayRecord.status)}`} style={{ fontSize: '15px', padding: '6px 14px', width: 'fit-content' }}>
                  {todayRecord.status}
                </span>
              ) : (
                <span className="status-pill neutral" style={{ fontSize: '15px', padding: '6px 14px', width: 'fit-content' }}>Not Marked</span>
              )}
            </div>

            {/* Check In Time */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Check In
              </span>
              <span style={{ fontSize: '22px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--primary)' }}>
                {todayRecord?.timeIn || '--:--'}
              </span>
            </div>

            {/* Check Out Time */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Check Out
              </span>
              <span style={{ fontSize: '22px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                {todayRecord?.timeOut || '--:--'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0, textAlign: 'center', fontSize: '17px' }}>
              <CalendarCheck size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
              Mark Your Attendance
            </h3>

            {!isMarked ? (
              // Not yet checked in today
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '340px' }}>
                <button
                  id="btn-checkin"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px 24px', fontSize: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="spinner-icon" size={20} /> : <CheckCircle size={20} />}
                  Check In Now
                </button>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                  A selfie verification may be required for GPS-based tracking.
                </p>
              </div>
            ) : isCheckedIn && !isCheckedOut ? (
              // Checked in but not yet checked out
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '340px' }}>
                <div style={{
                  background: 'var(--accent-green-bg, rgba(52,199,89,0.1))',
                  border: '1px solid var(--accent-green, #34c759)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}>
                  <CheckCircle size={20} color="var(--accent-green, #34c759)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Checked In at {todayRecord?.timeIn}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shift in progress...</div>
                  </div>
                </div>
                <button
                  id="btn-checkout"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '14px 24px', fontSize: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="spinner-icon" size={20} /> : <LogOut size={20} />}
                  Check Out
                </button>
              </div>
            ) : isCheckedOut ? (
              // Fully done for the day
              <div style={{
                background: 'var(--surface-2, rgba(255,255,255,0.05))',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                textAlign: 'center',
                maxWidth: '340px',
                width: '100%'
              }}>
                <CheckCircle size={36} color="var(--accent-green, #34c759)" style={{ marginBottom: '10px' }} />
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Day Complete!</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  In: <strong>{todayRecord?.timeIn}</strong> &nbsp;|&nbsp; Out: <strong>{todayRecord?.timeOut}</strong>
                  {todayRecord?.overtimeHours > 0 && (
                    <div style={{ color: 'var(--accent-green)', marginTop: '4px' }}>Overtime: {todayRecord.overtimeHours} hrs</div>
                  )}
                </div>
              </div>
            ) : (
              // Marked as Absent/Leave by admin
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Your attendance was marked as <strong>{todayRecord?.status}</strong> by an admin.
              </div>
            )}

            {/* Selfie preview if available */}
            {todayRecord?.selfieUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Camera size={16} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-secondary)' }}>Selfie on record:</span>
                <a href={todayRecord.selfieUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={todayRecord.selfieUrl}
                    alt="Check-in selfie"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                </a>
              </div>
            )}
          </div>

          {/* 7-Day Stats + History */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', flexWrap: 'wrap' }}>
            {/* Stats */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <TrendingUp size={16} color="var(--primary)" /> Last 7 Days Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-green, #34c759)', display: 'inline-block' }} />
                    Present
                  </span>
                  <strong>{presentDays} days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--info, #007aff)', display: 'inline-block' }} />
                    Half Day
                  </span>
                  <strong>{halfDays} days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-red, #ff3b30)', display: 'inline-block' }} />
                    Absent
                  </span>
                  <strong>{absentDays} days</strong>
                </div>
              </div>
              {/* Mini attendance bar */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {history.slice().reverse().map((h, i) => (
                  <div
                    key={i}
                    title={`${formatDate(h.date)}: ${h.record?.status || 'No record'}`}
                    style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '4px',
                      background: h.record?.status === 'Present' ? 'var(--accent-green, #34c759)' :
                                  h.record?.status === 'Half Day' ? 'var(--info, #007aff)' :
                                  h.record?.status === 'Absent' ? 'var(--accent-red, #ff3b30)' :
                                  h.record?.status === 'Leave' ? 'var(--warning, #ff9500)' :
                                  'var(--border-color, rgba(255,255,255,0.1))'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* History List */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <Calendar size={16} color="var(--primary)" /> Recent Activity
              </h4>
              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <Loader2 className="spinner-icon" size={20} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {history.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: i === 0 ? 'var(--primary-light, rgba(102,126,234,0.1))' : 'var(--surface-2, rgba(255,255,255,0.03))',
                        fontSize: '13px'
                      }}
                    >
                      <span style={{ color: i === 0 ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: i === 0 ? 600 : 400 }}>
                        {formatDate(h.date)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {h.record ? (
                          <>
                            <span className={`status-pill ${getStatusColor(h.record.status)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {h.record.status}
                            </span>
                            {h.record.timeIn && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                {h.record.timeIn}{h.record.timeOut ? ` – ${h.record.timeOut}` : ''}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="status-pill neutral" style={{ fontSize: '11px', padding: '2px 8px' }}>No Record</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Selfie / Check-in Modal */}
      {selfieModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--primary)" />
                {pendingAction === 'checkin' ? 'Check In Verification' : 'Check Out Verification'}
              </h3>
              <button className="modal-close-btn" onClick={() => setSelfieModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {pendingAction === 'checkin'
                  ? 'Upload a selfie to verify your check-in for today.'
                  : 'Upload a selfie to verify your check-out.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <label
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', display: 'flex', gap: '8px', padding: '12px 28px', width: 'fit-content' }}
                >
                  {uploadingSelfie || actionLoading ? <Loader2 className="spinner-icon" size={18} /> : <Upload size={18} />}
                  {uploadingSelfie ? 'Uploading...' : 'Take / Upload Selfie'}
                  <input
                    type="file"
                    onChange={handleSelfieUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingSelfie || actionLoading}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                  onClick={handleSkipSelfie}
                  disabled={uploadingSelfie || actionLoading}
                >
                  {actionLoading ? <Loader2 className="spinner-icon" size={14} style={{ marginRight: '4px' }} /> : null}
                  Skip Selfie & Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
