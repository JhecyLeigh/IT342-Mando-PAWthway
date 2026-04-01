import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';

const Homepage = () => {
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

  const homepageActions = [
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
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {normalizedQuery && (
              <div className="homepage-search-results">
                {matchedPages.length > 0 ? (
                  matchedPages.map((page) => (
                    <button
                      key={page.id}
                      className="homepage-search-result-item"
                      onClick={() => handleSearchSelect(page)}
                    >
                      {page.label}
                    </button>
                  ))
                ) : (
                  <div className="homepage-search-result-empty">
                    No matching pages found.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="homepage-menu-dropdown-container">
            <button className="homepage-navbar-btn" onClick={() => setShowProfileDropdown((value) => !value)}>
              Menu
            </button>
            {showProfileDropdown && (
              <div className="homepage-menu-dropdown">
                <button
                  className="homepage-menu-dropdown-item"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/clinics');
                  }}
                >
                  Clinics
                </button>
                <button
                  className="homepage-menu-dropdown-item"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/pets');
                  }}
                >
                  My Pets
                </button>
                <button
                  className="homepage-menu-dropdown-item"
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

      <div className="homepage-content-wrapper">
        <div className="homepage-content">
          <h2 className="homepage-title">Welcome back, {firstName}!</h2>
          <p className="homepage-desc">
            You've successfully logged in to your <b>PAWthway Homepage</b> - your digital path to smarter veterinary care. From here, you can browse nearby clinics, schedule appointments, and manage your pet's health records.
          </p>
          <div className="homepage-action-grid">
            {homepageActions.map((action) => (
              <button key={action.id} className="homepage-action-card" onClick={action.onClick}>
                <span className="homepage-action-title">{action.title}</span>
                <span className="homepage-action-desc">{action.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
    };
    
    export default Homepage;
