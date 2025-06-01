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
          <img src={logoImage} alt="دندان سالم لبخند شاد" className="app-logo" />
          <h1 className="app-title">دندان سالم لبخند شاد</h1>
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
              required
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading || !credentials.trim()}>
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