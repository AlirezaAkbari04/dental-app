import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HealthConsultantRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    careType: '',
    weeklyActivityDays: '',
    regularity: '',
    schoolDaysPresent: '',
    schoolCount: '',
    schoolTypes: []
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

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prevState => {
      const updatedTypes = [...prevState.schoolTypes];
      
      if (checked) {
        updatedTypes.push(value);
      } else {
        const index = updatedTypes.indexOf(value);
        if (index > -1) {
          updatedTypes.splice(index, 1);
        }
      }
      
      return {
        ...prevState,
        schoolTypes: updatedTypes
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log('Health Consultant Registration Data:', formData);
    // Navigate to caretaker dashboard
    navigate('/dashboard/caretaker');
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

        <h2>ثبت‌نام مراقب سلامت</h2>
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
            <label>جنسیت</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  checked={formData.gender === 'male'}
                  onChange={() => handleRadioChange('gender', 'male')}
                  required
                />
                <span>مرد</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  checked={formData.gender === 'female'}
                  onChange={() => handleRadioChange('gender', 'female')}
                />
                <span>زن</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>نوع مراقبت</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="careType" 
                  value="partTime" 
                  checked={formData.careType === 'partTime'}
                  onChange={() => handleRadioChange('careType', 'partTime')}
                  required
                />
                <span>پاره‌وقت</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="careType" 
                  value="fullTime" 
                  checked={formData.careType === 'fullTime'}
                  onChange={() => handleRadioChange('careType', 'fullTime')}
                />
                <span>تمام‌وقت</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="weeklyActivityDays">تعداد روزهای فعالیت در هفته</label>
            <select 
              id="weeklyActivityDays" 
              name="weeklyActivityDays" 
              value={formData.weeklyActivityDays}
              onChange={handleChange}
              required
            >
              <option value="" disabled selected>انتخاب کنید</option>
              <option value="1">۱ روز</option>
              <option value="2">۲ روز</option>
              <option value="3">۳ روز</option>
              <option value="4">۴ روز</option>
              <option value="5">۵ روز</option>
              <option value="6">۶ روز</option>
              <option value="7">۷ روز</option>
            </select>
          </div>

          <div className="form-group">
            <label>منظم یا نامنظم بودن فعالیت</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="regularity" 
                  value="regular" 
                  checked={formData.regularity === 'regular'}
                  onChange={() => handleRadioChange('regularity', 'regular')}
                  required
                />
                <span>منظم</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="regularity" 
                  value="irregular" 
                  checked={formData.regularity === 'irregular'}
                  onChange={() => handleRadioChange('regularity', 'irregular')}
                />
                <span>نامنظم</span>
              </label>
            </div>
          </div>

          <div className="form-group section-title">
            <h3>اطلاعات مدارس</h3>
          </div>

          <div className="form-group">
            <label htmlFor="schoolDaysPresent">تعداد روزهای حضور در هر مدرسه</label>
            <select 
              id="schoolDaysPresent" 
              name="schoolDaysPresent" 
              value={formData.schoolDaysPresent}
              onChange={handleChange}
              required
            >
              <option value="" disabled selected>انتخاب کنید</option>
              <option value="1">۱ روز</option>
              <option value="2">۲ روز</option>
              <option value="3">۳ روز</option>
              <option value="4">۴ روز</option>
              <option value="5">۵ روز</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="schoolCount">چند مدرسه تحت پوشش دارید؟</label>
            <input 
              type="number" 
              id="schoolCount" 
              name="schoolCount" 
              placeholder="تعداد مدارس" 
              min="1"
              value={formData.schoolCount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>نوع مدارس تحت پوششتان</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="schoolTypes" 
                  value="girls" 
                  onChange={handleCheckboxChange}
                />
                <span>دخترانه</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="schoolTypes" 
                  value="boys" 
                  onChange={handleCheckboxChange}
                />
                <span>پسرانه</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="schoolTypes" 
                  value="mixed" 
                  onChange={handleCheckboxChange}
                />
                <span>هر دو</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary">ثبت‌نام و ورود</button>
        </form>
      </div>
    </div>
  );
}

export default HealthConsultantRegistration;