import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import { confirmAdminAppointment, fetchAdminAppointments } from '../utils/adminApi';
import '../App.css';

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  const clinic = useMemo(
    () => clinics.find((item) => String(item.id) === String(adminUser?.clinicId)),
    [adminUser?.clinicId]
  );

  const loadAppointments = useCallback(async () => {
    if (!adminUser?.id) {
      navigate('/admin/login');
      return;
    }

    try {
      const appointmentList = await fetchAdminAppointments(adminUser.id);
      setAppointments(appointmentList);
      setErrorMessage('');
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Unable to load clinic appointments.';
      setErrorMessage(message);
    }
  }, [adminUser?.id, navigate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleConfirm = async (appointmentId) => {
    try {
      await confirmAdminAppointment(appointmentId, adminUser.id);
      await loadAppointments();
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Unable to confirm appointment.';
      setErrorMessage(message);
    }
  };

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

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === 'all') {
      return true;
    }
    return String(appointment.status || '').toUpperCase() === filterStatus.toUpperCase();
  });

  const sortedAppointments = [...filteredAppointments].sort(
    (left, right) => new Date(right.appointmentDateTime) - new Date(left.appointmentDateTime)
  );

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
                    navigate('/admin/dashboard');
                  }}
                >
                  Dashboard
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

          {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}

          <div className="appointments-filter">
            <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
              All ({appointments.length})
            </button>
            <button className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`} onClick={() => setFilterStatus('PENDING')}>
              Pending ({appointments.filter((item) => String(item.status || '').toUpperCase() === 'PENDING').length})
            </button>
            <button className={`filter-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`} onClick={() => setFilterStatus('CONFIRMED')}>
              Confirmed ({appointments.filter((item) => String(item.status || '').toUpperCase() === 'CONFIRMED').length})
            </button>
          </div>

          <div className="appointments-list">
            {sortedAppointments.length === 0 ? (
              <div className="appointments-empty">
                <p className="homepage-desc">No appointments found for this filter.</p>
              </div>
            ) : (
              sortedAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-card-header">
                    <div>
                      <h3 className="appointment-clinic-name">{appointment.petName}</h3>
                      <p className="appointment-clinic-address">{appointment.ownerName}</p>
                    </div>
                    <span className={`appointment-status-badge status-${String(appointment.status || 'pending').toLowerCase()}`}>
                      {appointment.status || 'PENDING'}
                    </span>
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
                    {String(appointment.status || '').toUpperCase() === 'PENDING' && (
                      <button className="homepage-explore-btn" onClick={() => handleConfirm(appointment.id)}>
                        Confirm
                      </button>
                    )}
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

export default AdminAppointments;
