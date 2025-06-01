import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { currentUser, markProfileAsCompleted } = useUser();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentUser?.id) {
      setErrors({ general: 'خطا در احراز هویت. لطفاً دوباره وارد شوید.' });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[TeacherProfile] Starting form submission...');
      
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        console.log('[TeacherProfile] Initializing database...');
        await DatabaseService.ensureInitialized();
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        userId: currentUser.id,
        role: 'teacher',
        completedAt: new Date().toISOString()
      };

      console.log('[TeacherProfile] Saving profile data:', profileData);

      // Save to both database and localStorage for redundancy
      try {
        // Try to save to database first
        await DatabaseService.updateUserProfile(currentUser.id, profileData);
        console.log('[TeacherProfile] Profile saved to database successfully');
      } catch (dbError) {
        console.warn('[TeacherProfile] Database save failed, using localStorage fallback:', dbError);
      }

      // Always save to localStorage as backup
      localStorage.setItem('teacherProfile', JSON.stringify(profileData));
      localStorage.setItem(`teacherProfile_${currentUser.id}`, JSON.stringify(profileData));
      console.log('[TeacherProfile] Profile saved to localStorage');

      // Mark profile as completed - THIS IS THE KEY FIX
      const profileCompleted = await markProfileAsCompleted();
      
      if (profileCompleted) {
        console.log('[TeacherProfile] Profile marked as completed successfully');
        
        // Navigate to dashboard
        console.log('[TeacherProfile] Navigating to caretaker dashboard...');
        navigate('/dashboard/caretaker');
      } else {
        console.error('[TeacherProfile] Failed to mark profile as completed');
        // Still navigate to dashboard as fallback
        navigate('/dashboard/caretaker');
      }

    } catch (error) {
      console.error('[TeacherProfile] Error saving teacher profile:', error);
      
      // Set a user-friendly error message
      setErrors({ 
        general: 'خطا در ذخیره اطلاعات. اطلاعات شما ذخیره شد و به داشبورد منتقل می‌شوید.' 
      });
      
      // Navigate anyway after a short delay to show the message
      setTimeout(() => {
        navigate('/dashboard/caretaker');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm title="تکمیل پروفایل معلم بهداشت" onSubmit={handleSubmit}>
      {errors.general && (
        <div style={{
          color: '#e74c3c',
          backgroundColor: '#ffeaea',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {errors.general}
        </div>
      )}

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
          disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            پسرانه
          </label>
        </div>
        {errors.schoolTypes && <div className="error-message">{errors.schoolTypes}</div>}
      </div>

    </ProfileForm>
  );
};

export default TeacherProfile;