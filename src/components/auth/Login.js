// src/components/auth/Login.js - FIXED VERSION
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import '../../styles/Auth.css';
import logoImage from '../../logo.svg';

const Login = () => {
  const [credentials, setCredentials] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useUser();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Pass the credentials in the expected format
      const user = await login({ username: credentials });
  
      if (user) {
        console.log('Login successful, user:', user);
        
        // Check if user has a role assigned
        if (user.role && user.role !== '') {
          // User has role, redirect to appropriate dashboard
          switch (user.role) {
            case 'child':
              navigate('/dashboard/child');
              break;
            case 'parent':
              navigate('/dashboard/parent');
              break;
            case 'teacher':
              navigate('/dashboard/caretaker');
              break;
            default:
              // If role is unrecognized, go to role selection
              navigate('/role-selection');
          }
        } else {
          // User has no role assigned, go to role selection
          navigate('/role-selection');
        }
      } else {
        setError('Login error. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="logo-container">
          <img src={logoImage} alt="Healthy Teeth Happy Smile" className="app-logo" />
          <h1 className="app-title">Healthy Teeth Happy Smile</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="credentials">Email or Mobile Number</label>
            <input
              type="text"
              id="credentials"
              value={credentials}
              onChange={handleInputChange}
              placeholder="Enter your email or mobile number"
              className={error ? 'input-error' : ''}
              disabled={isLoading}
              required
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="auth-button" disabled={isLoading || !credentials.trim()}>
            {isLoading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register" className="register-link">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;