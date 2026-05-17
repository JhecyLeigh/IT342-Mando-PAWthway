import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import {
  fetchAdminDashboard,
} from '../utils/adminApi';
import '../App.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  const clinic = clinics.find((item) => String(item.id) === String(adminUser?.clinicId));

  const loadData = useCallback(async () => {
    if (!adminUser?.id) {
      navigate('/admin/login');
      return;
    }

    try {
      setLoading(true);
      const dashboardData = await fetchAdminDashboard(adminUser.id);
      setSummary(dashboardData);
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

  const requestLogout = () => {
    setShowAdminMenu(false);
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    setShowLogoutModal(false);
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
          <div className="admin-navbar-clinic-name">{clinic?.name || `Clinic #${adminUser?.clinicId || ''}`}</div>
          <div className="homepage-menu-dropdown-container">
            <button className="homepage-navbar-btn" onClick={() => setShowAdminMenu((value) => !value)}>
              Menu
            </button>
            {showAdminMenu && (
              <div className="homepage-menu-dropdown">
                <button
                  className="homepage-menu-dropdown-item"
                  onClick={() => {
                    setShowAdminMenu(false);
                    navigate('/admin/appointments');
                  }}
                >
                  Appointments
                </button>
                <button
                  className="homepage-menu-dropdown-item"
                  onClick={() => {
                    setShowAdminMenu(false);
                    navigate('/admin/logs');
                  }}
                >
                  Logs
                </button>
                <button className="homepage-menu-dropdown-item" onClick={requestLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="homepage-logout-modal-bg">
          <div className="homepage-logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="homepage-logout-actions">
              <button className="homepage-logout-btn" onClick={confirmLogout}>Logout</button>
              <button className="homepage-logout-btn homepage-logout-btn-secondary" onClick={cancelLogout}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="homepage-content-wrapper">
        <div className="homepage-content">
          <div className="appointment-header">
            <div>
              <p className="appointment-label">Clinic Admin</p>
              <h2 className="homepage-title">
                {clinic?.name || `Clinic #${adminUser?.clinicId || ''}`}
              </h2>
            </div>
          </div>

          {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}
            <span>
              <strong>{clinic?.address || 'Clinic details unavailable'}</strong>
            </span>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
