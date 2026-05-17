import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import {
  confirmAdminAppointment,
  fetchAdminDashboard,
  fetchPendingAdminAppointments
} from '../utils/adminApi';
import '../App.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  const clinic = clinics.find((item) => String(item.id) === String(adminUser?.clinicId));

  const loadData = useCallback(async () => {
    if (!adminUser?.id) {
      navigate('/admin/login');
      return;
    }

    try {
      setLoading(true);
      const [dashboardData, pendingData] = await Promise.all([
        fetchAdminDashboard(adminUser.id),
        fetchPendingAdminAppointments(adminUser.id)
      ]);
      setSummary(dashboardData);
      setPendingAppointments(pendingData);
      setErrorMessage('');
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Unable to load admin dashboard.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [adminUser?.id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirm = async (appointmentId) => {
    try {
      await confirmAdminAppointment(appointmentId, adminUser.id);
      await loadData();
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Unable to confirm appointment.';
      setErrorMessage(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return <div className="homepage-bg"><p className="homepage-desc">Loading admin dashboard...</p></div>;
  }

  return (
    <div className="homepage-bg">
      <nav className="homepage-navbar">
        <div className="homepage-navbar-left">
          <img src={logo} alt="Logo" className="homepage-navbar-logo" />
        </div>
        <div className="homepage-navbar-search-menu">
          <div className="homepage-navbar-search">
            <img src={searchIcon} alt="Search" className="homepage-navbar-search-img" />
            <input className="homepage-navbar-search-input" type="text" value="Admin Dashboard" readOnly />
          </div>
          <button className="homepage-navbar-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="homepage-content-wrapper">
        <div className="homepage-content">
          <div className="appointment-header">
            <div>
              <p className="appointment-label">Clinic Admin</p>
              <h2 className="homepage-title">
                {clinic?.name || `Clinic #${adminUser?.clinicId || ''}`}
              </h2>
              <p className="homepage-desc">
                Manage appointments, confirm bookings, and review clinic activity logs.
              </p>
            </div>
            <div className="appointment-card-actions">
              <button className="homepage-explore-btn" onClick={() => navigate('/admin/appointments')}>
                Appointments
              </button>
              <button className="homepage-explore-btn" onClick={() => navigate('/admin/logs')}>
                Logs
              </button>
            </div>
          </div>

          {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}

          <div className="clinics-summary" style={{ marginBottom: '1rem' }}>
            Clinic: {clinic?.address || 'Clinic details unavailable'}
          </div>

          <div className="clinic-stats-grid">
            <div className="clinic-stat-card">
              <strong>{summary?.pendingAppointments ?? 0}</strong>
              <span>Pending</span>
            </div>
            <div className="clinic-stat-card">
              <strong>{summary?.confirmedAppointments ?? 0}</strong>
              <span>Confirmed</span>
            </div>
            <div className="clinic-stat-card">
              <strong>{summary?.totalAppointments ?? 0}</strong>
              <span>Total</span>
            </div>
            <div className="clinic-stat-card">
              <strong>{summary?.totalLogs ?? 0}</strong>
              <span>Logs</span>
            </div>
          </div>

          <div className="appointments-list" style={{ marginTop: '1.5rem' }}>
            <h3 className="homepage-title" style={{ marginBottom: '1rem' }}>Appointments to Confirm</h3>
            {pendingAppointments.length === 0 ? (
              <div className="appointments-empty">
                <p className="homepage-desc">No pending appointments for this clinic.</p>
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-card-header">
                    <div>
                      <h3 className="appointment-clinic-name">{appointment.petName}</h3>
                      <p className="appointment-clinic-address">
                        {appointment.ownerName} - {appointment.ownerEmail}
                      </p>
                    </div>
                    <span className="appointment-status-badge status-upcoming">Pending</span>
                  </div>
                  <div className="appointment-card-details">
                    <div className="appointment-detail-row">
                      <span className="detail-label">Service:</span>
                      <span className="detail-value">{appointment.service}</span>
                    </div>
                    <div className="appointment-detail-row">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-value">
                        {new Date(appointment.appointmentDateTime).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {appointment.notes && (
                      <div className="appointment-detail-row">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{appointment.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="appointment-card-actions">
                    <button
                      className="homepage-explore-btn"
                      onClick={() => handleConfirm(appointment.id)}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
