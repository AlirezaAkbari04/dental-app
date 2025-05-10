import React, { useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import DatabaseService from '../../../services/DatabaseService';

const BrushingReport = ({ childName = "کودک" }) => {
  const { currentUser } = useUser();

  // Add childId state
  const [childId, setChildId] = useState(null);

  // Existing states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [brushingData, setBrushingData] = useState({});
  const [dateRange, setDateRange] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentRecord, setCurrentRecord] = useState({
    morning: { brushed: false, time: '' },
    evening: { brushed: false, time: '' },
  });

  // Add debug function
  const logDebug = (message, data) => {
    console.log(`[BrushingReport] ${message}`, data || '');
  };

  // Initialize database when the component loads
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();
  }, []);

  // Fetch child data when the component mounts
  useEffect(() => {
    const fetchChildData = async () => {
      if (!currentUser?.id) return;

      try {
        // Get children for the current parent
        const children = await DatabaseService.getChildrenByParentId(currentUser.id);

        if (children.length === 0) {
          // Create a default child if none exists
          const newChildId = await DatabaseService.createChild(
            currentUser.id,
            childName,
            null, // age
            null, // gender
            null // avatarUrl
          );

          setChildId(newChildId);
        } else {
          // Use the first child
          setChildId(children[0].id);
        }
      } catch (error) {
        console.error("Error fetching child data:", error);
      }
    };

    fetchChildData();
  }, [currentUser, childName]);

  // Load brushing data for the current month
  useEffect(() => {
    const loadBrushingData = async () => {
      if (!childId) return;

      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        const data = await DatabaseService.getBrushingRecordsForCalendar(childId, year, month);
        setBrushingData(data);
      } catch (error) {
        console.error("Error loading brushing data:", error);
      }
    };

    loadBrushingData();
  }, [childId, currentMonth]);

  // Save brushing data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('parentBrushingRecord', JSON.stringify(brushingData));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }, [brushingData]);

  // تابع های تبدیل تاریخ میلادی به شمسی
  const gregorianToJalali = (gy, gm, gd) => {
    var g_d_m, jy, jm, jd, gy2, days;
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    gy2 = (gm > 2) ? (gy + 1) : gy;
    days = 355666 + (365 * gy) + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    jy = -1595 + (33 * ~~(days / 12053));
    days %= 12053;
    jy += 4 * ~~(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += ~~((days - 1) / 365);
      days = (days - 1) % 365;
    }
    if (days < 186) {
      jm = 1 + ~~(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + ~~((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }
    return [jy, jm, jd];
  };

  // تبدیل تاریخ میلادی به شمسی برای شیء Date
  const toJalali = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return gregorianToJalali(year, month, day);
  };

  // تعداد روزهای ماه شمسی
  const getJalaliDaysInMonth = (jYear, jMonth) => {
    if (jMonth <= 6) return 31;
    if (jMonth <= 11) return 30;
    
    // اسفند
    const march = (((((jYear + 12) % 33) % 4) - 1) === 0);
    return march ? 30 : 29;
  };

  // روز اول ماه شمسی (شنبه = 0، یکشنبه = 1، ...)
  const getJalaliFirstDayOfMonth = (jYear, jMonth) => {
    let gDate;
    
    // تبدیل به تاریخ میلادی
    if (jMonth > 1) {
      const gDates = jalaliToGregorian(jYear, jMonth, 1);
      gDate = new Date(gDates[0], gDates[1] - 1, gDates[2]);
    } else {
      const gDates = jalaliToGregorian(jYear - 1, 12, 29);
      gDate = new Date(gDates[0], gDates[1] - 1, gDates[2]);
      gDate.setDate(gDate.getDate() + 1);
    }
    
    // تطبیق روزهای هفته (شنبه در ایران روز اول هفته است)
    let dayOfWeek = gDate.getDay(); // 0 = یکشنبه، 1 = دوشنبه، ...
    
    // تبدیل به سیستم روزشمار ایرانی (شنبه = 0)
    return (dayOfWeek + 1) % 7;
  };

  // تبدیل تاریخ شمسی به میلادی
  const jalaliToGregorian = (jy, jm, jd) => {
    var sal_a, gy, gm, gd, days;
    jy += 1595;
    days = -355668 + (365 * jy) + (~~(jy / 33) * 8) + ~~(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy = 400 * ~~(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * ~~(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * ~~(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += ~~((days - 1) / 365);
      days = (days - 1) % 365;
    }
    gd = days + 1;
    sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
    return [gy, gm, gd];
  };
  
  // Helper to format date as YYYY-MM-DD (for storage key)
  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };
  
  // Handle previous month
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Handle next month
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Open add/edit record modal for a specific date
  const handleDayClick = (date) => {
    const dateKey = formatDateKey(date);
    
    setSelectedDate(date);
    
    // Initialize with empty values or existing data
    if (brushingData[dateKey]) {
      setCurrentRecord(brushingData[dateKey]);
    } else {
      setCurrentRecord({
        morning: { brushed: false, time: '' },
        evening: { brushed: false, time: '' }
      });
    }
    
    setShowAddModal(true);
  };
  
  // FIXED: Save record from modal and update state
  const handleSaveRecord = () => {
    logDebug("Save button clicked");
    
    if (!selectedDate || !childId) {
      logDebug("Missing required data", { selectedDate, childId });
      alert("خطا: اطلاعات ناقص است");
      return;
    }

    const dateKey = formatDateKey(selectedDate);
    
    try {
      // Update state immediately (this is important)
      const updatedBrushingData = {
        ...brushingData,
        [dateKey]: {...currentRecord}
      };
      
      // Set state with the updated data
      setBrushingData(updatedBrushingData);
      logDebug("State updated successfully", { dateKey, data: currentRecord });
      
      // Save to localStorage as backup
      try {
        localStorage.setItem('parentBrushingRecord', JSON.stringify(updatedBrushingData));
        logDebug("Data saved to localStorage");
      } catch (e) {
        logDebug("Error saving to localStorage", e);
      }
      
      // Also try to save to database (but don't wait for it to complete)
      logDebug("Attempting to save to database");
      
      // Fire and forget database calls
      DatabaseService.createBrushingRecord(
        childId,
        dateKey,
        'morning',
        currentRecord.morning.time || '0',
        currentRecord.morning.brushed
      ).then(() => {
        logDebug("Morning record saved to database");
      }).catch(err => {
        logDebug("Error saving morning record", err);
      });
      
      DatabaseService.createBrushingRecord(
        childId,
        dateKey,
        'evening',
        currentRecord.evening.time || '0',
        currentRecord.evening.brushed
      ).then(() => {
        logDebug("Evening record saved to database");
      }).catch(err => {
        logDebug("Error saving evening record", err);
      });
      
      // Close modal immediately after updating state
      setShowAddModal(false);
      
    } catch (error) {
      logDebug("Error in save process", error);
      alert("خطا در ذخیره‌سازی اطلاعات");
    }
  };
  
  // Handle record changes in the modal
  const handleRecordChange = (time, field, value) => {
    setCurrentRecord(prev => ({
      ...prev,
      [time]: {
        ...prev[time],
        [field]: value
      }
    }));
  };
  
  // Calculate statistics
  const calculateStats = () => {
    // Get date range for stats
    const today = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 6); // 6 روز قبل + امروز = 7 روز
        break;
      case 'month':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'three_days':
        startDate.setDate(today.getDate() - 3);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    // Filter data in range
    let daysInRange = 0;
    let morningBrushed = 0;
    let eveningBrushed = 0;
    let completeBrushing = 0;
    
    // Loop through each day in range
    const current = new Date(startDate);
    while (current <= today) {
      const dateKey = formatDateKey(current);
      const dayData = brushingData[dateKey];
      
      daysInRange++;
      
      if (dayData) {
        if (dayData.morning && dayData.morning.brushed) morningBrushed++;
        if (dayData.evening && dayData.evening.brushed) eveningBrushed++;
        if (dayData.morning && dayData.morning.brushed && 
            dayData.evening && dayData.evening.brushed) completeBrushing++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return {
      total: daysInRange,
      morning: daysInRange > 0 ? Math.round((morningBrushed / daysInRange) * 100) : 0,
      evening: daysInRange > 0 ? Math.round((eveningBrushed / daysInRange) * 100) : 0,
      complete: daysInRange > 0 ? Math.round((completeBrushing / daysInRange) * 100) : 0,
      morningCount: morningBrushed,
      eveningCount: eveningBrushed,
      completeCount: completeBrushing
    };
  };
  
  // Calendar rendering
  const renderCalendar = () => {
    const monthNames = [
      "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];
    
    const dayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
    
    // تبدیل تاریخ میلادی ماه جاری به شمسی
    const jalaliDate = toJalali(currentMonth);
    const jYear = jalaliDate[0];
    const jMonth = jalaliDate[1];
    
    // محاسبه تعداد روزهای ماه شمسی
    const daysInMonth = getJalaliDaysInMonth(jYear, jMonth);
    
    // محاسبه روز هفته اول ماه (شنبه = 0)
    const firstDayOfMonth = getJalaliFirstDayOfMonth(jYear, jMonth);
    
    // Create calendar grid
    const days = [];
    
    // Add empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // تبدیل تاریخ شمسی به میلادی برای مقایسه و ذخیره
      const gDate = jalaliToGregorian(jYear, jMonth, day);
      const date = new Date(gDate[0], gDate[1] - 1, gDate[2]);
      const dateKey = formatDateKey(date);
      const dayData = brushingData[dateKey];
      
      // بررسی آیا امروز است
      const todayJalali = toJalali(new Date());
      const isToday = todayJalali[0] === jYear && 
                      todayJalali[1] === jMonth && 
                      todayJalali[2] === day;
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => handleDayClick(date)}
        >
          <div className="day-number">{persianDigits(day)}</div>
          {dayData && (
            <div className="brushing-indicators">
              {dayData.morning && dayData.morning.brushed && (
                <div className="morning-indicator" title="مسواک صبح">☀️</div>
              )}
              {dayData.evening && dayData.evening.brushed && (
                <div className="evening-indicator" title="مسواک شب">🌙</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="month-nav">&lt;</button>
          <div className="current-month">
            {monthNames[jMonth - 1]} {persianDigits(jYear)}
          </div>
          <button onClick={handleNextMonth} className="month-nav">&gt;</button>
        </div>
        
        <div className="day-names">
          {dayNames.map(name => (
            <div key={name} className="day-name">{name}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };
  
  // تبدیل اعداد انگلیسی به فارسی
  const persianDigits = (n) => {
    if (n === null || n === undefined || n === '') return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
  };
  
  // Get filtered data for report table
  const getFilteredData = () => {
    const today = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 6); // 6 روز قبل + امروز = 7 روز
        break;
      case 'month':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'three_days':
        startDate.setDate(today.getDate() - 3);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    const filteredData = [];
    
    // Loop through each day in range
    const current = new Date(startDate);
    while (current <= today) {
      const dateKey = formatDateKey(current);
      const dayData = brushingData[dateKey] || {
        morning: { brushed: false, time: '' },
        evening: { brushed: false, time: '' }
      };
      
      filteredData.push({
        date: new Date(current),
        ...dayData
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    // Sort by date (newest first)
    return filteredData.sort((a, b) => b.date - a.date);
  };
  
  // Format date for display - تبدیل به شمسی
  const formatDate = (date) => {
    const jalaliDate = toJalali(date);
    return `${persianDigits(jalaliDate[0])}/${persianDigits(jalaliDate[1])}/${persianDigits(jalaliDate[2])}`;
  };
  
  // Get stats
  const stats = calculateStats();
  const filteredData = getFilteredData();
  
  return (
    <div className="parent-brushing-dashboard">
      <h1>داشبورد مسواک {childName}</h1>
      
      <div className="dashboard-layout">
        <div className="calendar-section">
          <h2>تقویم مسواک</h2>
          <div className="calendar-container">
            {renderCalendar()}
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="morning-indicator">☀️</span>
              <span>مسواک صبح</span>
            </div>
            <div className="legend-item">
              <span className="evening-indicator">🌙</span>
              <span>مسواک شب</span>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <div className="report-header">
            <h2>گزارش مسواک زدن</h2>
            <div className="report-actions">
              <div className="date-range-filter">
                <label htmlFor="dateRange">بازه زمانی:</label>
                <select 
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="three_days">۳ روز اخیر</option>
                  <option value="week">هفته اخیر</option>
                  <option value="month">ماه اخیر</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="report-stats">
            <div className="stat-card">
              <div className="stat-value">{persianDigits(stats.morning)}%</div>
              <div className="stat-label">مسواک صبح</div>
              <div className="stat-sub">{persianDigits(stats.morningCount)} از {persianDigits(stats.total)} روز</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{persianDigits(stats.evening)}%</div>
              <div className="stat-label">مسواک شب</div>
              <div className="stat-sub">{persianDigits(stats.eveningCount)} از {persianDigits(stats.total)} روز</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{persianDigits(stats.complete)}%</div>
              <div className="stat-label">مسواک کامل</div>
              <div className="stat-sub">{persianDigits(stats.completeCount)} از {persianDigits(stats.total)} روز</div>
            </div>
          </div>
          
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>مسواک صبح</th>
                  <th>زمان (دقیقه)</th>
                  <th>مسواک شب</th>
                  <th>زمان (دقیقه)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((day, index) => (
                  <tr key={index} onClick={() => handleDayClick(day.date)} className="clickable-row">
                    <td>{formatDate(day.date)}</td>
                    <td>
                      <span className={`status-indicator ${day.morning.brushed ? 'success' : 'error'}`}>
                        {day.morning.brushed ? '✓' : '✗'}
                      </span>
                    </td>
                    <td>{persianDigits(day.morning.time)}</td>
                    <td>
                      <span className={`status-indicator ${day.evening.brushed ? 'success' : 'error'}`}>
                        {day.evening.brushed ? '✓' : '✗'}
                      </span>
                    </td>
                    <td>{persianDigits(day.evening.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="report-tips">
            <h3>راهنمای استفاده از تقویم</h3>
            <ul>
              <li>برای ثبت وضعیت مسواک کودک، روی روز مورد نظر در تقویم کلیک کنید.</li>
              <li>در پنجره باز شده، وضعیت مسواک صبح و شب را مشخص کنید و مدت زمان مسواک زدن را وارد نمایید.</li>
              <li>پس از ثبت اطلاعات، نمادهای ☀️ و 🌙 در تقویم نمایش داده می‌شوند.</li>
              <li>برای مشاهده گزارش هفتگی، گزینه "هفته اخیر" را از منوی بازه زمانی انتخاب کنید.</li>
              <li>می‌توانید با کلیک روی هر سطر در جدول گزارش نیز اطلاعات آن روز را ویرایش کنید.</li>
            </ul>
            
            <h3>توصیه‌های بهداشتی</h3>
            <ul>
              <li>مسواک زدن باید دو بار در روز (صبح و شب) و هر بار به مدت حداقل ۲ دقیقه انجام شود.</li>
              <li>تعویض مسواک هر ۳ ماه یکبار توصیه می‌شود.</li>
              <li>مراجعه به دندانپزشک هر ۶ ماه یکبار برای معاینه دوره‌ای ضروری است.</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Modal for adding/editing brushing record */}
      {showAddModal && selectedDate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>ثبت وضعیت مسواک</h3>
            <p className="modal-date">{formatDate(selectedDate)}</p>
            
            <div className="record-section">
              <h4>مسواک صبح</h4>
              <div className="record-field">
                <label>
                  <input 
                    type="checkbox" 
                    checked={currentRecord.morning.brushed}
                    onChange={(e) => handleRecordChange('morning', 'brushed', e.target.checked)}
                  />
                  مسواک زده شده
                </label>
              </div>
              
              <div className="record-field">
                <label>مدت زمان (دقیقه):</label>
                <input 
                  type="text" 
                  value={currentRecord.morning.time}
                  onChange={(e) => {
                    // فقط اعداد قبول می‌شود
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleRecordChange('morning', 'time', value);
                  }}
                  onClick={(e) => {
                    // انتخاب کامل متن در هنگام کلیک
                    e.target.select();
                  }}
                  disabled={!currentRecord.morning.brushed}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="record-section">
              <h4>مسواک شب</h4>
              <div className="record-field">
                <label>
                  <input 
                    type="checkbox" 
                    checked={currentRecord.evening.brushed}
                    onChange={(e) => handleRecordChange('evening', 'brushed', e.target.checked)}
                  />
                  مسواک زده شده
                </label>
              </div>
              
              <div className="record-field">
                <label>مدت زمان (دقیقه):</label>
                <input 
                  type="text" 
                  value={currentRecord.evening.time}
                  onChange={(e) => {
                    // فقط اعداد قبول می‌شود
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleRecordChange('evening', 'time', value);
                  }}
                  onClick={(e) => {
                    // انتخاب کامل متن در هنگام کلیک
                    e.target.select();
                  }}
                  disabled={!currentRecord.evening.brushed}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={handleSaveRecord} className="save-button">ذخیره</button>
              <button onClick={() => setShowAddModal(false)} className="cancel-button">انصراف</button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .parent-brushing-dashboard {
          font-family: 'Tahoma', 'Arial', sans-serif;
          direction: rtl;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #4a6bff;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        @media (min-width: 992px) {
          .dashboard-layout {
            flex-direction: row;
          }
          
          .calendar-section {
            width: 45%;
          }
          
          .report-section {
            width: 55%;
          }
        }
        
        /* Calendar Styling */
        .calendar-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .calendar {
          width: 100%;
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: #4a6bff;
          color: white;
        }
        
        .current-month {
          font-size: 18px;
          font-weight: bold;
        }
        
        .month-nav {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 5px 10px;
        }
        
        .day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: #f7f9fc;
          border-bottom: 1px solid #eaeaea;
        }
        
        .day-name {
          padding: 10px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        
        .calendar-day {
          height: 80px;
          border: 1px solid #eaeaea;
          padding: 5px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .calendar-day:hover {
          background-color: #f0f5ff;
        }
        
        .calendar-day.empty {
          background-color: #f9f9f9;
          cursor: default;
        }
        
        .calendar-day.today {
          background-color: #e8f0ff;
        }
        
        .day-number {
          font-weight: bold;
          font-size: 16px;
        }
        
        .brushing-indicators {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }
        
        .morning-indicator, .evening-indicator {
          margin: 2px 0;
          font-size: 20px;
        }
        
        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        /* Report Styling */
        .report-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .report-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .date-range-filter {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .date-range-filter select {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        
        .report-stats {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background-color: #f7f9fc;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          flex: 1;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #4a6bff;
        }
        
        .stat-label {
          margin-top: 5px;
          font-weight: bold;
        }
        
        .stat-sub {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .report-table-container {
          margin-bottom: 30px;
          overflow-x: auto;
        }
        
        .report-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .report-table th,
        .report-table td {
          padding: 12px 15px;
          text-align: center;
          border-bottom: 1px solid #eaeaea;
        }
        
        .report-table th {
          background-color: #f7f9fc;
          font-weight: bold;
        }
        
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .clickable-row:hover {
          background-color: #f0f5ff;
        }
        
        .status-indicator {
          display: inline-block;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          text-align: center;
          line-height: 25px;
        }
        
        .status-indicator.success {
          background-color: #e7f9e4;
          color: #4caf50;
        }
        
        .status-indicator.error {
          background-color: #ffefef;
          color: #f44336;
        }
        
        .report-tips {
          background-color: #f7f9fc;
          border-radius: 10px;
          padding: 20px;
        }
        
        .report-tips h3 {
          color: #4a6bff;
          margin-top: 0;
        }
        
        .report-tips ul {
          padding-right: 20px;
        }
        
        .report-tips li {
          margin-bottom: 10px;
        }
        
        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          width: 90%;
          max-width: 500px;
          direction: rtl;
        }
        
        .modal-date {
          text-align: center;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .record-section {
          margin-bottom: 25px;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 15px;
        }
        
        .record-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #4a6bff;
        }
        
        .record-field {
          margin-bottom: 15px;
        }
        
        .record-field input[type="text"],
        .record-field input[type="number"] {
          width: 80px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }
        
        .save-button, .cancel-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .save-button {
          background-color: #4caf50;
          color: white;
        }
        
        .cancel-button {
          background-color: #f0f0f0;
          color: #333;
        }
        
        /* Print specific styles */
        @media print {
          .calendar-section,
          .modal-overlay,
          .date-range-filter {
            display: none !important;
          }
          
          .dashboard-layout {
            display: block;
          }
          
          .report-section {
            width: 100%;
            box-shadow: none;
          }
          
          .report-header {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BrushingReport;