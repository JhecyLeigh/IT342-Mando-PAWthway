import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { isClinicOpen } from '../utils/clinicSchedule';
import { fetchPetsByUser } from '../utils/petApi';
import '../App.css';

const Appointment = () => {
  const navigate = useNavigate();
  const { clinicId } = useParams();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState('');
  const [formData, setFormData] = useState({
    petId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const clinic = useMemo(
    () => clinics.find((item) => String(item.id) === String(clinicId)),
    [clinicId]
  );
  const clinicStatus = clinic && isClinicOpen(clinic.schedule) ? 'OPEN' : 'CLOSED';

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSuccessMessage('');
    setErrorMessage('');
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!clinic || clinicStatus !== 'OPEN') {
      setErrorMessage('This clinic is currently closed.');
      return;
    }

    if (!user?.id) {
      setErrorMessage('Please log in again before booking an appointment.');
      return;
    }

    if (!formData.petId) {
      setErrorMessage('Please register or select a pet before booking.');
      return;
    }

    const selectedPetRecord = pets.find((pet) => String(pet.id) === String(formData.petId));
    if (!selectedPetRecord) {
      setErrorMessage('Selected pet was not found. Please choose a registered pet.');
      return;
    }

    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const newAppointment = {
      id: Date.now(),
      clinicId: clinic.id,
      clinicName: clinic.name,
      clinicAddress: clinic.address,
      userId: user.id,
      ownerName: user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : 'User',
      ownerEmail: user?.email || '',
      petId: selectedPetRecord.id,
      petName: selectedPetRecord.petName,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      reason: formData.reason.trim(),
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('appointments', JSON.stringify([...existingAppointments, newAppointment]));
    setSuccessMessage('Appointment created successfully.');
    setFormData({
      petId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: ''
    });
  };

  if (!clinic) {
    return (
      <div className="dashboard-bg">
        <nav className="dashboard-navbar">
          <div className="dashboard-navbar-left">
            <img src={logo} alt="Logo" className="dashboard-navbar-logo" />
          </div>
        </nav>
        <div className="dashboard-content-wrapper">
          <div className="dashboard-content appointment-page">
            <h2 className="dashboard-title">Clinic not found</h2>
            <p className="dashboard-desc">The selected clinic does not exist.</p>
            <button className="dashboard-explore-btn" onClick={() => navigate('/clinics')}>
              Back to Clinics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg">
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
              value={clinic.name}
              readOnly
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
                <button className="dashboard-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/clinics'); }}>
                  Clinics
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

      <div className="dashboard-content-wrapper appointment-wrapper">
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

        <div className="dashboard-content appointment-page">
          <div className="appointment-header">
            <div>
              <p className="appointment-label">Create Appointment</p>
              <h2 className="dashboard-title appointment-title">{clinic.name}</h2>
              <p className="dashboard-desc appointment-desc">{clinic.address}</p>
            </div>
            <button className="clinics-back-btn" onClick={() => navigate('/clinics')}>
              Back to Clinics
            </button>
          </div>

          <div className="appointment-clinic-meta">
            <span><strong>Phone:</strong> {clinic.phone}</span>
            <span><strong>Schedule:</strong> {clinic.schedule}</span>
            <span><strong>Status:</strong> {clinicStatus}</span>
          </div>

          {successMessage && <p className="form-message form-message-success">{successMessage}</p>}
          {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}
          {petsError && <p className="form-message form-message-error">{petsError}</p>}

          <form className="appointment-form" onSubmit={handleSubmit}>
            <div className="appointment-grid">
              <div className="appointment-field">
                <label htmlFor="petId">Registered Pet</label>
                <select
                  id="petId"
                  name="petId"
                  value={formData.petId}
                  onChange={handleChange}
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
                  value={formData.reason}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a service</option>
                  {clinic.services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              <div className="appointment-field">
                <label htmlFor="appointmentDate">Date</label>
                <input id="appointmentDate" name="appointmentDate" type="date" value={formData.appointmentDate} onChange={handleChange} required />
              </div>
              <div className="appointment-field">
                <label htmlFor="appointmentTime">Time</label>
                <input id="appointmentTime" name="appointmentTime" type="time" value={formData.appointmentTime} onChange={handleChange} required />
              </div>
            </div>

            <div className="appointment-field">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Optional notes for the clinic" />
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

            {clinicStatus !== 'OPEN' && (
              <div className="clinic-booking-disabled">
                <p>This clinic is currently closed.</p>
                <p>You can prepare the appointment details, but the booking button is disabled until the clinic opens.</p>
              </div>
            )}

            <div className="appointment-actions">
              <button type="submit" className="dashboard-explore-btn" disabled={clinicStatus !== 'OPEN' || !formData.petId || !user?.id || pets.length === 0}>
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
