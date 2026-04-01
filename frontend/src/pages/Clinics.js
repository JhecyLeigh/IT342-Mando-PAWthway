import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { getDeviceNow, isClinicOpen } from '../utils/clinicSchedule';
import { fetchPetsByUser } from '../utils/petApi';
import '../App.css';

const Clinics = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deviceNow, setDeviceNow] = useState(() => getDeviceNow());
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    petId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDeviceNow(getDeviceNow());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadPets = async () => {
      if (!user?.id) {
        setPets([]);
        return;
      }

      setPetsLoading(true);
      setPetsError('');

      try {
        const petList = await fetchPetsByUser(user.id);
        setPets(petList);
      } catch (error) {
        const message =
          error.response?.data ||
          error.response?.data?.message ||
          'Unable to load registered pets.';
        setPetsError(message);
      } finally {
        setPetsLoading(false);
      }
    };

    loadPets();
  }, [user?.id]);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    setShowLogoutModal(true);
  };

  const closeClinicModal = () => {
    setSelectedClinic(null);
    setSuccessMessage('');
    setErrorMessage('');
    setPetsError('');
    setAppointmentForm({
      petId: '',
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
    liveStatus: isClinicOpen(clinic.schedule, deviceNow) ? 'OPEN' : 'CLOSED'
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
    setSuccessMessage('');
    setErrorMessage('');
    setAppointmentForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleAppointmentSubmit = (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedClinic || selectedClinic.liveStatus !== 'OPEN') {
      setErrorMessage('This clinic is currently closed.');
      return;
    }

    if (!user?.id) {
      setErrorMessage('Please log in again before booking an appointment.');
      return;
    }

    if (!appointmentForm.petId) {
      setErrorMessage('Please register or select a pet before booking.');
      return;
    }

    const selectedPetRecord = pets.find((pet) => String(pet.id) === String(appointmentForm.petId));
    if (!selectedPetRecord) {
      setErrorMessage('Selected pet was not found. Please choose a registered pet.');
      return;
    }

    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const newAppointment = {
      id: Date.now(),
      clinicId: selectedClinic.id,
      clinicName: selectedClinic.name,
      clinicAddress: selectedClinic.address,
      userId: user.id,
      ownerName: user.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : 'User',
      ownerEmail: user.email || '',
      petId: selectedPetRecord.id,
      petName: selectedPetRecord.petName,
      appointmentDate: appointmentForm.appointmentDate,
      appointmentTime: appointmentForm.appointmentTime,
      reason: appointmentForm.reason.trim(),
      notes: appointmentForm.notes.trim(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('appointments', JSON.stringify([...existingAppointments, newAppointment]));
    setSuccessMessage('Appointment created successfully.');
    setAppointmentForm({
      petId: '',
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
                <button className="dashboard-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/pets'); }}>
                  My Pets
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
                  {successMessage && <p className="form-message form-message-success">{successMessage}</p>}
                  {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}
                  {petsError && <p className="form-message form-message-error">{petsError}</p>}
                  <form className="clinic-booking-form" onSubmit={handleAppointmentSubmit}>
                    <div className="appointment-field">
                      <label htmlFor="petId">Registered Pet</label>
                      <select
                        id="petId"
                        name="petId"
                        value={appointmentForm.petId}
                        onChange={handleAppointmentChange}
                        required
                        disabled={petsLoading || !user?.id}
                      >
                        <option value="">
                          {petsLoading ? 'Loading pets...' : pets.length > 0 ? 'Select a registered pet' : 'No registered pets yet'}
                        </option>
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.petName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="appointment-field">
                      <label htmlFor="reason">Reason</label>
                      <select
                        id="reason"
                        name="reason"
                        value={appointmentForm.reason}
                        onChange={handleAppointmentChange}
                        required
                      >
                        <option value="">Select a service</option>
                        {selectedClinic.services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
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
                    {pets.length === 0 && !petsLoading && (
                      <div className="clinic-booking-disabled">
                        <p>You need to register a pet before booking an appointment.</p>
                        <button
                          type="button"
                          className="dashboard-navbar-btn clinic-inline-action"
                          onClick={() => navigate('/pets')}
                        >
                          Go to My Pets
                        </button>
                      </div>
                    )}
                    {selectedClinic.liveStatus !== 'OPEN' && (
                      <div className="clinic-booking-disabled">
                        <p>This clinic is currently closed.</p>
                        <p>You can fill out the form, but booking is disabled until the clinic opens.</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="dashboard-explore-btn clinic-booking-btn"
                      disabled={selectedClinic.liveStatus !== 'OPEN' || !appointmentForm.petId || !user?.id || pets.length === 0}
                    >
                      Book Appointment
                    </button>
                  </form>
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
                onClick={() => {
                  setSuccessMessage('');
                  setErrorMessage('');
                  setPetsError('');
                  setSelectedClinic(clinic);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSuccessMessage('');
                    setErrorMessage('');
                    setPetsError('');
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
