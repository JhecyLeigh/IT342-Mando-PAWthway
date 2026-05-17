import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clinics from '../data/clinics';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import {
  getClinicBookingTimeSlots,
  getManilaTodayDateValue,
  isClinicOpen
} from '../utils/clinicSchedule';
import { createAppointment } from '../utils/appointmentApi';
import { fetchPetsByUser } from '../utils/petApi';
import '../App.css';

const CreateAppointment = () => {
  const navigate = useNavigate();
  const { clinicId } = useParams();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setClockTick] = useState(() => Date.now());
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
  const todayDateValue = getManilaTodayDateValue();
  const clinic = useMemo(
    () => clinics.find((item) => String(item.id) === String(clinicId)),
    [clinicId]
  );
  const clinicStatus = clinic && isClinicOpen(clinic.schedule) ? 'OPEN' : 'CLOSED';
  const availableTimeSlots = clinic
    ? getClinicBookingTimeSlots(clinic.schedule, formData.appointmentDate)
    : [];
  const selectedTimeSlot = availableTimeSlots.find((slot) => slot.value === formData.appointmentTime);
  const canSubmitBooking =
    Boolean(
      clinic &&
      user?.id &&
      pets.length > 0 &&
      formData.petId &&
      formData.appointmentDate &&
      selectedTimeSlot
    );

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick(Date.now());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

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
      ...(name === 'appointmentDate' ? { appointmentTime: '' } : {}),
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    const currentTodayDateValue = getManilaTodayDateValue();
    const availableTimeSlotsForDate = getClinicBookingTimeSlots(clinic.schedule, formData.appointmentDate);

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

    if (!formData.appointmentDate) {
      setErrorMessage('Please choose an appointment date.');
      return;
    }

    if (formData.appointmentDate < currentTodayDateValue) {
      setErrorMessage('You cannot book an appointment for a past date.');
      return;
    }

    if (!availableTimeSlotsForDate.some((slot) => slot.value === formData.appointmentTime)) {
      setErrorMessage('Please choose a time within the clinic open hours.');
      return;
    }

    const selectedPetRecord = pets.find((pet) => String(pet.id) === String(formData.petId));
    if (!selectedPetRecord) {
      setErrorMessage('Selected pet was not found. Please choose a registered pet.');
      return;
    }

    if (!selectedPetRecord.petType) {
      setErrorMessage('Selected pet is missing its type. Please update the pet profile first.');
      return;
    }

    const appointmentPayload = {
      userId: user.id,
      clinicId: clinic.id,
      petId: selectedPetRecord.id,
      petType: selectedPetRecord.petType,
      petAge: selectedPetRecord.age ?? null,
      service: formData.reason.trim(),
      appointmentDateTime: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
      status: 'PENDING',
      notes: formData.notes.trim()
    };

    createAppointment(appointmentPayload)
      .then(() => {
        setSuccessMessage('Appointment created successfully.');
        setFormData({
          petId: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: '',
          notes: ''
        });
      })
      .catch((error) => {
        const message =
          error.response?.data ||
          error.response?.data?.message ||
          'Unable to create appointment.';
        setErrorMessage(message);
      });
  };

  if (!clinic) {
    return (
      <div className="homepage-bg">
        <nav className="homepage-navbar">
          <div className="homepage-navbar-left">
            <img src={logo} alt="Logo" className="homepage-navbar-logo" />
          </div>
        </nav>
        <div className="homepage-content-wrapper">
          <div className="homepage-content appointment-page">
            <h2 className="homepage-title">Clinic not found</h2>
            <p className="homepage-desc">The selected clinic does not exist.</p>
            <button className="homepage-explore-btn" onClick={() => navigate('/clinics')}>
              Back to Clinics
            </button>
          </div>
        </div>
      </div>
    );
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
            <input
              className="homepage-navbar-search-input"
              type="text"
              value={clinic.name}
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
                <button className="homepage-menu-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/appointments'); }}>
                  Appointments
                </button>
                <button className="homepage-menu-dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="homepage-content-wrapper appointment-wrapper">
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

        <div className="homepage-content appointment-page">
          <div className="appointment-header">
            <div>
              <p className="appointment-label">Create Appointment</p>
              <h2 className="homepage-title appointment-title">{clinic.name}</h2>
              <p className="homepage-desc appointment-desc">{clinic.address}</p>
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
                <input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={todayDateValue}
                  required
                />
              </div>
              <div className="appointment-field">
                <label htmlFor="appointmentTime">Time</label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  className="appointment-time-select"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  disabled={!formData.appointmentDate || availableTimeSlots.length === 0}
                  required
                >
                  <option value="">
                    {formData.appointmentDate
                      ? availableTimeSlots.length > 0
                        ? 'Select an available time'
                        : 'No available time slots'
                      : 'Choose a date first'}
                  </option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
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
                  className="homepage-navbar-btn clinic-inline-action"
                  onClick={() => navigate('/pets')}
                >
                  Go to My Pets
                </button>
              </div>
            )}

            {clinicStatus !== 'OPEN' && (
              <div className="clinic-booking-disabled">
                <p>This clinic is currently closed.</p>
                <p>You can still book a future slot as long as the selected date and time fall within the clinic hours.</p>
              </div>
            )}

            <div className="appointment-actions">
              <button type="submit" className="homepage-explore-btn" disabled={!canSubmitBooking}>
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;
