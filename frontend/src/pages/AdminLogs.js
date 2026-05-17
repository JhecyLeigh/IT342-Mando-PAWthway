import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { fetchAdminLogs } from '../utils/adminApi';
import '../App.css';

const AdminLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  const clinic = useMemo(
    () => clinics.find((item) => String(item.id) === String(adminUser?.clinicId)),
    [adminUser?.clinicId]
  );

  useEffect(() => {
    const loadLogs = async () => {
      if (!adminUser?.id) {
        navigate('/admin/login');
        return;
      }

      try {
        const logList = await fetchAdminLogs(adminUser.id);
        setLogs(logList);
        setErrorMessage('');
      } catch (error) {
        const message =
          error.response?.data ||
          error.response?.data?.message ||
          'Unable to load logs.';
        setErrorMessage(message);
      }
    };

    loadLogs();
  }, [adminUser?.id, navigate]);

  return (
    <div className="homepage-bg">
      <nav className="homepage-navbar">
        <div className="homepage-navbar-left">
          <img src={logo} alt="Logo" className="homepage-navbar-logo" />
        </div>
        <div className="homepage-navbar-search-menu">
          <div className="homepage-navbar-search">
            <img src={searchIcon} alt="Search" className="homepage-navbar-search-img" />
            <input className="homepage-navbar-search-input" type="text" value="Clinic Logs" readOnly />
          </div>
          <div className="appointment-card-actions">
            <button className="homepage-navbar-btn" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
            <button className="homepage-navbar-btn" onClick={() => navigate('/admin/appointments')}>Appointments</button>
          </div>
        </div>
      </nav>

      <div className="homepage-content-wrapper">
        <div className="homepage-content">
          <div className="appointment-header">
            <div>
              <p className="appointment-label">Clinic Activity Logs</p>
              <h2 className="homepage-title">{clinic?.name || `Clinic #${adminUser?.clinicId || ''}`}</h2>
              <p className="homepage-desc">Every appointment action recorded for this clinic.</p>
            </div>
          </div>

          {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}

          <div className="appointments-list">
            {logs.length === 0 ? (
              <div className="appointments-empty">
                <p className="homepage-desc">No logs available yet.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="appointment-card">
                  <div className="appointment-card-header">
                    <div>
                      <h3 className="appointment-clinic-name">{log.actionType}</h3>
                      <p className="appointment-clinic-address">
                        {log.actorName} - {log.actorRole}
                      </p>
                    </div>
                    <span className="appointment-status-badge status-upcoming">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="appointment-card-details">
                    <div className="appointment-detail-row">
                      <span className="detail-label">Details:</span>
                      <span className="detail-value">{log.details}</span>
                    </div>
                    <div className="appointment-detail-row">
                      <span className="detail-label">Appointment:</span>
                      <span className="detail-value">#{log.appointmentId || 'N/A'}</span>
                    </div>
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

export default AdminLogs;
