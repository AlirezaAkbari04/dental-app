import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const ChildProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    grade: '',
    schoolName: '',
    educationDistrict: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age) {
      newErrors.age = 'لطفاً سن خود را انتخاب کنید';
    }

    if (!formData.gender) {
      newErrors.gender = 'لطفاً جنسیت خود را انتخاب کنید';
    }

    if (!formData.grade) {
      newErrors.grade = 'لطفاً مقطع تحصیلی خود را انتخاب کنید';
    }

    if (!formData.schoolName) {
      newErrors.schoolName = 'لطفاً نام مدرسه خود را وارد کنید';
    }

    if (!formData.educationDistrict) {
      newErrors.educationDistrict = 'لطفاً منطقه آموزش و پرورش خود را وارد کنید';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      if (currentUser?.id) {
        const childId = await DatabaseService.createChild(
          currentUser.id,
          formData.name || 'کودک',
          formData.age,
          formData.gender,
          null
        );

        await DatabaseService.initializeChildAchievements(childId);

        localStorage.setItem('childProfile', JSON.stringify(formData));
      }

      navigate('/dashboard/child');
    } catch (error) {
      console.error('Error saving child profile:', error);
      navigate('/dashboard/child');
    }
  };

  const ageOptions = [];
  for (let age = 6; age <= 12; age++) {
    ageOptions.push(
      <option key={age} value={age}>
        {age} سال
      </option>
    );
  }

  return (
    <ProfileForm title="تکمیل پروفایل کودک" onSubmit={handleSubmit}>
      <div className="logo-container">
        <img 
          src="/assets/images/logo.png" 
          alt="لبخند شاد دندان سالم" 
          className="dashboard-logo" 
          onError={(e) => {
            console.warn('Failed to load logo, trying alternative');
            e.target.src = "/logo.png";
          }}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="age">سن</label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? 'input-error' : ''}
          >
            <option value="">انتخاب کنید</option>
            {ageOptions}
          </select>
          {errors.age && <div className="error-message">{errors.age}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="gender">جنسیت</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={formData.gender === 'boy'}
                onChange={handleChange}
              />
              پسر
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={formData.gender === 'girl'}
                onChange={handleChange}
              />
              دختر
            </label>
          </div>
          {errors.gender && <div className="error-message">{errors.gender}</div>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="grade">مقطع تحصیلی</label>
        <select
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className={errors.grade ? 'input-error' : ''}
        >
          <option value="">انتخاب کنید</option>
          <option value="preschool">پیش دبستانی</option>
          <option value="first">کلاس اول</option>
          <option value="second">کلاس دوم</option>
          <option value="third">کلاس سوم</option>
          <option value="fourth">کلاس چهارم</option>
          <option value="fifth">کلاس پنجم</option>
          <option value="sixth">کلاس ششم</option>
        </select>
        {errors.grade && <div className="error-message">{errors.grade}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="schoolName">نام مدرسه</label>
          <input
            type="text"
            id="schoolName"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            placeholder="نام مدرسه خود را وارد کنید"
            className={errors.schoolName ? 'input-error' : ''}
          />
          {errors.schoolName && <div className="error-message">{errors.schoolName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="educationDistrict">منطقه آموزش و پرورش</label>
          <input
            type="text"
            id="educationDistrict"
            name="educationDistrict"
            value={formData.educationDistrict}
            onChange={handleChange}
            placeholder="منطقه آموزش و پرورش"
            className={errors.educationDistrict ? 'input-error' : ''}
          />
          {errors.educationDistrict && <div className="error-message">{errors.educationDistrict}</div>}
        </div>
      </div>

      <div className="achievements-section">
        <h3 className="section-title">امتیازات و دستاوردها</h3>
        <div className="achievements-display">
          <p>پس از ثبت نام و شروع فعالیت در برنامه، امتیازات و مدال‌های شما در این قسمت نمایش داده خواهند شد.</p>
        </div>
      </div>
    </ProfileForm>
  );
};

export default ChildProfile;
