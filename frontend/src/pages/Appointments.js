import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import '../App.css';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    loadAppointments();
  }, [user?.id, navigate]);

  const loadAppointments = () => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const userAppointments = allAppointments.filter((apt) => apt.userId === user?.id);
    setAppointments(userAppointments);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('email');
    localStorage.removeItem('full_name');
    localStorage.removeItem('userName');
    setShowLogoutModal(false);
    navigate('/', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.filter((apt) => apt.id !== appointmentId);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    loadAppointments();
  };

  const getAppointmentStatus = (appointmentDate, appointmentTime) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      return 'completed';
    }
    return 'upcoming';
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'all') return true;
    return getAppointmentStatus(apt.appointmentDate, apt.appointmentTime) === filterStatus;
  });

  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(`${b.appointmentDate}T${b.appointmentTime}`) - new Date(`${a.appointmentDate}T${a.appointmentTime}`)
  );

  return (
    <div className="homepage-bg">
      <nav className="homepage-navbar">
        <div className="homepage-navbar-left">
          <img src={logo} alt="Logo" className="homepage-navbar-logo" />
        </div>
        <div className="homepage-navbar-search-menu">
          <div className="homepage-navbar-search">
            <img src={searchIcon} alt="Search" className="homepage-navbar-search-img" />
            <input
              className="homepage-navbar-search-input"
              type="text"
              value="My Appointments"
              readOnly
            />
          </div>
          <div className="homepage-menu-dropdown-container">
            <button className="homepage-navbar-btn" onClick={() => setShowProfileDropdown((value) => !value)}>
              Menu
            </button>
            {showProfileDropdown && (
              <div className="homepage-menu-dropdown">
                <button className="homepage-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/homepage'); }}>
                  Homepage
                </button>
                <button className="homepage-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/clinics'); }}>
                  Clinics
                </button>
                <button className="homepage-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/pets'); }}>
                  My Pets
                </button>
                <button className="homepage-menu-dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="homepage-content-wrapper">
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

        <div className="homepage-content">
          <div className="appointment-header">
            <div>
              <h2 className="homepage-title">My Appointments</h2>
              <p className="homepage-desc">View and manage your scheduled appointments</p>
            </div>
            <button className="homepage-explore-btn" onClick={() => navigate('/clinics')}>
              Book New Appointment
            </button>
          </div>

          <div className="appointments-filter">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({appointments.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming ({appointments.filter((apt) => getAppointmentStatus(apt.appointmentDate, apt.appointmentTime) === 'upcoming').length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed ({appointments.filter((apt) => getAppointmentStatus(apt.appointmentDate, apt.appointmentTime) === 'completed').length})
            </button>
          </div>

          {sortedAppointments.length === 0 ? (
            <div className="appointments-empty">
              <p className="homepage-desc">
                {appointments.length === 0
                  ? "You don't have any appointments yet."
                  : `No ${filterStatus} appointments found.`}
              </p>
              <button className="homepage-explore-btn" onClick={() => navigate('/clinics')}>
                Book an Appointment
              </button>
            </div>
          ) : (
            <div className="appointments-list">
              {sortedAppointments.map((appointment) => {
                const status = getAppointmentStatus(appointment.appointmentDate, appointment.appointmentTime);
                return (
                  <div key={appointment.id} className={`appointment-card ${status}`}>
                    <div className="appointment-card-header">
                      <div>
                        <h3 className="appointment-clinic-name">{appointment.clinicName}</h3>
                        <p className="appointment-clinic-address">{appointment.clinicAddress}</p>
                      </div>
                      <span className={`appointment-status-badge status-${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>

                    <div className="appointment-card-details">
                      <div className="appointment-detail-row">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">
                          {new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`).toLocaleString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="appointment-detail-row">
                        <span className="detail-label">Pet:</span>
                        <span className="detail-value">{appointment.petName}</span>
                      </div>

                      <div className="appointment-detail-row">
                        <span className="detail-label">Service:</span>
                        <span className="detail-value">{appointment.reason}</span>
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
                        className="appointment-delete-btn"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
