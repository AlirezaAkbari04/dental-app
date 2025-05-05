import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/Auth.css'; // Changed from '../styles/Auth.css'
import logoImage from '../../logo.svg'; // Changed from '../logo.svg'

const Login = () => {
  const [credentials, setCredentials] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input (email or phone number)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09[0-9]{9}$/; // Persian mobile format: 09XXXXXXXXX
    
    if (!emailRegex.test(credentials) && !phoneRegex.test(credentials)) {
      setError('لطفا ایمیل یا شماره موبایل معتبر وارد کنید');
      return;
    }
    
    // For demo purposes, simulate login success
    // In a real app, you would call your authentication API here
    console.log('Login attempt with:', credentials);
    
    // Navigate to role selection page upon successful login
    navigate('/role-selection');
  };

  return (
    <div className="auth-container" dir="rtl">
      <div className="auth-form-container">
        <div className="logo-container">
          <img src={logoImage} alt="لبخند شاد دندان سالم" className="app-logo" />
          <h1 className="app-title">لبخند شاد دندان سالم</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="credentials">ایمیل یا شماره موبایل</label>
            <input
              type="text"
              id="credentials"
              value={credentials}
              onChange={handleInputChange}
              placeholder="ایمیل یا شماره موبایل خود را وارد کنید"
              className={error ? 'input-error' : ''}
              dir="ltr" // Input direction is LTR even in RTL layout
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <button type="submit" className="auth-button">
            ادامه
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/register" className="register-link">
            حساب ندارید؟ ثبت‌نام کنید
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;