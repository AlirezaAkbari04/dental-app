// src/components/auth/Register.js - UPDATED FOR FLEXIBLE LOGIN SYSTEM
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/Auth.css';
import { useUser } from '../../contexts/UserContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear error when user starts typing in any field
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.name || !formData.password || !formData.confirmPassword || (!formData.email && !formData.phone)) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Email validation if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
    }

    // Phone validation if provided
    if (formData.phone) {
      const phoneRegex = /^09[0-9]{9}$/; // Persian mobile format: 09XXXXXXXXX
      if (!phoneRegex.test(formData.phone)) {
        setError('Please enter a valid mobile number (example: 09123456789)');
        setIsLoading(false);
        return;
      }
    }

    // Password validation - at least 6 characters
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // UPDATED: Pass complete user data instead of just username
      const userData = {
        email: formData.email || null,
        phone: formData.phone || null,
        name: formData.name,
        password: formData.password // Password included for future use
      };

      const success = await register(userData);

      if (success) {
        console.log('Registration successful, navigating to role selection');
        // Navigate to role selection for new users
        navigate('/role-selection');
      } else {
        // Registration failed - user might already exist
        if (formData.email && formData.phone) {
          setError('A user with this email or mobile number already exists');
        } else if (formData.email) {
          setError('A user with this email already exists');
        } else {
          setError('A user with this mobile number already exists');
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="logo-container">
          <img
            src="/assets/images/logo.png"
            alt="Healthy Teeth Happy Smile"
            className="app-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
          />
          <h1 className="app-title">Register for Dental Health App</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={error && !formData.name ? 'input-error' : ''}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Optional if mobile number is provided)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className={error && !formData.email && !formData.phone ? 'input-error' : ''}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile Number (Optional if email is provided)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="09123456789"
              className={error && !formData.phone && !formData.email ? 'input-error' : ''}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={error && !formData.password ? 'input-error' : ''}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={error && !formData.confirmPassword ? 'input-error' : ''}
              disabled={isLoading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-links">
          Already registered? <Link to="/login">Login to your account</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
