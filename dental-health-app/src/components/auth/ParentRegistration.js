import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ParentRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    parentType: '',
    familyRelation: '',
    fatherEducation: '',
    fatherJob: '',
    motherEducation: '',
    motherJob: '',
    appUser: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRadioChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log('Parent Registration Data:', formData);
    // Navigate to parent dashboard
    navigate('/dashboard/parent');
  };

  return (
    <div className="container">
      <div className="register-card">
        <div className="logo">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <path d="M50 10C33.4 10 20 23.4 20 40v30c0 11 9 20 20 20s20-9 20-20V50h-10v20c0 5.5-4.5 10-10 10s-10-4.5-10-10V40c0-11 9-20 20-20s20 9 20 20v5h10v-5c0-16.6-13.4-30-30-30z" fill="#4a6bff"/>
            <circle cx="35" cy="35" r="5" fill="#ffcc00"/>
            <circle cx="65" cy="35" r="5" fill="#ffcc00"/>
          </svg>
        </div>

        <h2>ثبت‌نام والدین</h2>
        <p className="subtitle">به برنامه دنیای سالم خوش آمدید!</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">نام و نام خانوادگی</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              placeholder="نام و نام خانوادگی خود را وارد کنید" 
              value={formData.fullName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label>نوع والد</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="parentType" 
                  value="father" 
                  checked={formData.parentType === 'father'}
                  onChange={() => handleRadioChange('parentType', 'father')}
                />
                <span>پدر</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="parentType" 
                  value="mother" 
                  checked={formData.parentType === 'mother'}
                  onChange={() => handleRadioChange('parentType', 'mother')}
                />
                <span>مادر</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="parentType" 
                  value="other" 
                  checked={formData.parentType === 'other'}
                  onChange={() => handleRadioChange('parentType', 'other')}
                />
                <span>سایر (سرپرست)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="familyRelation">نسبت خانوادگی (اگر سرپرست هستید)</label>
            <input 
              type="text" 
              id="familyRelation" 
              name="familyRelation" 
              placeholder="مثال: عمو، خاله، پدربزرگ و غیره" 
              value={formData.familyRelation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group section-title">
            <h3>اطلاعات پدر</h3>
          </div>

          <div className="form-group">
            <label htmlFor="fatherEducation">سطح تحصیلات پدر</label>
            <select 
              id="fatherEducation" 
              name="fatherEducation" 
              value={formData.fatherEducation}
              onChange={handleChange}
            >
              <option value="" disabled selected>انتخاب کنید</option>
              <option value="belowDiploma">زیر دیپلم</option>
              <option value="diploma">دیپلم</option>
              <option value="associate">فوق دیپلم</option>
              <option value="bachelor">لیسانس</option>
              <option value="master">فوق لیسانس</option>
              <option value="phd">دکترا</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fatherJob">شغل پدر</label>
            <input 
              type="text" 
              id="fatherJob" 
              name="fatherJob" 
              placeholder="شغل پدر را وارد کنید" 
              value={formData.fatherJob}
              onChange={handleChange}
            />
          </div>

          <div className="form-group section-title">
            <h3>اطلاعات مادر</h3>
          </div>

          <div className="form-group">
            <label htmlFor="motherEducation">سطح تحصیلات مادر</label>
            <select 
              id="motherEducation" 
              name="motherEducation" 
              value={formData.motherEducation}
              onChange={handleChange}
            >
              <option value="" disabled selected>انتخاب کنید</option>
              <option value="belowDiploma">زیر دیپلم</option>
              <option value="diploma">دیپلم</option>
              <option value="associate">فوق دیپلم</option>
              <option value="bachelor">لیسانس</option>
              <option value="master">فوق لیسانس</option>
              <option value="phd">دکترا</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="motherJob">شغل مادر</label>
            <input 
              type="text" 
              id="motherJob" 
              name="motherJob" 
              placeholder="شغل مادر را وارد کنید" 
              value={formData.motherJob}
              onChange={handleChange}
            />
          </div>

          <div className="form-group section-title">
            <h3>سایر اطلاعات</h3>
          </div>

          <div className="form-group">
            <label>چه کسی اپلیکیشن را استفاده می‌کند؟</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="appUser" 
                  value="father" 
                  checked={formData.appUser === 'father'}
                  onChange={() => handleRadioChange('appUser', 'father')}
                />
                <span>پدر</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="appUser" 
                  value="mother" 
                  checked={formData.appUser === 'mother'}
                  onChange={() => handleRadioChange('appUser', 'mother')}
                />
                <span>مادر</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="appUser" 
                  value="other" 
                  checked={formData.appUser === 'other'}
                  onChange={() => handleRadioChange('appUser', 'other')}
                />
                <span>سایر</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary">ثبت‌نام و ورود</button>
        </form>
      </div>
    </div>
  );
}

export default ParentRegistration;