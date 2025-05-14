import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext'; // Add this import
import DatabaseService from '../../services/DatabaseService'; // Add this import

const ParentProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser(); // Add this near the top of your component
  const [formData, setFormData] = useState({
    parentType: '',
    relationship: '',
    fatherEducation: '',
    fatherJob: '',
    motherEducation: '',
    motherJob: '',
    appUser: '',
    economicStatus: '',
    oralHealthStatus: '',
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

  const validateForm = () => {
    const newErrors = {};
    
    const requiredFields = [
      'parentType',
      'fatherEducation',
      'fatherJob',
      'motherEducation',
      'motherJob',
      'appUser',
      'economicStatus',
      'oralHealthStatus'
    ];
    
    // Add relationship field as required only if parentType is 'other'
    if (formData.parentType === 'other' && !formData.relationship) {
      newErrors.relationship = 'این فیلد الزامی است';
    }
    
    // Check for empty required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'این فیلد الزامی است';
      }
    });
    
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
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      // Update parent profile in database
      // (Note: You would need to extend DatabaseService to support this)

      // For compatibility, still save to localStorage
      localStorage.setItem('parentProfile', JSON.stringify(formData));

      // Navigate to parent dashboard
      navigate('/dashboard/parent');
    } catch (error) {
      console.error('Error saving parent profile:', error);
      // Still navigate as fallback
      navigate('/dashboard/parent');
    }
  };

  // Education options
  const educationOptions = [
    { value: 'elementary', label: 'ابتدایی' },
    { value: 'middle', label: 'سیکل' },
    { value: 'diploma', label: 'دیپلم' },
    { value: 'associate', label: 'فوق دیپلم' },
    { value: 'bachelor', label: 'لیسانس' },
    { value: 'master', label: 'فوق لیسانس' },
    { value: 'phd', label: 'دکتری' },
  ];

  return (
    <ProfileForm 
      title="تکمیل پروفایل والدین" 
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="parentType">نوع والد</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="parentType"
              value="father"
              checked={formData.parentType === 'father'}
              onChange={handleChange}
            />
            پدر
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="parentType"
              value="mother"
              checked={formData.parentType === 'mother'}
              onChange={handleChange}
            />
            مادر
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="parentType"
              value="other"
              checked={formData.parentType === 'other'}
              onChange={handleChange}
            />
            سایر (سرپرست)
          </label>
        </div>
        {errors.parentType && <div className="error-message">{errors.parentType}</div>}
      </div>
      
      {/* Show relationship field only when "other" is selected */}
      {formData.parentType === 'other' && (
        <div className="form-group">
          <label htmlFor="relationship">نسبت خانوادگی</label>
          <input
            type="text"
            id="relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            placeholder="نسبت خانوادگی با کودک"
            className={errors.relationship ? 'input-error' : ''}
          />
          {errors.relationship && <div className="error-message">{errors.relationship}</div>}
        </div>
      )}
      
      <h3 className="section-title">اطلاعات تحصیلی و شغلی والدین</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fatherEducation">سطح تحصیلات پدر</label>
          <select
            id="fatherEducation"
            name="fatherEducation"
            value={formData.fatherEducation}
            onChange={handleChange}
            className={errors.fatherEducation ? 'input-error' : ''}
          >
            <option value="">انتخاب کنید</option>
            {educationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.fatherEducation && <div className="error-message">{errors.fatherEducation}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="fatherJob">شغل پدر</label>
          <input
            type="text"
            id="fatherJob"
            name="fatherJob"
            value={formData.fatherJob}
            onChange={handleChange}
            placeholder="شغل پدر"
            className={errors.fatherJob ? 'input-error' : ''}
          />
          {errors.fatherJob && <div className="error-message">{errors.fatherJob}</div>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="motherEducation">سطح تحصیلات مادر</label>
          <select
            id="motherEducation"
            name="motherEducation"
            value={formData.motherEducation}
            onChange={handleChange}
            className={errors.motherEducation ? 'input-error' : ''}
          >
            <option value="">انتخاب کنید</option>
            {educationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.motherEducation && <div className="error-message">{errors.motherEducation}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="motherJob">شغل مادر</label>
          <input
            type="text"
            id="motherJob"
            name="motherJob"
            value={formData.motherJob}
            onChange={handleChange}
            placeholder="شغل مادر"
            className={errors.motherJob ? 'input-error' : ''}
          />
          {errors.motherJob && <div className="error-message">{errors.motherJob}</div>}
        </div>
      </div>
      
      <h3 className="section-title">سوالات تکمیلی</h3>
      
      <div className="form-group">
        <label>چه کسی اپلیکیشن را استفاده می‌کند؟</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="appUser"
              value="father"
              checked={formData.appUser === 'father'}
              onChange={handleChange}
            />
            پدر
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="appUser"
              value="mother"
              checked={formData.appUser === 'mother'}
              onChange={handleChange}
            />
            مادر
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="appUser"
              value="other"
              checked={formData.appUser === 'other'}
              onChange={handleChange}
            />
            سایر
          </label>
        </div>
        {errors.appUser && <div className="error-message">{errors.appUser}</div>}
      </div>
      
      <div className="form-group">
        <label>از نظر اقتصادی خود را چگونه ارزیابی میکنید؟</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="economicStatus"
              value="good"
              checked={formData.economicStatus === 'good'}
              onChange={handleChange}
            />
            خوب
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="economicStatus"
              value="medium"
              checked={formData.economicStatus === 'medium'}
              onChange={handleChange}
            />
            متوسط
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="economicStatus"
              value="poor"
              checked={formData.economicStatus === 'poor'}
              onChange={handleChange}
            />
            ضعیف
          </label>
        </div>
        {errors.economicStatus && <div className="error-message">{errors.economicStatus}</div>}
      </div>
      
      <div className="form-group">
        <label>سلامت دهان و دندان خود را چگونه ارزیابی میکنید؟</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="oralHealthStatus"
              value="good"
              checked={formData.oralHealthStatus === 'good'}
              onChange={handleChange}
            />
            خوب
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="oralHealthStatus"
              value="medium"
              checked={formData.oralHealthStatus === 'medium'}
              onChange={handleChange}
            />
            متوسط
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="oralHealthStatus"
              value="poor"
              checked={formData.oralHealthStatus === 'poor'}
              onChange={handleChange}
            />
            ضعیف
          </label>
        </div>
        {errors.oralHealthStatus && <div className="error-message">{errors.oralHealthStatus}</div>}
      </div>
    </ProfileForm>
  );
};

export default ParentProfile;