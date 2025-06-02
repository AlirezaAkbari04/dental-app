import React, { useState, useEffect } from 'react';
import PdfService from '../../../services/PdfService.js';
import { Toast } from '@capacitor/toast';
import './CaretakerComponents.css';

const UrgentReferrals = () => {
  const [schools, setSchools] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentReferral, setCurrentReferral] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);

  // Function to load data
  const loadData = () => {
    try {
      const savedSchools = JSON.parse(localStorage.getItem('schools') || '[]');
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
                    localId: record.localId || `ref_${Date.now()}_${Math.random()}`,
                    studentLocalId: student.localId,
                    studentName: student.name,
                    studentAge: student.age,
                    studentGrade: student.grade,
                    schoolId: school.localId,
                    schoolName: school.name,
                    date: record.date,
                    warningFlags: record.warningFlags || {},
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
      console.log('[UrgentReferrals] Loaded referrals:', allReferrals.length);
    } catch (error) {
      console.error('[UrgentReferrals] Error loading data:', error);
    }
  };

  // Load data on mount and add event listener for storage changes
  useEffect(() => {
    loadData();

    // Listen for storage changes (when new health reports are added)
    const handleStorageChange = (e) => {
      if (e.key === 'schools') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check for custom event dispatched by HealthReports
    const handleDataUpdate = () => {
      loadData();
    };
    window.addEventListener('healthReportUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('healthReportUpdated', handleDataUpdate);
    };
  }, []);

  // Filter referrals based on school and date range
  const filteredReferrals = referrals.filter(referral => {
    const matchesSchool = selectedSchool ? referral.schoolId === selectedSchool : true;

    let matchesDateRange = true;
    if (selectedDateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const referralDate = new Date(referral.date);
      referralDate.setHours(0, 0, 0, 0);
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
  const handleToggleResolved = (referral) => {
    try {
      // Update referral in state
      const updatedReferrals = referrals.map(r => {
        if (r.localId === referral.localId) {
          return { ...r, resolved: !r.resolved };
        }
        return r;
      });
      setReferrals(updatedReferrals);

      // Update current referral if shown in modal
      if (currentReferral && currentReferral.localId === referral.localId) {
        setCurrentReferral({ ...currentReferral, resolved: !referral.resolved });
      }

      // Update the health record in localStorage
      const savedSchools = JSON.parse(localStorage.getItem('schools') || '[]');
      const updatedSchools = savedSchools.map(school => {
        if (school.localId === referral.schoolId) {
          return {
            ...school,
            students: school.students.map(student => {
              if (student.localId === referral.studentLocalId) {
                return {
                  ...student,
                  healthRecords: (student.healthRecords || []).map(record => {
                    if (record.localId === referral.localId) {
                      return { ...record, resolved: !referral.resolved };
                    }
                    return record;
                  })
                };
              }
              return student;
            })
          };
        }
        return school;
      });

      localStorage.setItem('schools', JSON.stringify(updatedSchools));
      
      // Dispatch custom event
      window.dispatchEvent(new Event('healthReportUpdated'));
      
      console.log('[UrgentReferrals] Referral status updated successfully');
    } catch (error) {
      console.error('[UrgentReferrals] Error updating referral status:', error);
      
      try {
        Toast.show({
          text: 'خطا در به‌روزرسانی وضعیت ارجاع. لطفاً دوباره تلاش کنید',
          duration: 'long',
          position: 'center'
        });
      } catch {
        alert('خطا در به‌روزرسانی وضعیت ارجاع. لطفاً دوباره تلاش کنید');
      }
    }
  };

  // View referral details
  const viewReferralDetails = (referral) => {
    setCurrentReferral(referral);
    setShowDetailsModal(true);
  };

  // Enhanced PDF generation with better UX
  const generatePDF = async () => {
    if (filteredReferrals.length === 0) {
      try {
        await Toast.show({
          text: 'هیچ ارجاعی برای تولید گزارش وجود ندارد',
          duration: 'short',
          position: 'center'
        });
      } catch {
        alert('هیچ ارجاعی برای تولید گزارش وجود ندارد');
      }
      return;
    }

    setIsGeneratingPdf(true);
    setPdfResult(null);
    
    try {
      console.log('[UrgentReferrals] Starting PDF generation for', filteredReferrals.length, 'referrals');
      
      // Initialize PDF service fonts
      await PdfService.initializeFonts();
      
      // Get school name for filter
      const schoolName = selectedSchool ? 
        schools.find(s => s.localId === selectedSchool)?.name : null;
      
      // Prepare filters for PDF
      const filters = {
        schoolName: schoolName,
        dateRange: selectedDateRange
      };
      
      console.log('[UrgentReferrals] PDF filters:', filters);
      
      // Generate PDF using enhanced PdfService
      const result = await PdfService.generateUrgentReferralsPdf(
        filteredReferrals, 
        filters
      );
      
      console.log('[UrgentReferrals] PDF generation result:', result);
      
      if (result.success) {
        setPdfResult(result);
        
        // Show success message based on action taken
        let successMessage = 'گزارش PDF با موفقیت ایجاد شد.';
        if (result.action === 'shared') {
          successMessage = 'گزارش با موفقیت اشتراک‌گذاری شد.';
        } else if (result.action === 'saved') {
          successMessage = `فایل در دستگاه شما ذخیره شد.`;
        } else if (result.action === 'downloaded') {
          successMessage = 'فایل دانلود شد.';
        }
        
        try {
          await Toast.show({
            text: successMessage,
            duration: 'short',
            position: 'bottom'
          });
        } catch {
          alert(successMessage);
        }
      } else {
        console.error('[UrgentReferrals] PDF generation failed:', result.error);
        
        try {
          await Toast.show({
            text: 'خطا در تولید گزارش PDF. لطفا دوباره تلاش کنید.',
            duration: 'long',
            position: 'center'
          });
        } catch {
          alert('خطا در تولید گزارش PDF. لطفا دوباره تلاش کنید.');
        }
      }
    } catch (error) {
      console.error('[UrgentReferrals] Error in PDF generation process:', error);
      
      try {
        await Toast.show({
          text: `خطا در تولید گزارش: ${error.message}`,
          duration: 'long',
          position: 'center'
        });
      } catch {
        alert(`خطا در تولید گزارش: ${error.message}`);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Manual share function for additional sharing attempt
  const handleSharePdf = async () => {
    if (!pdfResult || !pdfResult.filePath) {
      try {
        await Toast.show({
          text: 'فایل PDF برای اشتراک‌گذاری موجود نیست.',
          duration: 'short',
          position: 'center'
        });
      } catch {
        alert('فایل PDF برای اشتراک‌گذاری موجود نیست.');
      }
      return;
    }

    try {
      const shareResult = await PdfService.shareOrDownloadPdf(
        pdfResult.filePath, 
        pdfResult.fileName, 
        'گزارش ارجاع‌های فوری'
      );
      
      if (shareResult.success) {
        try {
          await Toast.show({
            text: shareResult.message || 'فایل اشتراک‌گذاری شد.',
            duration: 'short',
            position: 'bottom'
          });
        } catch {
          alert(shareResult.message || 'فایل اشتراک‌گذاری شد.');
        }
      }
    } catch (error) {
      console.error('[UrgentReferrals] Error sharing PDF:', error);
      try {
        await Toast.show({
          text: 'خطا در اشتراک‌گذاری فایل.',
          duration: 'short',
          position: 'center'
        });
      } catch {
        alert('خطا در اشتراک‌گذاری فایل.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
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
    if (warningFlags.extensiveCaries) flags.push('پوسیدگی وسیع دندان');
    if (warningFlags.spontaneousPain) flags.push('درد خود به خود دندان');

    return flags.join('، ');
  };

  // Reload data when component receives focus
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="urgent-referrals-container">
      <div className="content-header">
        <h2>ارجاع‌های فوری به دندانپزشک</h2>
        
        {/* Enhanced PDF Generation Button */}
        <div className="pdf-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="action-button pdf-generate-button" 
            onClick={generatePDF}
            disabled={filteredReferrals.length === 0 || isGeneratingPdf}
            style={{
              backgroundColor: isGeneratingPdf ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: isGeneratingPdf || filteredReferrals.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: filteredReferrals.length === 0 ? 0.6 : 1
            }}
          >
            {isGeneratingPdf ? (
              <>
                <div style={{ 
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>در حال تولید گزارش...</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>تبدیل به PDF</span>
              </>
            )}
          </button>
          
          {/* Additional Share Button (only if PDF was generated and we have a file) */}
          {pdfResult && pdfResult.filePath && pdfResult.platform === 'native' && (
            <button 
              onClick={handleSharePdf}
              className="action-button share-button"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📤</span>
              <span>اشتراک‌گذاری مجدد</span>
            </button>
          )}
        </div>
      </div>
      
      {/* PDF Generation Status */}
      {pdfResult && (
        <div className="pdf-status" style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✅</span>
          <span>{pdfResult.message || 'گزارش PDF با موفقیت ایجاد شد'}</span>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isGeneratingPdf && (
        <div className="loading-indicator" style={{
          marginBottom: '20px',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginLeft: '10px'
          }}></div>
          <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>
            در حال ایجاد گزارش PDF برای {filteredReferrals.length} مورد ارجاع، لطفا صبر کنید...
          </p>
        </div>
      )}
      
      <div className="filter-container">
        <select
          className="select-filter"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          disabled={isGeneratingPdf}
        >
          <option value="">همه مدارس</option>
          {schools.map(school => (
            <option key={school.localId} value={school.localId}>
              {school.name}
            </option>
          ))}
        </select>
        
        <select
          className="select-filter"
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          disabled={isGeneratingPdf}
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
            {referrals.length > 0 && (
              <p>ممکن است فیلترهای انتخاب شده نتایج را محدود کرده باشد.</p>
            )}
          </div>
        ) : (
          <div>
            <div className="summary-stats" style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div className="stat">
                <strong>کل ارجاع‌ها: </strong>
                <span>{filteredReferrals.length}</span>
              </div>
              <div className="stat">
                <strong>رسیدگی شده: </strong>
                <span style={{ color: '#28a745' }}>
                  {filteredReferrals.filter(r => r.resolved).length}
                </span>
              </div>
              <div className="stat">
                <strong>در انتظار رسیدگی: </strong>
                <span style={{ color: '#dc3545' }}>
                  {filteredReferrals.filter(r => !r.resolved).length}
                </span>
              </div>
            </div>
            
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
                  <tr key={referral.localId} className={referral.resolved ? 'resolved-row' : ''}>
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
                        style={{ cursor: 'pointer', marginLeft: '10px' }}
                      >
                        جزئیات
                      </span>
                      <span 
                        className={`action-link ${referral.resolved ? 'edit-link' : 'delete-link'}`}
                        onClick={() => handleToggleResolved(referral)}
                        style={{ cursor: 'pointer' }}
                      >
                        {referral.resolved ? 'برگشت به حالت انتظار' : 'علامت‌گذاری به عنوان رسیدگی شده'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  {currentReferral.warningFlags.extensiveCaries && <li>پوسیدگی وسیع دندان</li>}
                  {currentReferral.warningFlags.spontaneousPain && <li>درد خود به خود دندان</li>}
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

      {/* Add CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UrgentReferrals;