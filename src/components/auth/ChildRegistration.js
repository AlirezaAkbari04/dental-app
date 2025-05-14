import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; // Add this import
import DatabaseService from '../../services/DatabaseService'; // Add this import

function ChildRegistration() {
  const navigate = useNavigate();
  const { currentUser } = useUser(); // Add this near the top of your component
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    educationLevel: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGenderSelect = (gender) => {
    setFormData((prevState) => ({
      ...prevState,
      gender,
    }));
  };

  const handleAvatarSelect = (avatarIndex) => {
    setSelectedAvatar(avatarIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      if (currentUser?.id) {
        // Save data to database
        await DatabaseService.createChild(
          currentUser.id,
          formData.name,
          formData.age,
          formData.gender,
          selectedAvatar // Save avatar index
        );
      }

      // Navigate to child dashboard
      navigate('/dashboard/child');
    } catch (error) {
      console.error('Error saving data:', error);
      // Still navigate as fallback
      navigate('/dashboard/child');
    }
  };

  return (
    <div className="container">
      <div className="register-card">
        <div className="logo">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <path d="M50 10C33.4 10 20 23.4 20 40v30c0 11 9 20 20 20s20-9 20-20V50h-10v20c0 5.5-4.5 10-10 10s-10-4.5-10-10V40c0-11 9-20 20-20s20 9 20 20v5h10v-5c0-16.6-13.4-30-30-30z" fill="#4a6bff" />
            <circle cx="35" cy="35" r="5" fill="#ffcc00" />
            <circle cx="65" cy="35" r="5" fill="#ffcc00" />
          </svg>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">نام کودک</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="نام کودک را وارد کنید" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">سن</label>
            <select 
              id="age" 
              name="age" 
              value={formData.age}
              onChange={handleChange}
              required
            >
              <option value="" disabled selected>سن کودک را انتخاب کنید</option>
              <option value="6">6 سال</option>
              <option value="7">7 سال</option>
              <option value="8">8 سال</option>
              <option value="9">9 سال</option>
              <option value="10">10 سال</option>
              <option value="11">11 سال</option>
              <option value="12">12 سال</option>
            </select>
          </div>

          <div className="form-group">
            <label>جنسیت</label>
            <div className="gender-selector">
              <div 
                className={`gender-option ${formData.gender === 'girl' ? 'selected' : ''}`}
                onClick={() => handleGenderSelect('girl')}
              >
                دختر 👧
              </div>
              <div 
                className={`gender-option ${formData.gender === 'boy' ? 'selected' : ''}`}
                onClick={() => handleGenderSelect('boy')}
              >
                پسر 👦
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="educationLevel">مقطع تحصیلی</label>
            <select 
              id="educationLevel" 
              name="educationLevel" 
              value={formData.educationLevel}
              onChange={handleChange}
              required
            >
              <option value="" disabled selected>مقطع تحصیلی را انتخاب کنید</option>
              <option value="firstGrade">کلاس اول</option>
              <option value="secondGrade">کلاس دوم</option>
              <option value="thirdGrade">کلاس سوم</option>
              <option value="fourthGrade">کلاس چهارم</option>
              <option value="fifthGrade">کلاس پنجم</option>
              <option value="sixthGrade">کلاس ششم</option>
            </select>
          </div>

          <div className="form-group">
            <label>انتخاب آواتار کارتونی</label>
            <div className="avatar-selector">
              <div 
                className={`avatar-option ${selectedAvatar === 0 ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(0)}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#aaffaa" />
                  <circle cx="35" cy="40" r="5" fill="#333" />
                  <circle cx="65" cy="40" r="5" fill="#333" />
                  <path d="M30 65 Q50 55 70 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div 
                className={`avatar-option ${selectedAvatar === 1 ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(1)}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#ffaaaa" />
                  <circle cx="35" cy="40" r="5" fill="#333" />
                  <circle cx="65" cy="40" r="5" fill="#333" />
                  <path d="M35 60 Q50 50 65 60" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div 
                className={`avatar-option ${selectedAvatar === 2 ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(2)}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#aaaaff" />
                  <circle cx="35" cy="40" r="5" fill="#333" />
                  <circle cx="65" cy="40" r="5" fill="#333" />
                  <path d="M30 60 Q50 70 70 60" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div 
                className={`avatar-option ${selectedAvatar === 3 ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(3)}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#ffcc99" />
                  <circle cx="35" cy="40" r="5" fill="#333" />
                  <circle cx="65" cy="40" r="5" fill="#333" />
                  <path d="M35 65 Q50 75 65 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary">ثبت‌نام و ورود</button>
        </form>
      </div>
    </div>
  );
}

export default ChildRegistration;