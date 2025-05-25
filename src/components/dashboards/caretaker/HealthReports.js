import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import './CaretakerComponents.css';

const HealthReports = () => {
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    hasBrushed: false,
    hasCavity: false,
    hasHealthyGums: true,
    score: 5,
    notes: '',
    warningFlags: {
      brokenTooth: false,
      severePain: false,
      abscess: false,
      bleeding: false,
      feverWithPain: false,
      fistula: false,
      abnormalTissue: false
    },
    needsReferral: false,
    referralNotes: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Get schools from localStorage
        const savedSchools = JSON.parse(localStorage.getItem('schools') || '[]');
        setSchools(savedSchools);

        // Extract all students from schools with their health records
        const studentsWithHealthRecords = [];
        savedSchools.forEach(school => {
          if (school.students && Array.isArray(school.students)) {
            school.students.forEach(student => {
              studentsWithHealthRecords.push({
                ...student,
                schoolId: school.localId,
                schoolName: school.name,
                healthRecords: student.healthRecords || []
              });
            });
          }
        });

        setStudents(studentsWithHealthRecords);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Filter students based on search term and selected school
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm);
    const matchesSchool = selectedSchool ? student.schoolId === selectedSchool : true;

    return matchesSearch && matchesSchool;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name.startsWith('warningFlags.')) {
        const flagName = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          warningFlags: {
            ...prev.warningFlags,
            [flagName]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Check for any warning flags being set
  useEffect(() => {
    const hasAnyWarningFlag = Object.values(formData.warningFlags).some(flag => flag);

    if (hasAnyWarningFlag && !formData.needsReferral) {
      setFormData(prev => ({
        ...prev,
        needsReferral: true
      }));
    }
  }, [formData.warningFlags, formData.needsReferral]);

  // Open the report modal for a student
  const openReportModal = (student) => {
    setCurrentStudent(student);

    // Initialize form with today's date and defaults
    const today = new Date().toISOString().split('T')[0];

    // If student has health records, pre-fill with the most recent one
    if (student.healthRecords && student.healthRecords.length > 0) {
      const latestRecord = student.healthRecords[0];
      setFormData({
        date: today,
        hasBrushed: latestRecord.hasBrushed || false,
        hasCavity: latestRecord.hasCavity || false,
        hasHealthyGums: latestRecord.hasHealthyGums !== false, // Default to true if not specifically false
        score: latestRecord.score || 5,
        notes: '',
        warningFlags: {
          brokenTooth: latestRecord.warningFlags?.brokenTooth || false,
          severePain: latestRecord.warningFlags?.severePain || false,
          abscess: latestRecord.warningFlags?.abscess || false,
          bleeding: latestRecord.warningFlags?.bleeding || false,
          feverWithPain: latestRecord.warningFlags?.feverWithPain || false,
          fistula: latestRecord.warningFlags?.fistula || false,
          abnormalTissue: latestRecord.warningFlags?.abnormalTissue || false
        },
        needsReferral: latestRecord.needsReferral || false,
        referralNotes: ''
      });
    } else {
      // Reset to defaults for new record
      setFormData({
        date: today,
        hasBrushed: false,
        hasCavity: false,
        hasHealthyGums: true,
        score: 5,
        notes: '',
        warningFlags: {
          brokenTooth: false,
          severePain: false,
          abscess: false,
          bleeding: false,
          feverWithPain: false,
          fistula: false,
          abnormalTissue: false
        },
        needsReferral: false,
        referralNotes: ''
      });
    }

    setShowReportModal(true);
  };

  // Save the health report
  const saveHealthReport = () => {
    if (!formData.date) {
      alert('لطفاً تاریخ بررسی را وارد کنید');
      return;
    }

    try {
      const recordId = `health_${Date.now()}`; // Generate unique local ID
      
      const healthRecord = {
        localId: recordId,
        date: formData.date,
        hasBrushed: formData.hasBrushed,
        hasCavity: formData.hasCavity,
        hasHealthyGums: formData.hasHealthyGums,
        score: formData.score,
        notes: formData.notes,
        warningFlags: formData.warningFlags,
        needsReferral: formData.needsReferral,
        referralNotes: formData.referralNotes,
        resolved: false
      };

      // Update students state
      const updatedStudents = students.map(student => {
        if (student.localId === currentStudent.localId) {
          return {
            ...student,
            healthRecords: [healthRecord, ...(student.healthRecords || [])]
          };
        }
        return student;
      });

      setStudents(updatedStudents);

      // Update schools in localStorage
      const updatedSchools = schools.map(school => {
        if (school.localId === currentStudent.schoolId) {
          return {
            ...school,
            students: school.students.map(student => {
              if (student.localId === currentStudent.localId) {
                return {
                  ...student,
                  healthRecords: [healthRecord, ...(student.healthRecords || [])]
                };
              }
              return student;
            })
          };
        }
        return school;
      });

      setSchools(updatedSchools);
      localStorage.setItem('schools', JSON.stringify(updatedSchools));
      setShowReportModal(false);
      setCurrentStudent(null);
    } catch (error) {
      console.error('Error saving health report:', error);
      alert('خطا در ثبت گزارش سلامت. لطفاً دوباره تلاش کنید');
    }
  };

  // Show toast message
  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    } else {
      alert(message);
    }
  };

  // Generate a PDF report
  const generatePDF = async (student) => {
    if (!student.healthRecords || student.healthRecords.length === 0) {
      await showToast('هیچ گزارش سلامتی برای این دانش‌آموز وجود ندارد');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set RTL direction and font
      doc.setR2L(true);

      // Add title
      doc.setFontSize(18);
      doc.text('گزارش سلامت دهان و دندان', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      // Add student info
      doc.setFontSize(14);
      doc.text(`نام دانش‌آموز: ${student.name}`, 20, 35);
      doc.text(`سن: ${student.age} سال`, 20, 45);
      doc.text(`کلاس: ${student.grade === 'preschool' ? 'پیش دبستانی' : `کلاس ${student.grade}`}`, 20, 55);
      doc.text(`مدرسه: ${student.schoolName}`, 20, 65);

      // Add generation date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
      doc.text(`تاریخ تولید گزارش: ${formattedDate}`, 20, 75);

      // Prepare table data
      const tableData = [];
      
      student.healthRecords.forEach(record => {
        const warningFlagsText = Object.entries(record.warningFlags || {})
          .filter(([key, value]) => value)
          .map(([key, value]) => {
            const flagLabels = {
              brokenTooth: 'دندان شکسته',
              severePain: 'درد شدید',
              abscess: 'آبسه',
              bleeding: 'خونریزی لثه',
              feverWithPain: 'تب با درد',
              fistula: 'فیستول',
              abnormalTissue: 'بافت غیرطبیعی'
            };
            return flagLabels[key] || key;
          })
          .join(', ') || 'ندارد';

        tableData.push([
          formatDate(record.date),
          record.hasBrushed ? 'بله' : 'خیر',
          record.hasCavity ? 'بله' : 'خیر',
          record.hasHealthyGums ? 'سالم' : 'مشکل دارد',
          record.score.toString(),
          warningFlagsText,
          record.needsReferral ? 'بله' : 'خیر',
          record.notes || 'ندارد'
        ]);
      });

      // Add the table
      doc.autoTable({
        startY: 85,
        head: [['تاریخ', 'مسواک زده', 'پوسیدگی', 'سلامت لثه', 'امتیاز', 'علائم هشدار', 'نیاز به ارجاع', 'یادداشت']],
        body: tableData,
        headStyles: { 
          fillColor: [46, 125, 50], 
          halign: 'center',
          fontSize: 10
        },
        styles: { 
          halign: 'center', 
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2
        },
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 20 },  // Date
          1: { cellWidth: 15 },  // Brushed
          2: { cellWidth: 15 },  // Cavity
          3: { cellWidth: 20 },  // Gums
          4: { cellWidth: 15 },  // Score
          5: { cellWidth: 30 },  // Warning flags
          6: { cellWidth: 20 },  // Referral
          7: { cellWidth: 35 }   // Notes
        }
      });

      // Add summary section
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('خلاصه وضعیت:', 20, finalY);

      const latestRecord = student.healthRecords[0];
      const summaryY = finalY + 10;
      
      doc.setFontSize(10);
      doc.text(`آخرین بررسی: ${formatDate(latestRecord.date)}`, 20, summaryY);
      doc.text(`امتیاز کلی: ${latestRecord.score} از 10`, 20, summaryY + 8);
      doc.text(`وضعیت کلی: ${getLatestHealthStatus(student)}`, 20, summaryY + 16);

      if (latestRecord.needsReferral) {
        doc.setTextColor(255, 0, 0); // Red color for referral
        doc.text('⚠️ نیاز به ارجاع فوری به دندان‌پزشک', 20, summaryY + 24);
        if (latestRecord.referralNotes) {
          doc.text(`دلیل ارجاع: ${latestRecord.referralNotes}`, 20, summaryY + 32);
        }
        doc.setTextColor(0, 0, 0); // Reset to black
      }

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      const fileName = `health_report_${student.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

      if (Capacitor.isNativePlatform()) {
        // Save to device
        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];

        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        await showToast('گزارش PDF با موفقیت ذخیره شد');

        // Try to share the file
        try {
          await Share.share({
            title: 'گزارش سلامت دهان و دندان',
            text: `گزارش سلامت دهان و دندان ${student.name}`,
            url: result.uri,
            dialogTitle: 'اشتراک گذاری گزارش'
          });
        } catch (shareError) {
          console.log('Share not available, file saved to documents');
        }
      } else {
        // Download in browser
        doc.save(fileName);
        await showToast('گزارش PDF دانلود شد');
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      await showToast('خطا در تولید گزارش PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Get the latest health status for a student
  const getLatestHealthStatus = (student) => {
    if (!student.healthRecords || student.healthRecords.length === 0) {
      return 'بررسی نشده';
    }

    const latest = student.healthRecords[0];

    if (latest.needsReferral) {
      return 'نیاز به ارجاع';
    } else if (latest.hasCavity) {
      return 'دارای پوسیدگی';
    } else if (!latest.hasHealthyGums) {
      return 'مشکل لثه';
    } else if (!latest.hasBrushed) {
      return 'مسواک نزده';
    } else {
      return 'سالم';
    }
  };

  // Get health status class for styling
  const getHealthStatusClass = (status) => {
    switch (status) {
      case 'نیاز به ارجاع':
        return 'status-error';
      case 'دارای پوسیدگی':
      case 'مشکل لثه':
      case 'مسواک نزده':
        return 'status-warning';
      case 'سالم':
        return 'status-success';
      default:
        return 'status-info';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="health-reports-container">
      <div className="content-header">
        <h2>گزارش سلامت دهان و دندان</h2>
      </div>

      <div className="filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="جستجوی نام دانش‌آموز..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="select-filter"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">همه مدارس</option>
          {schools.map(school => (
            <option key={school.localId} value={school.localId}>
              {school.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>هیچ دانش‌آموزی یافت نشد.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>نام دانش‌آموز</th>
                <th>سن</th>
                <th>کلاس</th>
                <th>مدرسه</th>
                <th>آخرین بررسی</th>
                <th>وضعیت سلامت</th>
                <th>امتیاز (از 10)</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const hasRecords = student.healthRecords && student.healthRecords.length > 0;
                const latestRecord = hasRecords ? student.healthRecords[0] : null;
                const healthStatus = getLatestHealthStatus(student);

                return (
                  <tr key={student.localId}>
                    <td>{student.name}</td>
                    <td>{student.age} سال</td>
                    <td>{student.grade === 'preschool' ? 'پیش دبستانی' : `کلاس ${student.grade}`}</td>
                    <td>{student.schoolName}</td>
                    <td>{hasRecords ? formatDate(latestRecord.date) : '---'}</td>
                    <td>
                      <span className={`status-badge ${getHealthStatusClass(healthStatus)}`}>
                        {healthStatus}
                      </span>
                    </td>
                    <td>{hasRecords ? latestRecord.score : '---'}</td>
                    <td className="table-action">
                      <span 
                        className="action-link view-link" 
                        onClick={() => openReportModal(student)}
                      >
                        ثبت بررسی
                      </span>
                      {hasRecords && (
                        <span 
                          className={`action-link edit-link ${isGeneratingPDF ? 'disabled' : ''}`}
                          onClick={() => !isGeneratingPDF && generatePDF(student)}
                        >
                          {isGeneratingPDF ? 'در حال تولید...' : 'چاپ گزارش'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Health Report Modal */}
      {showReportModal && currentStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">گزارش سلامت دهان و دندان: {currentStudent.name}</h3>
              <button className="close-button" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">تاریخ بررسی</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasBrushed"
                      checked={formData.hasBrushed}
                      onChange={handleInputChange}
                    />
                    مسواک زده؟
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasCavity"
                      checked={formData.hasCavity}
                      onChange={handleInputChange}
                    />
                    پوسیدگی دارد؟
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasHealthyGums"
                      checked={formData.hasHealthyGums}
                      onChange={handleInputChange}
                    />
                    سلامت لثه؟
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="score">امتیاز سلامت دهان (از 1 تا 10)</label>
                <input
                  type="range"
                  id="score"
                  name="score"
                  min="1"
                  max="10"
                  className="form-control"
                  value={formData.score}
                  onChange={handleInputChange}
                />
                <div className="range-value">{formData.score}</div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">یادداشت‌های بررسی</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="توضیحات تکمیلی درباره وضعیت دهان و دندان دانش‌آموز..."
                ></textarea>
              </div>

              <div className="warning-flags-section">
                <h4>علائم هشداردهنده (ارجاع فوری به دندانپزشک)</h4>
                <div className="checkbox-group warning-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.brokenTooth"
                      checked={formData.warningFlags.brokenTooth}
                      onChange={handleInputChange}
                    />
                    دندان شکسته
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.severePain"
                      checked={formData.warningFlags.severePain}
                      onChange={handleInputChange}
                    />
                    درد شدید
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.abscess"
                      checked={formData.warningFlags.abscess}
                      onChange={handleInputChange}
                    />
                    آبسه یا ورم چرکی
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.bleeding"
                      checked={formData.warningFlags.bleeding}
                      onChange={handleInputChange}
                    />
                    خونریزی لثه
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.feverWithPain"
                      checked={formData.warningFlags.feverWithPain}
                      onChange={handleInputChange}
                    />
                    تب همراه با درد دهان
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.fistula"
                      checked={formData.warningFlags.fistula}
                      onChange={handleInputChange}
                    />
                    فیستول یا مجرای خروج چرک به صورت جوش رو لثه
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.abnormalTissue"
                      checked={formData.warningFlags.abnormalTissue}
                      onChange={handleInputChange}
                    />
                    لثه زخمی یا هرنوع حالت غیرطبیعی داخل یا خارج دهان
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="needsReferral"
                    checked={formData.needsReferral}
                    onChange={handleInputChange}
                  />
                  <strong>نیاز به ارجاع فوری به دندانپزشک</strong>
                </label>
              </div>

              {formData.needsReferral && (
                <div className="form-group">
                  <label htmlFor="referralNotes">توضیحات ارجاع</label>
                  <textarea
                    id="referralNotes"
                    name="referralNotes"
                    className="form-control"
                    value={formData.referralNotes}
                    onChange={handleInputChange}
                    placeholder="توضیحات درباره دلیل ارجاع به دندانپزشک..."
                  ></textarea>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowReportModal(false)}>انصراف</button>
              <button className="confirm-button" onClick={saveHealthReport}>
                ثبت گزارش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthReports;