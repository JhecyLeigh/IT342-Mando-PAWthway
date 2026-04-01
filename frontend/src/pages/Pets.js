import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { deletePet, fetchPetsByUser, registerPet, updatePet } from '../utils/petApi';
import '../App.css';

const Pets = () => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [isUpdatingPet, setIsUpdatingPet] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState(null);
  const [petPendingDelete, setPetPendingDelete] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [petForm, setPetForm] = useState({
    petName: '',
    petType: '',
    age: ''
  });
  const [editForm, setEditForm] = useState({
    petName: '',
    petType: '',
    age: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const loadPets = async () => {
      if (!user?.id) {
        setPets([]);
        return;
      }

      setPetsLoading(true);
      setErrorMessage('');

      try {
        const petList = await fetchPetsByUser(user.id);
        setPets(petList);
      } catch (error) {
        const message =
          error.response?.data ||
          error.response?.data?.message ||
          'Unable to load registered pets.';
        setErrorMessage(message);
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

  const handlePetFormChange = (event) => {
    const { name, value } = event.target;
    setErrorMessage('');
    setSuccessMessage('');
    setPetForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setErrorMessage('');
    setSuccessMessage('');
    setEditForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handlePetSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setErrorMessage('Please log in again before registering a pet.');
      return;
    }

    if (!petForm.petName.trim() || !petForm.petType.trim()) {
      setErrorMessage('Pet name and pet type are required.');
      return;
    }

    setIsSavingPet(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const createdPet = await registerPet({
        userId: user.id,
        petName: petForm.petName.trim(),
        petType: petForm.petType.trim(),
        age: petForm.age ? Number(petForm.age) : null
      });

      setPets((current) => [...current, createdPet].sort((a, b) => a.petName.localeCompare(b.petName)));
      setSuccessMessage('Pet registered successfully.');
      setShowRegisterModal(false);
      setPetForm({
        petName: '',
        petType: '',
        age: ''
      });
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Pet registration failed.';
      setErrorMessage(message);
    } finally {
      setIsSavingPet(false);
    }
  };

  const openRegisterModal = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setPetForm({
      petName: '',
      petType: '',
      age: ''
    });
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setPetForm({
      petName: '',
      petType: '',
      age: ''
    });
  };

  const startEditingPet = (pet) => {
    setEditingPetId(pet.id);
    setErrorMessage('');
    setSuccessMessage('');
    setEditForm({
      petName: pet.petName,
      petType: pet.petType,
      age: pet.age ?? ''
    });
  };

  const cancelEditingPet = () => {
    setEditingPetId(null);
    setEditForm({
      petName: '',
      petType: '',
      age: ''
    });
  };

  const handleUpdatePet = async (event) => {
    event.preventDefault();

    if (!user?.id || !editingPetId) {
      setErrorMessage('Please log in again before editing a pet.');
      return;
    }

    if (!editForm.petName.trim() || !editForm.petType.trim()) {
      setErrorMessage('Pet name and pet type are required.');
      return;
    }

    setIsUpdatingPet(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedPet = await updatePet(editingPetId, {
        userId: user.id,
        petName: editForm.petName.trim(),
        petType: editForm.petType.trim(),
        age: editForm.age ? Number(editForm.age) : null
      });

      setPets((current) =>
        current
          .map((pet) => (pet.id === updatedPet.id ? updatedPet : pet))
          .sort((a, b) => a.petName.localeCompare(b.petName))
      );
      setSuccessMessage('Pet updated successfully.');
      cancelEditingPet();
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Pet update failed.';
      setErrorMessage(message);
    } finally {
      setIsUpdatingPet(false);
    }
  };

  const requestDeletePet = (pet) => {
    setErrorMessage('');
    setSuccessMessage('');
    setPetPendingDelete(pet);
  };

  const cancelDeletePet = () => {
    if (deletingPetId) {
      return;
    }

    setPetPendingDelete(null);
  };

  const handleDeletePet = async () => {
    if (!petPendingDelete?.id) {
      return;
    }

    if (!user?.id) {
      setErrorMessage('Please log in again before deleting a pet.');
      return;
    }

    const petId = petPendingDelete.id;

    setDeletingPetId(petId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deletePet(petId, user.id);
      setPets((current) => current.filter((pet) => pet.id !== petId));
      if (editingPetId === petId) {
        cancelEditingPet();
      }
      setSuccessMessage('Pet deleted successfully.');
      setPetPendingDelete(null);
    } catch (error) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        'Pet deletion failed.';
      setErrorMessage(message);
    } finally {
      setDeletingPetId(null);
    }
  };

  return (
    <div className="dashboard-bg">
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-left">
          <img src={logo} alt="Logo" className="dashboard-navbar-logo" />
        </div>
        <div className="dashboard-navbar-search-menu">
          <div className="dashboard-navbar-search">
            <img src={searchIcon} alt="Search" className="dashboard-navbar-search-img" />
            <input className="dashboard-navbar-search-input" type="text" value="Pet Registration" readOnly />
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
                <button className="dashboard-menu-dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="dashboard-content-wrapper pets-page-wrapper">
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

        {petPendingDelete && (
          <div className="clinic-modal-backdrop" onClick={cancelDeletePet}>
            <section className="clinic-modal pet-delete-modal" onClick={(event) => event.stopPropagation()}>
              <div className="clinic-modal-header">
                <div>
                  <h3 className="clinic-modal-title">Delete Pet</h3>
                  <p className="clinic-modal-notes">
                    Are you sure you want to delete <strong>{petPendingDelete.petName}</strong>? This action cannot be undone.
                  </p>
                </div>
                <button className="clinic-modal-close" onClick={cancelDeletePet} disabled={deletingPetId === petPendingDelete.id}>×</button>
              </div>
              <div className="pet-delete-actions">
                <button
                  type="button"
                  className="dashboard-navbar-btn pet-delete-cancel-btn"
                  onClick={cancelDeletePet}
                  disabled={deletingPetId === petPendingDelete.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dashboard-explore-btn pet-delete-confirm-btn"
                  onClick={handleDeletePet}
                  disabled={deletingPetId === petPendingDelete.id}
                >
                  {deletingPetId === petPendingDelete.id ? 'Deleting...' : 'Delete Pet'}
                </button>
              </div>
            </section>
          </div>
        )}

        <div className="pets-page-shell">
          {successMessage && <p className="form-message form-message-success">{successMessage}</p>}
          {errorMessage && <p className="form-message form-message-error">{errorMessage}</p>}

          <div className="pets-modal-grid">
            <section className="clinic-modal pets-page-modal">
              <div className="pet-listing-header">
                <h3>Registered Pets</h3>
                <div className="pet-listing-actions">
                  <button
                    type="button"
                    className="pet-icon-btn pet-icon-btn-add pet-header-add-btn"
                    onClick={openRegisterModal}
                    aria-label="Add pet"
                    title="Add Pet" 
                    >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
                    </svg>
                  </button>
                  

                  <button className="clinics-back-btn" onClick={() => navigate('/clinics')}>
                    Back to Clinics
                  </button>
                 
        
                </div>
              </div>
              {petsLoading ? (
                <p className="clinic-modal-notes">Loading pets...</p>
              ) : pets.length === 0 ? (
                <div className="clinic-booking-disabled">
                  <p>No pets registered yet.</p>
                  <p>Register your pet now.</p>
                  <button
                    type="button"
                    className="pet-icon-btn pet-icon-btn-add clinic-inline-action"
                    onClick={openRegisterModal}
                    aria-label="Register pet"
                    title="Register Pet"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="pets-list">
                  {pets.map((pet) => (
                    <article key={pet.id} className="pet-card">
                      {editingPetId === pet.id ? (
                        <form className="pet-edit-form" onSubmit={handleUpdatePet}>
                          <div className="pet-card-header">
                            <h4>Edit Pet</h4>
                            <div className="pet-card-actions">
                              <button
                                type="submit"
                                className="pet-icon-btn"
                                disabled={isUpdatingPet}
                                aria-label="Save pet"
                                title="Save"
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M17 3H5a2 2 0 0 0-2 2v14h18V7zm-5 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6M6 8V5h8v3z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="pet-icon-btn pet-icon-btn-danger"
                                onClick={cancelEditingPet}
                                aria-label="Cancel editing"
                                title="Cancel"
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="appointment-field">
                            <label htmlFor={`edit-pet-name-${pet.id}`}>Pet Name</label>
                            <input
                              id={`edit-pet-name-${pet.id}`}
                              name="petName"
                              type="text"
                              value={editForm.petName}
                              onChange={handleEditFormChange}
                              required
                            />
                          </div>
                          <div className="appointment-field">
                            <label htmlFor={`edit-pet-type-${pet.id}`}>Pet Type</label>
                            <input
                              id={`edit-pet-type-${pet.id}`}
                              name="petType"
                              type="text"
                              value={editForm.petType}
                              onChange={handleEditFormChange}
                              required
                            />
                          </div>
                          <div className="appointment-field">
                            <label htmlFor={`edit-pet-age-${pet.id}`}>Age</label>
                            <input
                              id={`edit-pet-age-${pet.id}`}
                              name="age"
                              type="number"
                              min="0"
                              value={editForm.age}
                              onChange={handleEditFormChange}
                            />
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="pet-card-header">
                            <h4>{pet.petName}</h4>
                            <div className="pet-card-actions">
                              <button
                                type="button"
                                className="pet-icon-btn"
                                onClick={() => startEditingPet(pet)}
                                aria-label="Edit pet"
                                title="Edit"
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="m3 17.25 9.06-9.06 3.75 3.75L6.75 21H3zm14.71-9.04a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-1.42 0L12.77 5.3l3.75 3.75z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="pet-icon-btn pet-icon-btn-danger"
                                onClick={() => requestDeletePet(pet)}
                                disabled={deletingPetId === pet.id}
                                aria-label="Delete pet"
                                title="Delete"
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M9 3h6l1 2h5v2H3V5h5zm1 6h2v8h-2zm4 0h2v8h-2zM6 9h2v8H6zm1 11a2 2 0 0 1-2-2V8h14v10a2 2 0 0 1-2 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p><strong>Pet Type:</strong> {pet.petType}</p>
                          <p><strong>Age:</strong> {pet.age ?? 'Not specified'}</p>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {showRegisterModal && (
            <div className="clinic-modal-backdrop" onClick={closeRegisterModal}>
              <section className="clinic-modal pets-register-modal" onClick={(event) => event.stopPropagation()}>
                <div className="clinic-modal-header">
                  <div>
                    <h3 className="clinic-modal-title">Register Pet</h3>
                    <p className="clinic-modal-notes">Add a new pet to your account.</p>
                  </div>
                  <button className="clinic-modal-close" onClick={closeRegisterModal}>×</button>
                </div>
                <form className="appointment-form" onSubmit={handlePetSubmit}>
                  <div className="appointment-grid">
                    <div className="appointment-field">
                      <label htmlFor="petName">Pet Name</label>
                      <input id="petName" name="petName" type="text" value={petForm.petName} onChange={handlePetFormChange} required />
                    </div>
                    <div className="appointment-field">
                      <label htmlFor="petType">Pet Type</label>
                      <input id="petType" name="petType" type="text" value={petForm.petType} onChange={handlePetFormChange} required />
                    </div>
                    <div className="appointment-field">
                      <label htmlFor="petAge">Age</label>
                      <input id="petAge" name="age" type="number" min="0" value={petForm.age} onChange={handlePetFormChange} />
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <button type="submit" className="dashboard-explore-btn" disabled={isSavingPet || !user?.id}>
                      {isSavingPet ? 'Registering Pet...' : 'Register Pet'}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pets;
