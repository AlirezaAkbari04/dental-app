import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../styles/ProfileForm.css';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    careType: '',
    daysPerWeek: '',
    isRegular: '',
    daysPerSchool: '',
    schoolsCount: '',
    schoolTypes: []
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

export default TeacherProfile;

  return (
    <ProfileForm 
      title="تکمیل پروفایل معلم بهداشت" 
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="name">نام</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="نام و نام خانوادگی خود را وارد کنید"
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="gender">جنسیت</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
            />
            مرد
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
            />
            زن
          </label>
        </div>
        {errors.gender && <div className="error-message">{errors.gender}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="careType">نوع مراقبت</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="careType"
              value="parttime"
              checked={formData.careType === 'parttime'}
              onChange={handleChange}
            />
            پاره‌وقت
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="careType"
              value="fulltime"
              checked={formData.careType === 'fulltime'}
              onChange={handleChange}
            />
            تمام‌وقت
          </label>
        </div>
        {errors.careType && <div className="error-message">{errors.careType}</div>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="daysPerWeek">تعداد روزهای فعالیت در هفته</label>
          <input
            type="number"
            id="daysPerWeek"
            name="daysPerWeek"
            min="1"
            max="7"
            value={formData.daysPerWeek}
            onChange={handleChange}
            placeholder="بین 1 تا 7 روز"
            className={errors.daysPerWeek ? 'input-error' : ''}
          />
          {errors.daysPerWeek && <div className="error-message">{errors.daysPerWeek}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="isRegular">منظم یا نامنظم بودن فعالیت</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="isRegular"
                value="regular"
                checked={formData.isRegular === 'regular'}
                onChange={handleChange}
              />
              منظم
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="isRegular"
                value="irregular"
                checked={formData.isRegular === 'irregular'}
                onChange={handleChange}
              />
              نامنظم
            </label>
          </div>
          {errors.isRegular && <div className="error-message">{errors.isRegular}</div>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="daysPerSchool">تعداد روزهای حضور در هر مدرسه</label>
          <input
            type="number"
            id="daysPerSchool"
            name="daysPerSchool"
            min="1"
            max="7"
            value={formData.daysPerSchool}
            onChange={handleChange}
            placeholder="بین 1 تا 7 روز"
            className={errors.daysPerSchool ? 'input-error' : ''}
          />
          {errors.daysPerSchool && <div className="error-message">{errors.daysPerSchool}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="schoolsCount">تعداد مدارس تحت پوشش</label>
          <input
            type="number"
            id="schoolsCount"
            name="schoolsCount"
            min="1"
            value={formData.schoolsCount}
            onChange={handleChange}
            placeholder="تعداد مدارس"
            className={errors.schoolsCount ? 'input-error' : ''}
          />
          {errors.schoolsCount && <div className="error-message">{errors.schoolsCount}</div>}
        </div>
      </div>
      
      <div className="form-group">
        <label>نوع مدارس تحت پوشش</label>
        <div className="checkbox-group">
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="schoolTypes"
              value="girls"
              checked={formData.schoolTypes.includes('girls')}
              onChange={handleCheckboxChange}
            />
            دخترانه
          </label>
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="schoolTypes"
              value="boys"
              checked={formData.schoolTypes.includes('boys')}
              onChange={handleCheckboxChange}
            />
            پسرانه
          </label>
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="schoolTypes"
              value="both"
              checked={formData.schoolTypes.includes('both')}
              onChange={handleCheckboxChange}
            />
            مختلط
          </label>
        </div>
        {errors.schoolTypes && <div className="error-message">{errors.schoolTypes}</div>}
      </div>
    </ProfileForm>
  );
};

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        schoolTypes: [...formData.schoolTypes, value]
      });
    } else {
      setFormData({
        ...formData,
        schoolTypes: formData.schoolTypes.filter(type => type !== value)
      });
    }
    
    // Clear error for schoolTypes when changing
    if (errors.schoolTypes) {
      setErrors({
        ...errors,
        schoolTypes: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'لطفاً نام خود را وارد کنید';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'لطفاً جنسیت خود را انتخاب کنید';
    }
    
    if (!formData.careType) {
      newErrors.careType = 'لطفاً نوع مراقبت را انتخاب کنید';
    }
    
    if (!formData.daysPerWeek) {
      newErrors.daysPerWeek = 'لطفاً تعداد روزهای فعالیت در هفته را وارد کنید';
    } else if (isNaN(formData.daysPerWeek) || formData.daysPerWeek < 1 || formData.daysPerWeek > 7) {
      newErrors.daysPerWeek = 'تعداد روزها باید بین 1 تا 7 باشد';
    }
    
    if (!formData.isRegular) {
      newErrors.isRegular = 'لطفاً منظم یا نامنظم بودن فعالیت را مشخص کنید';
    }
    
    if (!formData.daysPerSchool) {
      newErrors.daysPerSchool = 'لطفاً تعداد روزهای حضور در هر مدرسه را وارد کنید';
    } else if (isNaN(formData.daysPerSchool) || formData.daysPerSchool < 1 || formData.daysPerSchool > 7) {
      newErrors.daysPerSchool = 'تعداد روزها باید بین 1 تا 7 باشد';
    }
    
    if (!formData.schoolsCount) {
      newErrors.schoolsCount = 'لطفاً تعداد مدارس تحت پوشش را وارد کنید';
    } else if (isNaN(formData.schoolsCount) || formData.schoolsCount < 1) {
      newErrors.schoolsCount = 'تعداد مدارس باید حداقل 1 باشد';
    }
    
    if (formData.schoolTypes.length === 0) {
      newErrors.schoolTypes = 'لطفاً نوع مدارس تحت پوشش را انتخاب کنید';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // For demo purposes, store in localStorage and log
    localStorage.setItem('teacherProfile', JSON.stringify(formData));
    console.log('Teacher profile saved:', formData);
    
    // Navigate to teacher dashboard
    navigate('/dashboard/caretaker');
  };