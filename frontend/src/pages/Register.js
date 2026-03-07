import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';

const Register = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/register',
        {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password
        }
      );
      localStorage.setItem('firstname', firstname.trim());
      localStorage.setItem('lastname', lastname.trim());
      console.log("Registration Success:", response.data);
      alert("Registration successful!");
      navigate('/login');

    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      alert(errorMessage);
    }
  };

  return (
        <div className="login-modal-bg">
        <div className="login-modal">
        <img src={logo} alt="Logo" className="login-modal-logo" />
        <h3 className="login-modal-title">REGISTER</h3>
        <form onSubmit={handleRegister}>
        <div className="login-modal-field">
        <label>First Name:</label>
        <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
        </div>

        <div className="login-modal-field">
        <label>Last Name:</label>
        <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
        </div>

        <div className="login-modal-field">
        <label>Email:</label>
        <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
        </div>
        <div className="login-modal-field">
        <label>Password:</label>
        <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

        </div>
        <button type="submit" className="green-btn login-modal-btn">Register</button>
    </form>

    <p className="login-modal-register"> Already have an account? <Link to="/login">Login</Link></p>
    </div>
  </div>
  );
};

export default Register;
