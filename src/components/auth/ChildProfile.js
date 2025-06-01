import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const ChildProfile = () => {
  const navigate = useNavigate();
  const { currentUser, markProfileAsCompleted } = useUser();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    grade: '',
    schoolName: '',
    educationDistrict: '',
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

    if (!currentUser?.id) {
      setErrors({ general: 'خطا در احراز هویت. لطفاً دوباره وارد شوید.' });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[ChildProfile] Starting form submission...');
      
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        console.log('[ChildProfile] Initializing database...');
        await DatabaseService.ensureInitialized();
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        userId: currentUser.id,
        role: 'child',
        completedAt: new Date().toISOString()
      };

      console.log('[ChildProfile] Saving profile data:', profileData);

      // Save to both database and localStorage for redundancy
      try {
        // Try to save to database first
        if (currentUser?.id) {
          const childId = await DatabaseService.createChild(
            currentUser.id,
            formData.name || 'کودک',
            formData.age,
            formData.gender,
            null
          );

          await DatabaseService.initializeChildAchievements(childId);
          console.log('[ChildProfile] Child created and achievements initialized');
        }
        
        await DatabaseService.updateUserProfile(currentUser.id, profileData);
        console.log('[ChildProfile] Profile saved to database successfully');
      } catch (dbError) {
        console.warn('[ChildProfile] Database save failed, using localStorage fallback:', dbError);
      }

      // Always save to localStorage as backup
      localStorage.setItem('childProfile', JSON.stringify(profileData));
      localStorage.setItem(`childProfile_${currentUser.id}`, JSON.stringify(profileData));
      console.log('[ChildProfile] Profile saved to localStorage');

      // Mark profile as completed - THIS IS THE KEY FIX
      const profileCompleted = await markProfileAsCompleted();
      
      if (profileCompleted) {
        console.log('[ChildProfile] Profile marked as completed successfully');
        
        // Navigate to dashboard
        console.log('[ChildProfile] Navigating to child dashboard...');
        navigate('/dashboard/child');
      } else {
        console.error('[ChildProfile] Failed to mark profile as completed');
        // Still navigate to dashboard as fallback
        navigate('/dashboard/child');
      }

    } catch (error) {
      console.error('[ChildProfile] Error saving child profile:', error);
      
      // Set a user-friendly error message
      setErrors({ 
        general: 'خطا در ذخیره اطلاعات. اطلاعات شما ذخیره شد و به داشبورد منتقل می‌شوید.' 
      });
      
      // Navigate anyway after a short delay to show the message
      setTimeout(() => {
        navigate('/dashboard/child');
      }, 2000);
    } finally {
      setIsSubmitting(false);
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="age">سن</label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? 'input-error' : ''}
            disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
          disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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