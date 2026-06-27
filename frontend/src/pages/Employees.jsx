import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  UserCheck, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Upload,
  Camera,
  ExternalLink,
  Edit
} from 'lucide-react';

const Employees = ({ initialTab = 'directory' }) => {
  const { user, token, authFetch } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [payroll, setPayroll] = useState([]);
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'directory', 'attendance', 'payroll'
  const [loading, setLoading] = useState(true);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payroll date select
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Selfie check-in states
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [selfieEmployeeId, setSelfieEmployeeId] = useState('');
  const [selfieRoleStatus, setSelfieRoleStatus] = useState('');
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    baseSalary: '15000',
    overtimeRate: '150',
    workingHours: '8',
    shiftStart: '09:00',
    shiftEnd: '18:00'
  });

  const fixedRoles = [
    "Cashier",
    "Sales Executive",
    "Store Keeper",
    "Warehouse Staff",
    "Inventory Manager",
    "Purchase Executive",
    "HR Executive",
    "Receptionist",
    "Customer Support",
    "Technician",
    "Driver",
    "Office Assistant",
    "Intern",
    "Other"
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const empRes = await authFetch('/api/v1/employees');
      const empData = await empRes.json();

      if (empData.success) {
        setEmployees(empData.data);
      } else {
        setError(empData.message || 'Could not load employees.');
      }

      const attRes = await authFetch(`/api/v1/attendance?date=${todayStr}`);
      const attData = await attRes.json();
      if (attData.success) {
        setAttendanceRecords(attData.data || []);
      }
    } catch (err) {
      setError('Connection to backend API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const response = await authFetch('/api/v1/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          salaryDetails: {
            baseSalary: Number(formData.baseSalary),
            overtimeRate: Number(formData.overtimeRate),
            workingHours: Number(formData.workingHours)
          },
          shiftTimings: {
            start: formData.shiftStart,
            end: formData.shiftEnd
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Employee record created successfully!');
        setIsAddModalOpen(false);
        fetchData();
      } else {
        setError(result.message || 'Creation failed');
      }
    } catch (err) {
      setError('Failed to create employee profile.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`/api/v1/employees/${currentEmployee._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          salaryDetails: {
            baseSalary: Number(formData.baseSalary),
            overtimeRate: Number(formData.overtimeRate),
            workingHours: Number(formData.workingHours)
          },
          shiftTimings: {
            start: formData.shiftStart,
            end: formData.shiftEnd
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Employee updated successfully!');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      setError('Failed to update employee profile.');
    }
  };

  const handleDeactivate = async (employeeId) => {
    if (!window.confirm('Deactivate employee? Status will be set to Inactive.')) return;
    setError('');
    setSuccess('');

    try {
      const response = await authFetch(`/api/v1/employees/${employeeId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Employee deactivated successfully');
        fetchData();
      } else {
        setError(result.message || 'Deactivation failed');
      }
    } catch (err) {
      setError('Failed to deactivate employee.');
    }
  };

  const handleCheckInClick = (employeeId, status) => {
    if (['Present', 'Half Day'].includes(status)) {
      setSelfieEmployeeId(employeeId);
      setSelfieRoleStatus(status);
      setSelfieModalOpen(true);
    } else {
      submitCheckIn(employeeId, status, undefined);
    }
  };

  const submitCheckIn = async (employeeId, status, selfieUrl) => {
    setError('');
    setSuccess('');
    const timeIn = new Date().toTimeString().split(' ')[0].substring(0, 5);

    try {
      const response = await authFetch('/api/v1/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          date: todayStr,
          status,
          timeIn,
          selfieUrl
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(`Attendance logged as ${status}.`);
        setSelfieModalOpen(false);
        setSelfieEmployeeId('');
        fetchData();
      } else {
        setError(result.message || 'Logging failed');
      }
    } catch (err) {
      setError('Failed to log check-in.');
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
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fileData
      });
      const result = await response.json();
      if (result.success) {
        submitCheckIn(selfieEmployeeId, selfieRoleStatus, result.fileUrl);
      } else {
        setError(result.message || 'Selfie upload failed');
      }
    } catch (err) {
      setError('Failed to connect to upload server.');
    } finally {
      setUploadingSelfie(false);
    }
  };

  const handleCheckOut = async (employeeId) => {
    setError('');
    setSuccess('');
    const timeOut = new Date().toTimeString().split(' ')[0].substring(0, 5);

    try {
      const response = await authFetch('/api/v1/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          date: todayStr,
          timeOut
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Check-out recorded and hours computed.');
        fetchData();
      } else {
        setError(result.message || 'Check-out failed');
      }
    } catch (err) {
      setError('Failed to log check-out.');
    }
  };

  const calculatePayroll = async () => {
    if (!isRoleAllowed(['Admin', 'Accountant'])) return;
    setPayrollLoading(true);
    setPayroll([]);
    setError('');
    try {
      const res = await authFetch(`/api/v1/attendance/payroll?month=${selectedMonth}`);
      const result = await res.json();
      if (result.success) {
        setPayroll(result.data);
      } else {
        setError(result.message || 'Could not fetch payroll logs.');
      }
    } catch (err) {
      setError('Failed to query payroll.');
    } finally {
      setPayrollLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      role: '',
      baseSalary: '15000',
      overtimeRate: '150',
      workingHours: '8',
      shiftStart: '09:00',
      shiftEnd: '18:00'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (emp) => {
    setCurrentEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      baseSalary: (emp.salaryDetails?.baseSalary ?? 0).toString(),
      overtimeRate: (emp.salaryDetails?.overtimeRate ?? 0).toString(),
      workingHours: (emp.salaryDetails?.workingHours ?? 8).toString(),
      shiftStart: emp.shiftTimings?.start || '09:00',
      shiftEnd: emp.shiftTimings?.end || '18:00'
    });
    setIsEditModalOpen(true);
  };

  const isRoleAllowed = (roles) => {
    return user && roles.includes(user.role);
  };

  const canViewPayroll = isRoleAllowed(['Admin', 'Accountant']);
  const canManageAttendance = isRoleAllowed(['Admin', 'Manager']);

  const getAttendanceRecord = (employeeId) => {
    return attendanceRecords.find((record) => {
      const recordEmpId = record.employeeId?._id || record.employeeId;
      return String(recordEmpId) === String(employeeId);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Alert overlays */}
      {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
      {success && <div className="success-message"><AlertTriangle size={16} /> {success}</div>}

      {/* Tabs Row */}
      <div className="glass-panel" style={{ display: 'flex', padding: '6px', gap: '8px' }}>
        <button 
          className={`btn ${activeTab === 'directory' ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ borderRadius: 'var(--radius-md)', padding: '8px 16px' }}
          onClick={() => setActiveTab('directory')}
        >
          <Users size={16} /> Staff Directory
        </button>
        {canManageAttendance && (
          <button
            className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-md)', padding: '8px 16px' }}
            onClick={() => setActiveTab('attendance')}
          >
            <Calendar size={16} /> Attendance
          </button>
        )}
        {canViewPayroll && (
          <button
            className={`btn ${activeTab === 'payroll' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-md)', padding: '8px 16px' }}
            onClick={() => setActiveTab('payroll')}
          >
            <DollarSign size={16} /> Payroll & Salaries
          </button>
        )}
      </div>

      {loading && activeTab !== 'payroll' ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="spinner-icon" size={32} />
        </div>
      ) : activeTab === 'directory' ? (
        // STAFF DIRECTORY VIEW
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="page-actions-row" style={{ justifyContent: 'flex-end' }}>
            {isRoleAllowed(['Admin', 'Manager']) && (
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} /> Add Employee
              </button>
            )}
          </div>

          {employees.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
              <p>No active employees registered.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role Designation</th>
                    <th>Shift Hours</th>
                    <th>Base Monthly Payout</th>
                    <th>Overtime Hourly Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td><div style={{ fontWeight: 600 }}>{emp.name}</div></td>
                      <td><span className="status-pill info">{emp.role}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <Clock size={12} className="sidebar-icon" />
                          {emp.shiftTimings?.start || '09:00'} - {emp.shiftTimings?.end || '18:00'} ({emp.salaryDetails?.workingHours || 8} hrs)
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{(emp.salaryDetails?.baseSalary ?? 0).toLocaleString('en-IN')}</td>
                      <td>₹{emp.salaryDetails?.overtimeRate || 0} / hr</td>
                      <td>
                        <span className={`status-pill ${emp.status === 'Active' ? 'success' : 'neutral'}`}>{emp.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {isRoleAllowed(['Admin', 'Manager']) && (
                            <button className="action-btn" title="Edit details" onClick={() => openEditModal(emp)}>
                              <Edit size={16} />
                            </button>
                          )}
                          {isRoleAllowed(['Admin']) && emp.status === 'Active' && (
                            <button className="action-btn delete" title="Deactivate" onClick={() => handleDeactivate(emp._id)}>
                              <X size={16} />
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
        </div>
      ) : activeTab === 'attendance' ? (
        // ATTENDANCE REGISTER VIEW
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Calendar size={18} color="var(--primary)" />
            <span>Today's Date: <strong>{new Date().toDateString()}</strong></span>
          </div>

          {employees.filter(e => e.status === 'Active').length === 0 ? (
            <p>No active employees to log attendance for.</p>
          ) : (
            <div className="attendance-grid">
              {employees.filter(e => e.status === 'Active').map((emp) => {
                const record = getAttendanceRecord(emp._id);
                return (
                  <div key={emp._id} className="attendance-card glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '15px' }}>{emp.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>{emp.role}</span>
                      </div>
                      {record ? (
                        <span className={`status-pill ${
                          record.status === 'Present' ? 'success' :
                          record.status === 'Absent' ? 'danger' :
                          record.status === 'Leave' ? 'warning' : 'info'
                        }`}>
                          {record.status}
                        </span>
                      ) : (
                        <span className="status-pill neutral">Unmarked</span>
                      )}
                    </div>

                    {/* Attendance Mark Options */}
                    {!record && canManageAttendance ? (
                      <div className="attendance-options">
                        <button className="attendance-opt-btn Present active" onClick={() => handleCheckInClick(emp._id, 'Present')}>Present</button>
                        <button className="attendance-opt-btn Absent active" onClick={() => handleCheckInClick(emp._id, 'Absent')}>Absent</button>
                        <button className="attendance-opt-btn Leave active" onClick={() => handleCheckInClick(emp._id, 'Leave')}>Leave</button>
                        <button className="attendance-opt-btn HalfDay active" onClick={() => handleCheckInClick(emp._id, 'Half Day')}>Half Day</button>
                      </div>
                    ) : !record ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Attendance has not been marked yet.
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>Check In: <strong>{record.timeIn || '--:--'}</strong></div>
                        {record.selfieUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Selfie:</span>
                            <a href={record.selfieUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                              <img src={record.selfieUrl} alt="Selfie preview" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                            </a>
                          </div>
                        )}
                        <div>Check Out: <strong>{record.timeOut || '--:--'}</strong></div>
                        {record.overtimeHours > 0 && <div style={{ color: 'var(--accent-green)' }}>Overtime: <strong>{record.overtimeHours} hrs</strong></div>}
                        
                        {/* Check Out button */}
                        {canManageAttendance && ['Present', 'Half Day'].includes(record.status) && !record.timeOut && (
                          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '6px' }} onClick={() => handleCheckOut(emp._id)}>
                            Check Out
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // PAYROLL & SALARIES VIEW
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ minWidth: '180px' }}>
              <label className="form-label" htmlFor="pay-month">Select Salary Month</label>
              <input 
                id="pay-month"
                type="month" 
                className="form-input" 
                style={{ paddingLeft: '16px' }} 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            </div>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={calculatePayroll}>
              Compute Payouts
            </button>
          </div>

          {payrollLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 className="spinner-icon" size={28} />
            </div>
          ) : payroll.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Award size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>Choose month and compute payouts to generate financial salaries ledger.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Attendance (P/HD/L/A)</th>
                    <th>Base Salary</th>
                    <th>Overtime Bonus</th>
                    <th>Deductions</th>
                    <th>Net Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((pay, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{pay.employee?.name}</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pay.employee?.role}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          Present: <strong>{pay.summary?.present}</strong> | Half: {pay.summary?.halfDay} | Leave: {pay.summary?.leave} | Absent: {pay.summary?.absent}
                        </div>
                        {pay.summary?.overtimeHours > 0 && <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>OT hours: {pay.summary?.overtimeHours}</span>}
                      </td>
                      <td>₹{pay.baseSalary.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--accent-green)' }}>+₹{pay.overtimePay.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--accent-red)' }}>-₹{pay.deductions.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '15px' }}>₹{pay.netSalary.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- ADD EMPLOYEE MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Register Employee Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="emp-name">Full Name *</label>
                  <input id="emp-name" type="text" name="name" className="form-input" placeholder="e.g. Vikram Malhotra" style={{ paddingLeft: '16px' }} value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="emp-role">Designation / Role *</label>
                  <select
                    id="emp-role"
                    name="role"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Role</option>
                    {fixedRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="emp-salary">Base Monthly Salary (₹) *</label>
                    <input id="emp-salary" type="number" name="baseSalary" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.baseSalary} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emp-ot">Overtime Hourly Rate (₹)</label>
                    <input id="emp-ot" type="number" name="overtimeRate" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.overtimeRate} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="emp-hours">Daily Standard Shift Hours</label>
                    <input id="emp-hours" type="number" name="workingHours" min="1" className="form-input" style={{ paddingLeft: '16px' }} value={formData.workingHours} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label className="form-label" htmlFor="emp-start">Shift Start</label>
                      <input id="emp-start" type="text" name="shiftStart" className="form-input" placeholder="HH:MM" style={{ paddingLeft: '12px' }} value={formData.shiftStart} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="emp-end">Shift End</label>
                      <input id="emp-end" type="text" name="shiftEnd" className="form-input" placeholder="HH:MM" style={{ paddingLeft: '12px' }} value={formData.shiftEnd} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT EMPLOYEE MODAL --- */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Edit Employee Specifications</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-emp-name">Full Name *</label>
                  <input id="edit-emp-name" type="text" name="name" className="form-input" style={{ paddingLeft: '16px' }} value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-emp-role">Designation / Role *</label>
                  <select
                    id="edit-emp-role"
                    name="role"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Role</option>
                    {fixedRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-emp-salary">Base Monthly Salary (₹) *</label>
                    <input id="edit-emp-salary" type="number" name="baseSalary" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.baseSalary} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-emp-ot">Overtime Hourly Rate (₹)</label>
                    <input id="edit-emp-ot" type="number" name="overtimeRate" min="0" className="form-input" style={{ paddingLeft: '16px' }} value={formData.overtimeRate} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-emp-hours">Daily Standard Shift Hours</label>
                    <input id="edit-emp-hours" type="number" name="workingHours" min="1" className="form-input" style={{ paddingLeft: '16px' }} value={formData.workingHours} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label className="form-label" htmlFor="edit-emp-start">Shift Start</label>
                      <input id="edit-emp-start" type="text" name="shiftStart" className="form-input" style={{ paddingLeft: '12px' }} value={formData.shiftStart} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="edit-emp-end">Shift End</label>
                      <input id="edit-emp-end" type="text" name="shiftEnd" className="form-input" style={{ paddingLeft: '12px' }} value={formData.shiftEnd} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ATTENDANCE SELFIE MODAL --- */}
      {selfieModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container glass-panel" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--primary)" /> Selfie Verification
              </h3>
              <button className="modal-close-btn" onClick={() => setSelfieModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Please upload a check-in photo/selfie to log attendance as <strong>{selfieRoleStatus}</strong>.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', gap: '8px', padding: '12px 24px', width: 'fit-content' }}>
                  {uploadingSelfie ? <Loader2 className="spinner-icon" size={16} /> : <Upload size={16} />}
                  {uploadingSelfie ? 'Uploading photo...' : 'Take/Upload Photo'}
                  <input type="file" onChange={handleSelfieUpload} accept="image/*" style={{ display: 'none' }} disabled={uploadingSelfie} />
                </label>

                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                  onClick={() => submitCheckIn(selfieEmployeeId, selfieRoleStatus, undefined)}
                  disabled={uploadingSelfie}
                >
                  Skip Selfie & Log Punch-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
