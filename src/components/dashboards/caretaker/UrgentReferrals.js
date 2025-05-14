import React, { useState, useEffect } from 'react';
import './CaretakerComponents.css';
import DatabaseService from '../../../services/DatabaseService';

const UrgentReferrals = () => {
  const [schools, setSchools] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentReferral, setCurrentReferral] = useState(null);

  // Load data from database or localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }

        // Get current user ID
        const userAuth = JSON.parse(localStorage.getItem('userAuth') || '{}');
        const userId = userAuth.id;

        if (userId) {
          // Get schools from database
          const schoolsData = await DatabaseService.getSchoolsByCaretakerId(userId);
          setSchools(schoolsData);

          // Get all referrals
          const referralsData = await DatabaseService.getHealthReferralsForCaretaker(userId);

          // Sort by date (most recent first)
          referralsData.sort((a, b) => new Date(b.date) - new Date(a.date));

          setReferrals(referralsData);
        } else {
          // Fallback to localStorage
          const savedSchools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
          setSchools(savedSchools);

          // Extract all students with referrals from all schools
          const allReferrals = [];
          savedSchools.forEach(school => {
            if (school.students && Array.isArray(school.students)) {
              school.students.forEach(student => {
                if (student.healthRecords && Array.isArray(student.healthRecords)) {
                  // Filter health records that need referral
                  const referralRecords = student.healthRecords.filter(record => record.needsReferral);

                  if (referralRecords.length > 0) {
                    referralRecords.forEach(record => {
                      allReferrals.push({
                        id: record.id,
                        studentId: student.id,
                        studentName: student.name,
                        studentAge: student.age,
                        studentGrade: student.grade,
                        schoolId: school.id,
                        schoolName: school.name,
                        date: record.date,
                        warningFlags: record.warningFlags,
                        referralNotes: record.referralNotes || '',
                        resolved: record.resolved || false
                      });
                    });
                  }
                }
              });
            }
          });

          // Sort by date (most recent first)
          allReferrals.sort((a, b) => new Date(b.date) - new Date(a.date));

          setReferrals(allReferrals);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const savedSchools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
        setSchools(savedSchools);

        // Extract all students with referrals from all schools
        const allReferrals = [];
        savedSchools.forEach(school => {
          if (school.students && Array.isArray(school.students)) {
            school.students.forEach(student => {
              if (student.healthRecords && Array.isArray(student.healthRecords)) {
                // Filter health records that need referral
                const referralRecords = student.healthRecords.filter(record => record.needsReferral);

                if (referralRecords.length > 0) {
                  referralRecords.forEach(record => {
                    allReferrals.push({
                      id: record.id,
                      studentId: student.id,
                      studentName: student.name,
                      studentAge: student.age,
                      studentGrade: student.grade,
                      schoolId: school.id,
                      schoolName: school.name,
                      date: record.date,
                      warningFlags: record.warningFlags,
                      referralNotes: record.referralNotes || '',
                      resolved: record.resolved || false
                    });
                  });
                }
              }
            });
          }
        });

        // Sort by date (most recent first)
        allReferrals.sort((a, b) => new Date(b.date) - new Date(a.date));

        setReferrals(allReferrals);
      }
    };

    fetchData();
  }, []);

  // Filter referrals based on school and date range
  const filteredReferrals = referrals.filter(referral => {
    const matchesSchool = selectedSchool ? referral.schoolId === selectedSchool : true;

    let matchesDateRange = true;
    if (selectedDateRange !== 'all') {
      const today = new Date();
      const referralDate = new Date(referral.date);
      const daysDifference = Math.floor((today - referralDate) / (1000 * 60 * 60 * 24));

      switch (selectedDateRange) {
        case 'today':
          matchesDateRange = daysDifference === 0;
          break;
        case 'week':
          matchesDateRange = daysDifference <= 7;
          break;
        case 'month':
          matchesDateRange = daysDifference <= 30;
          break;
        default:
          matchesDateRange = true;
      }
    }

    return matchesSchool && matchesDateRange;
  });

  // Handle marking a referral as resolved
  const handleToggleResolved = async (referral) => {
    try {
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      // Update in database
      const success = await DatabaseService.updateHealthRecordResolved(
        referral.id,
        !referral.resolved
      );

      if (success) {
        // Update referral in the list
        const updatedReferrals = referrals.map(r => {
          if (r.id === referral.id) {
            return {
              ...r,
              resolved: !r.resolved
            };
          }
          return r;
        });

        setReferrals(updatedReferrals);

        // If current referral details are shown, update it
        if (currentReferral && currentReferral.id === referral.id) {
          setCurrentReferral({
            ...currentReferral,
            resolved: !referral.resolved
          });
        }
      } else {
        alert('خطا در به‌روزرسانی وضعیت ارجاع. لطفاً دوباره تلاش کنید');
      }
    } catch (error) {
      console.error('Error updating referral status:', error);
      alert('خطا در به‌روزرسانی وضعیت ارجاع. لطفاً دوباره تلاش کنید');
    }
  };

  // View referral details
  const viewReferralDetails = (referral) => {
    setCurrentReferral(referral);
    setShowDetailsModal(true);
  };

  // Generate a PDF report of all referrals
  const generatePDF = () => {
    // In a real app, this would generate a PDF report
    alert('در یک برنامه واقعی، گزارش PDF از لیست ارجاع‌ها تولید می‌شود.');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Get warning flags as text
  const getWarningFlagsText = (warningFlags) => {
    if (!warningFlags) return '';

    const flags = [];
    if (warningFlags.brokenTooth) flags.push('دندان شکسته');
    if (warningFlags.severePain) flags.push('درد شدید');
    if (warningFlags.abscess) flags.push('آبسه یا ورم چرکی');
    if (warningFlags.bleeding) flags.push('خونریزی لثه');
    if (warningFlags.feverWithPain) flags.push('تب همراه با درد دهان');
    if (warningFlags.fistula) flags.push('فیستول یا مجرای خروج چرک به صورت جوش رو لثه');
    if (warningFlags.abnormalTissue) flags.push('لثه زخمی یا هرنوع حالت غیرطبیعی داخل یا خارج دهان');

    return flags.join('، ');
  };

  return (
    <div className="urgent-referrals-container">
      <div className="content-header">
        <h2>ارجاع‌های فوری به دندانپزشک</h2>
        <button 
          className="action-button" 
          onClick={generatePDF}
          disabled={filteredReferrals.length === 0}
        >
          <span className="action-icon">📄</span>
          دریافت گزارش PDF
        </button>
      </div>
      
      <div className="filter-container">
        <select
          className="select-filter"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">همه مدارس</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
        
        <select
          className="select-filter"
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
        >
          <option value="all">همه تاریخ‌ها</option>
          <option value="today">امروز</option>
          <option value="week">هفته اخیر</option>
          <option value="month">ماه اخیر</option>
        </select>
      </div>
      
      <div className="card">
        {filteredReferrals.length === 0 ? (
          <div className="empty-state">
            <p>هیچ مورد ارجاع فوری یافت نشد.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>نام دانش‌آموز</th>
                <th>سن</th>
                <th>مدرسه</th>
                <th>تاریخ ارجاع</th>
                <th>علائم هشدار</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.map(referral => (
                <tr key={referral.id} className={referral.resolved ? 'resolved-row' : ''}>
                  <td>{referral.studentName}</td>
                  <td>{referral.studentAge} سال</td>
                  <td>{referral.schoolName}</td>
                  <td>{formatDate(referral.date)}</td>
                  <td className="warning-flags-cell">
                    {getWarningFlagsText(referral.warningFlags)}
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${referral.resolved ? 'status-success' : 'status-error'}`}
                    >
                      {referral.resolved ? 'رسیدگی شده' : 'در انتظار رسیدگی'}
                    </span>
                  </td>
                  <td className="table-action">
                    <span 
                      className="action-link view-link" 
                      onClick={() => viewReferralDetails(referral)}
                    >
                      جزئیات
                    </span>
                    <span 
                      className={`action-link ${referral.resolved ? 'edit-link' : 'delete-link'}`}
                      onClick={() => handleToggleResolved(referral)}
                    >
                      {referral.resolved ? 'برگشت به حالت انتظار' : 'علامت‌گذاری به عنوان رسیدگی شده'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Referral Details Modal */}
      {showDetailsModal && currentReferral && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">جزئیات ارجاع فوری</h3>
              <button className="close-button" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="referral-details">
                <div className="detail-row">
                  <div className="detail-label">نام دانش‌آموز:</div>
                  <div className="detail-value">{currentReferral.studentName}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">سن:</div>
                  <div className="detail-value">{currentReferral.studentAge} سال</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">کلاس:</div>
                  <div className="detail-value">
                    {currentReferral.studentGrade === 'preschool' ? 'پیش دبستانی' : `کلاس ${currentReferral.studentGrade}`}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">مدرسه:</div>
                  <div className="detail-value">{currentReferral.schoolName}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">تاریخ ارجاع:</div>
                  <div className="detail-value">{formatDate(currentReferral.date)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">وضعیت:</div>
                  <div className="detail-value">
                    <span 
                      className={`status-badge ${currentReferral.resolved ? 'status-success' : 'status-error'}`}
                    >
                      {currentReferral.resolved ? 'رسیدگی شده' : 'در انتظار رسیدگی'}
                    </span>
                  </div>
                </div>
              </div>
              
              <h4 className="section-title">علائم هشدار</h4>
              <div className="warning-flags-list">
                <ul>
                  {currentReferral.warningFlags.brokenTooth && <li>دندان شکسته</li>}
                  {currentReferral.warningFlags.severePain && <li>درد شدید</li>}
                  {currentReferral.warningFlags.abscess && <li>آبسه یا ورم چرکی</li>}
                  {currentReferral.warningFlags.bleeding && <li>خونریزی لثه</li>}
                  {currentReferral.warningFlags.feverWithPain && <li>تب همراه با درد دهان</li>}
                  {currentReferral.warningFlags.fistula && <li>فیستول یا مجرای خروج چرک به صورت جوش رو لثه</li>}
                  {currentReferral.warningFlags.abnormalTissue && <li>لثه زخمی یا هرنوع حالت غیرطبیعی داخل یا خارج دهان</li>}
                </ul>
              </div>
              
              {currentReferral.referralNotes && (
                <>
                  <h4 className="section-title">توضیحات ارجاع</h4>
                  <div className="referral-notes">
                    {currentReferral.referralNotes}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowDetailsModal(false)}>بستن</button>
              <button 
                className={`${currentReferral.resolved ? 'edit-button' : 'confirm-button'}`}
                onClick={() => {
                  handleToggleResolved(currentReferral);
                  setShowDetailsModal(false);
                }}
              >
                {currentReferral.resolved ? 'برگشت به حالت انتظار' : 'علامت‌گذاری به عنوان رسیدگی شده'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrgentReferrals;