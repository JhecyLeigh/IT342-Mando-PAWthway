import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const firstName = storedUser?.firstname || localStorage.getItem('firstname') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('email');
    localStorage.removeItem('full_name');
    localStorage.removeItem('userName');
    navigate('/', { replace: true });
  };

  const dashboardActions = [
    {
      id: 'clinics',
      title: 'Explore Clinics',
      description: 'Browse clinics, check availability, and book appointments.',
      keywords: 'clinics appointments booking veterinary open closed schedule',
      onClick: () => navigate('/clinics')
    },
    {
      id: 'pets',
      title: 'Manage Pets',
      description: 'Register pets, update pet details, and review pet records.',
      keywords: 'pets pet registration edit delete records',
      onClick: () => navigate('/pets')
    }
  ];

  const searchablePages = [
    {
      id: 'search-clinics',
      label: 'Clinics',
      keywords: 'clinic clinics appointments booking veterinary',
      onSelect: () => navigate('/clinics')
    },
    {
      id: 'search-pets',
      label: 'My Pets',
      keywords: 'pet pets manage pets registered pets',
      onSelect: () => navigate('/pets')
    },
    {
      id: 'search-logout',
      label: 'Logout',
      keywords: 'logout sign out exit',
      onSelect: handleLogout
    }
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchedPages = normalizedQuery
    ? searchablePages.filter((page) =>
        `${page.label} ${page.keywords}`.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const handleSearchSelect = (page) => {
    setSearchQuery('');
    page.onSelect();
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    if (matchedPages.length > 0) {
      handleSearchSelect(matchedPages[0]);
    }
  };

  return (
    <div className="dashboard-bg">
      {/* Nav Bar */}
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
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {normalizedQuery && (
              <div className="dashboard-search-results">
                {matchedPages.length > 0 ? (
                  matchedPages.map((page) => (
                    <button
                      key={page.id}
                      className="dashboard-search-result-item"
                      onClick={() => handleSearchSelect(page)}
                    >
                      {page.label}
                    </button>
                  ))
                ) : (
                  <div className="dashboard-search-result-empty">
                    No matching pages found.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="dashboard-menu-dropdown-container">
            <button className="dashboard-navbar-btn" onClick={() => setShowProfileDropdown((value) => !value)}>
              Menu
            </button>
            {showProfileDropdown && (
              <div className="dashboard-menu-dropdown">
                <button
                  className="dashboard-menu-dropdown-item"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/clinics');
                  }}
                >
                  Clinics
                </button>
                <button
                  className="dashboard-menu-dropdown-item"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/pets');
                  }}
                >
                  My Pets
                </button>
                <button
                  className="dashboard-menu-dropdown-item"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content-wrapper">
        <div className="dashboard-content">
          <h2 className="dashboard-title">Welcome back, {firstName}!</h2>
          <p className="dashboard-desc">
            You've successfully logged in to your <b>PAWthway Dashboard</b> — your digital path to smarter veterinary care. From here, you can browse nearby clinics, schedule appointments, and manage your pet's health records.
          </p>
          <div className="dashboard-action-grid">
            {dashboardActions.map((action) => (
              <button key={action.id} className="dashboard-action-card" onClick={action.onClick}>
                <span className="dashboard-action-title">{action.title}</span>
                <span className="dashboard-action-desc">{action.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
    };
    
    export default Dashboard;
