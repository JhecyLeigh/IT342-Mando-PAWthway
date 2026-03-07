import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../App.css";

function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <img src={logo} alt="Logo" className="logo" />
      <div className="button-group">
        <button className="green-btn" onClick={() => navigate("/login")}>Login</button>
        <button className="green-btn" onClick={() => navigate("/register")}>Register</button>
      </div>
      <div className="footer">
        ©2026 PAWthway. All Rights Reserved.
      </div>
    </div>
  );
}

export default Homepage;