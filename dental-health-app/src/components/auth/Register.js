import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css'; // Make sure this path is correct
import { useUser } from '../../contexts/UserContext'; // Add this import

function Register() {
  const navigate = useNavigate();
  const { register } = useUser(); // Add this near the top of your component
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');

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

    // Basic validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('لطفا تمام فیلدها را پر کنید');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('لطفا ایمیل معتبر وارد کنید');
      return;
    }

    // Password validation - at least 6 characters
    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    try {
      // Use the register function from UserContext
      await register(formData);
      // Navigate to role selection page
      navigate('/role-selection');
    } catch (err) {
      setError('خطایی رخ داده است. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="logo-container">
          {/* Add your logo here */}
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
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">ایمیل</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className={error && !formData.email ? 'input-error' : ''}
              dir="ltr"
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
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="auth-button">
            ثبت‌نام
          </button>
        </form>
        
        <div className="auth-links">
          قبلاً ثبت‌نام کرده‌اید؟ <a href="#" onClick={() => navigate('/')}>ورود به حساب</a>
        </div>
      </div>
    </div>
  );
}

export default Register;