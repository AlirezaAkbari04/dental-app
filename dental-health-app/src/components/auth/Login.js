// src/components/auth/Login.js
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
    
    // Validate input (email or phone number)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09[0-9]{9}$/; // Persian mobile format: 09XXXXXXXXX
    
    if (!emailRegex.test(credentials) && !phoneRegex.test(credentials)) {
      setError('لطفا ایمیل یا شماره موبایل معتبر وارد کنید');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(credentials);
      
      if (success) {
        navigate('/role-selection');
      } else {
        setError('خطا در ورود. لطفاً دوباره تلاش کنید');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('خطا در ورود. لطفاً دوباره تلاش کنید');
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'در حال ورود...' : 'ادامه'}
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