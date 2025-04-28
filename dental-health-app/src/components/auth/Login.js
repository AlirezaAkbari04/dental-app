import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // رفتن به صفحه انتخاب نقش
    navigate('/role-selection');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* لوگو */}
        <div className="logo">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <path d="M50 10C33.4 10 20 23.4 20 40v30c0 11 9 20 20 20s20-9 20-20V50h-10v20c0 5.5-4.5 10-10 10s-10-4.5-10-10V40c0-11 9-20 20-20s20 9 20 20v5h10v-5c0-16.6-13.4-30-30-30z" fill="#4a6bff"/>
            <circle cx="35" cy="35" r="5" fill="#ffcc00"/>
            <circle cx="65" cy="35" r="5" fill="#ffcc00"/>
          </svg>
        </div>
        
        {/* کاراکتر کارتونی */}
        <div className="character-container">
          <svg className="character" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 30c-25 0-45 10-45 50 0 30 10 80 45 90 35-10 45-60 45-90 0-40-20-50-45-50z" fill="white" stroke="#4a6bff" strokeWidth="4"/>
            <circle cx="80" cy="70" r="8" fill="#333"/>
            <circle cx="120" cy="70" r="8" fill="#333"/>
            <path d="M75 100c10 15 40 15 50 0" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="65" cy="85" r="10" fill="#ffaaaa" opacity="0.5"/>
            <circle cx="135" cy="85" r="10" fill="#ffaaaa" opacity="0.5"/>
          </svg>
        </div>
        
        <h1>برنامه سلامت دندان کودکان</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">ایمیل یا شماره موبایل</label>
            <input type="text" id="email" name="email" placeholder="example@mail.com یا ۰۹۱۲۳۴۵۶۷۸۹" required />
          </div>
          
          <button type="submit" className="btn-primary">ادامه</button>
        </form>
        
        <div className="link">
          حساب ندارید؟ <a href="#" onClick={() => navigate('/register')}>ثبت‌نام کنید</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
