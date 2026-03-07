import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        {
          email: email,
          password: password
        }
      );
      console.log("Login Success:", response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message ||
        "Invalid email or password";
      alert(message);
    }
  };

  return (
        <div className="login-modal-bg">
        <div className="login-modal">
        <img src={logo} alt="Logo" className="login-modal-logo" />
        <h3 className="login-modal-title">LOGIN</h3>
        <form onSubmit={handleLogin}>
            <div className="login-modal-field">
            <label>Email</label>
            <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                />
            </div>
            <div className="login-modal-field">
            <label>Password</label>
            <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                />
            </div>
            <button className="green-btn login-modal-btn">Login</button>
        </form>

        <p className="login-modal-register">Don't have an account? <Link to="/register">Register</Link> </p>
        </div>
    </div>
  );
};
export default Login;
