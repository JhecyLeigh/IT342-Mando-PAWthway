import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import '../App.css';

const DAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

const CEBU_TIMEZONE = 'Asia/Manila';

function parseTimeToMinutes(timeValue) {
  const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

function getCebuNow() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CEBU_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === 'weekday')?.value || 'Sun';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0');

  return {
    weekday,
    dayIndex: DAY_INDEX[weekday] ?? 0,
    minutesNow: hour * 60 + minute
  };
}

function isClinicOpen(schedule, currentTime) {
  if (!schedule) {
    return false;
  }

  if (/24\/7/i.test(schedule)) {
    return true;
  }

  if (/available on request|booking-based|appointment/i.test(schedule)) {
    return false;
  }

  const segments = schedule.split(',').map((segment) => segment.trim()).filter(Boolean);

  for (const segment of segments) {
    if (/closed/i.test(segment)) {
      continue;
    }

    const rangeMatch = segment.match(/^(Daily|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:-(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)$/i);
    if (!rangeMatch) {
      continue;
    }

    const startDay = rangeMatch[1];
    const endDay = rangeMatch[2];
    const openMinutes = parseTimeToMinutes(rangeMatch[3]);
    const closeMinutes = parseTimeToMinutes(rangeMatch[4]);

    if (openMinutes === null || closeMinutes === null) {
      continue;
    }

    const days = [];

    if (/^daily$/i.test(startDay)) {
      days.push(0, 1, 2, 3, 4, 5, 6);
    } else if (endDay) {
      const startIndex = DAY_INDEX[startDay];
      const endIndex = DAY_INDEX[endDay];
      if (startIndex !== undefined && endIndex !== undefined) {
        for (let day = startIndex; day <= endIndex; day += 1) {
          days.push(day);
        }
      }
    } else {
      const dayIndex = DAY_INDEX[startDay];
      if (dayIndex !== undefined) {
        days.push(dayIndex);
      }
    }

    const matchesDay = days.includes(currentTime.dayIndex);
    const matchesTime = currentTime.minutesNow >= openMinutes && currentTime.minutesNow <= closeMinutes;

    if (matchesDay && matchesTime) {
      return true;
    }
  }

  return false;
}

const Clinics = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [cebuNow, setCebuNow] = useState(() => getCebuNow());
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    petName: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCebuNow(getCebuNow());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    setShowLogoutModal(true);
  };

  const closeClinicModal = () => {
    setSelectedClinic(null);
    setSuccessMessage('');
    setAppointmentForm({
      petName: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: ''
    });
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

  const locations = ['All', ...Array.from(new Set(clinics.map((clinic) => clinic.area))).sort()];
  const statuses = ['All', 'OPEN', 'CLOSED'];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const buildClinicMark = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();

  const clinicsWithLiveStatus = clinics.map((clinic) => ({
    ...clinic,
    liveStatus: isClinicOpen(clinic.schedule, cebuNow) ? 'OPEN' : 'CLOSED'
  }));

  const filteredClinics = clinicsWithLiveStatus
    .filter((clinic) => {
      if (!normalizedQuery) {
        return true;
      }

      const searchableText = `${clinic.name} ${clinic.area} ${clinic.address} ${clinic.notes}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    })
    .filter((clinic) => locationFilter === 'All' || clinic.area === locationFilter)
    .filter((clinic) => statusFilter === 'All' || clinic.liveStatus === statusFilter)
    .sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'A-Z' ? comparison : -comparison;
    });

  const handleAppointmentChange = (event) => {
    const { name, value } = event.target;
    setAppointmentForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleAppointmentSubmit = (event) => {
    event.preventDefault();

    if (!selectedClinic || selectedClinic.liveStatus !== 'OPEN') {
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const newAppointment = {
      id: Date.now(),
      clinicId: selectedClinic.id,
      clinicName: selectedClinic.name,
      clinicAddress: selectedClinic.address,
      ownerName: user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : 'User',
      ownerEmail: user?.email || '',
      petName: appointmentForm.petName.trim(),
      appointmentDate: appointmentForm.appointmentDate,
      appointmentTime: appointmentForm.appointmentTime,
      reason: appointmentForm.reason.trim(),
      notes: appointmentForm.notes.trim(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('appointments', JSON.stringify([...existingAppointments, newAppointment]));
    setSuccessMessage('Appointment created successfully.');
    setAppointmentForm({
      petName: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: ''
    });
  };

  return (
    <div className="dashboard-bg clinics-page-shell">
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-left">
          <img src={logo} alt="Logo" className="dashboard-navbar-logo" />
        </div>
        <div className="dashboard-navbar-search-menu">
          <div className="dashboard-navbar-search">
            <img src={searchIcon} alt="Search" className="dashboard-navbar-search-img" />
            <input
              className="dashboard-navbar-search-input"
              type="text"
              placeholder="Search clinics, areas, or addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="dashboard-menu-dropdown-container">
            <button className="dashboard-navbar-btn" onClick={() => setShowProfileDropdown((value) => !value)}>
              Menu
            </button>
            {showProfileDropdown && (
              <div className="dashboard-menu-dropdown">
                <button className="dashboard-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/dashboard'); }}>
                  Dashboard
                </button>
                <button className="dashboard-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/'); }}>
                  Home
                </button>
                <button className="dashboard-menu-dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="clinics-layout">
        {showLogoutModal && (
          <div className="dashboard-logout-modal-bg">
            <div className="dashboard-logout-modal">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="dashboard-logout-actions">
                <button className="dashboard-logout-btn" onClick={confirmLogout}>Logout</button>
                <button className="dashboard-logout-btn dashboard-logout-btn-secondary" onClick={cancelLogout}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {selectedClinic && (
          <div className="clinic-modal-backdrop" onClick={closeClinicModal}>
            <div className="clinic-modal" onClick={(event) => event.stopPropagation()}>
              <div className="clinic-modal-header">
                <div>
                  <h2 className="clinic-modal-title">{selectedClinic.name}</h2>
                  <p className="clinic-modal-address">{selectedClinic.address}</p>
                </div>
                <button className="clinic-modal-close" onClick={closeClinicModal}>×</button>
              </div>

              <div className="clinic-modal-grid">
                <div className="clinic-modal-section">
                  <div className="clinic-modal-status-row">
                    <span className={`clinic-status clinic-status-${selectedClinic.liveStatus.toLowerCase()}`}>
                      {selectedClinic.liveStatus}
                    </span>
                    <span className="clinic-modal-phone">{selectedClinic.phone}</span>
                  </div>
                  <p className="clinic-modal-schedule"><strong>Schedule:</strong> {selectedClinic.schedule}</p>
                  <p className="clinic-modal-notes">{selectedClinic.notes}</p>

                  <div className="clinic-modal-services">
                    <h3>Services Offered</h3>
                    <div className="clinic-services-list">
                      {selectedClinic.services.map((service) => (
                        <span key={service} className="clinic-service-chip">{service}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="clinic-modal-section clinic-modal-booking">
                  <h3>Book Appointment</h3>
                  {selectedClinic.liveStatus === 'OPEN' ? (
                    <>
                      {successMessage && <p className="form-message form-message-success">{successMessage}</p>}
                      <form className="clinic-booking-form" onSubmit={handleAppointmentSubmit}>
                        <div className="appointment-field">
                          <label htmlFor="petName">Pet Name</label>
                          <input id="petName" name="petName" type="text" value={appointmentForm.petName} onChange={handleAppointmentChange} required />
                        </div>
                        <div className="appointment-field">
                          <label htmlFor="reason">Reason</label>
                          <input id="reason" name="reason" type="text" value={appointmentForm.reason} onChange={handleAppointmentChange} required />
                        </div>
                        <div className="clinic-booking-split">
                          <div className="appointment-field">
                            <label htmlFor="appointmentDate">Date</label>
                            <input id="appointmentDate" name="appointmentDate" type="date" value={appointmentForm.appointmentDate} onChange={handleAppointmentChange} required />
                          </div>
                          <div className="appointment-field">
                            <label htmlFor="appointmentTime">Time</label>
                            <input id="appointmentTime" name="appointmentTime" type="time" value={appointmentForm.appointmentTime} onChange={handleAppointmentChange} required />
                          </div>
                        </div>
                        <div className="appointment-field">
                          <label htmlFor="notes">Notes</label>
                          <textarea id="notes" name="notes" rows="4" value={appointmentForm.notes} onChange={handleAppointmentChange} placeholder="Optional notes for the clinic" />
                        </div>
                        <button type="submit" className="dashboard-explore-btn clinic-booking-btn">Book Appointment</button>
                      </form>
                    </>
                  ) : (
                    <div className="clinic-booking-disabled">
                      <p>This clinic is currently closed.</p>
                      <p>Appointments can only be booked while the clinic is open.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="clinics-page-content">
          <div className="clinics-filter-bar">
            <div className="clinics-filter">
              <label htmlFor="locationFilter">Location</label>
              <select
                id="locationFilter"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="clinics-filter">
              <label htmlFor="statusFilter">Clinic Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="clinics-filter">
              <label htmlFor="sortOrder">Sort</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
              </select>
            </div>

            <button className="clinics-back-btn clinics-filter-action" onClick={() => navigate('/dashboard')}>
              Back
            </button>
          </div>

          <div className="clinics-summary">
            Showing {filteredClinics.length} clinic{filteredClinics.length === 1 ? '' : 's'}
          </div>

          <div className="clinics-grid">
            {filteredClinics.map((clinic) => (
              <article
                key={clinic.id}
                className="clinic-card clinic-card-clickable"
                onClick={() => { setSuccessMessage(''); setSelectedClinic(clinic); }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSuccessMessage('');
                    setSelectedClinic(clinic);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="clinic-card-visual">
                  <div className="clinic-card-badge">{buildClinicMark(clinic.name)}</div>
                  <span className="clinic-area">{clinic.area}</span>
                </div>
                <div className="clinic-card-body">
                  <div className="clinic-card-top">
                    <h2 className="clinic-name">{clinic.name}</h2>
                    <span className={`clinic-status clinic-status-${clinic.liveStatus.toLowerCase()}`}>
                      {clinic.liveStatus}
                    </span>
                  </div>
                  <p className="clinic-address">{clinic.address}</p>
                  <div className="clinic-meta">
                    <p><strong>Phone:</strong> {clinic.phone}</p>
                    <p><strong>Schedule:</strong> {clinic.schedule}</p>
                  </div>
                  <p className="clinic-notes">{clinic.notes}</p>
                  <div className="clinic-card-footer">
                    <span className="clinic-book-link">View Details & Book</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredClinics.length === 0 && (
            <div className="clinics-empty">
              No clinics match the selected filters. Try a different location, status, or sorting option.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clinics;
