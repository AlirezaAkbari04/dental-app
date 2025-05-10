import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/Auth.css';
import { useUser } from '../../contexts/UserContext';
import logoImage from '../../logo.svg';

function Register() {
  const navigate = useNavigate();
  const { register } = useUser();
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.name || !formData.password || (!formData.email && !formData.phone)) {
      setError('لطفا نام، رمز عبور و ایمیل یا شماره موبایل را وارد کنید');
      setIsLoading(false);
      return;
    }

    // Username will be either email or phone
    const username = formData.email || formData.phone;

    // Email validation if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('لطفا ایمیل معتبر وارد کنید');
        setIsLoading(false);
        return;
      }
    }

    // Phone validation if provided
    if (formData.phone) {
      const phoneRegex = /^09[0-9]{9}$/; // Persian mobile format: 09XXXXXXXXX
      if (!phoneRegex.test(formData.phone)) {
        setError('لطفا شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
        setIsLoading(false);
        return;
      }
    }

    // Password validation - at least 6 characters
    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      setIsLoading(false);
      return;
    }

    try {
      // Register with the username (email or phone)
      const result = await register(username);
      
      if (result.success) {
        // Navigate to login page after successful registration
        navigate('/login');
      } else {
        setError(result.message || 'خطایی رخ داده است. لطفا دوباره تلاش کنید.');
      }
    } catch (err) {
      setError('خطایی رخ داده است. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" dir="rtl">
      <div className="auth-form-container">
        <div className="logo-container">
          <img src={logoImage} alt="لبخند شاد دندان سالم" className="app-logo" />
          <h1 className="app-title">ثبت‌نام در برنامه سلامت دندان</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">نام</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="نام خود را وارد کنید"
              className={error && !formData.name ? 'input-error' : ''}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">ایمیل (اختیاری اگر شماره موبایل وارد شود)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className={error && !formData.email && !formData.phone ? 'input-error' : ''}
              dir="ltr"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">شماره موبایل (اختیاری اگر ایمیل وارد شود)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="09123456789"
              className={error && !formData.phone && !formData.email ? 'input-error' : ''}
              dir="ltr"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">رمز عبور</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="رمز عبور خود را وارد کنید"
              className={error && !formData.password ? 'input-error' : ''}
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>
        
        <div className="auth-links">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود به حساب</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;