import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="dashboard-bg">
      {/* Nav Bar */}
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-left">
          <img src={logo} alt="Logo" className="dashboard-navbar-logo" />
        </div>
        <div className="dashboard-navbar-search-profile">
          <div className="dashboard-navbar-search">
            <img src={searchIcon} alt="Search" className="dashboard-navbar-search-img" />
            <input className="dashboard-navbar-search-input" type="text" placeholder="Search..." />
          </div>
          <div className="dashboard-profile-dropdown-container">
            <button className="dashboard-navbar-btn" onClick={() => setShowProfileDropdown(v => !v)}>
              Profile
            </button>
            {showProfileDropdown && (
              <div className="dashboard-profile-dropdown">
                <button className="dashboard-profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}>Show Profile</button>
                <button className="dashboard-profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); handleLogout(); }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content-wrapper">
              {/* Logout Modal */}
              {showLogoutModal && (
                <div className="dashboard-logout-modal-bg">
                  <div className="dashboard-logout-modal">
                    <h3>Confirm Logout</h3>
                    <p>Are you sure you want to logout?</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button className="dashboard-profile-dropdown-item" onClick={confirmLogout}>Logout</button>
                      <button className="dashboard-profile-dropdown-item" onClick={cancelLogout}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
        <div className="dashboard-content">
          <h2 className="dashboard-title">Welcome back, Jc!</h2>
          <p className="dashboard-desc">
            You've successfully logged in to your <b>PAWthway Dashboard</b> — your digital path to smarter veterinary care. From here, you can browse nearby clinics, schedule appointments, and manage your pet's health records.
          </p>
          <button className="dashboard-explore-btn" onClick={() => navigate('/clinics')}>
            Explore Clinics
          </button>
        </div>
      </div>
    </div>
    );
    };

    export default Dashboard;