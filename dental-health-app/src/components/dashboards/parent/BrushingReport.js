import React, { useState, useEffect } from 'react';
import './ParentComponents.css';

const BrushingReport = ({ childName }) => {
  const [brushingData, setBrushingData] = useState([]);
  const [dateRange, setDateRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  // Load brushing data from localStorage or mock data for demo
  useEffect(() => {
    setIsLoading(true);
    
    // In a real application, this would be fetched from a database
    // For demo purposes, we'll generate mock data
    const mockData = generateMockData();
    
    // Filter data based on selected range
    const filteredData = filterDataByRange(mockData, dateRange);
    
    setBrushingData(filteredData);
    setIsLoading(false);
  }, [dateRange]);
  
  // Generate mock brushing data for the past 30 days
  const generateMockData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random values for demo purposes
      const morningBrushed = Math.random() > 0.3; // 70% chance of brushing in the morning
      const eveningBrushed = Math.random() > 0.2; // 80% chance of brushing in the evening
      
      // Random values for quadrants cleaned (only if brushed)
      const morningQuadrants = morningBrushed ? Math.floor(Math.random() * 5) : 0;
      const eveningQuadrants = eveningBrushed ? Math.floor(Math.random() * 5) : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        morning: {
          brushed: morningBrushed,
          quadrants: morningQuadrants,
          time: morningBrushed ? Math.floor(Math.random() * 120) + 60 : 0 // 1-3 minutes
        },
        evening: {
          brushed: eveningBrushed,
          quadrants: eveningQuadrants,
          time: eveningBrushed ? Math.floor(Math.random() * 120) + 60 : 0 // 1-3 minutes
        }
      });
    }
    
    return data;
  };
  
  // Filter data based on selected date range
  const filterDataByRange = (data, range) => {
    const today = new Date();
    
    switch (range) {
      case 'week':
        // Last 7 days
        return data.filter((item, index) => index < 7);
      case 'month':
        // Last 30 days
        return data;
      case 'three_days':
        // Last 3 days
        return data.filter((item, index) => index < 3);
      default:
        return data;
    }
  };
  
  // Calculate statistics
  const calculateStats = () => {
    if (brushingData.length === 0) return { total: 0, morning: 0, evening: 0, complete: 0 };
    
    const totalDays = brushingData.length;
    const morningBrushed = brushingData.filter(day => day.morning.brushed).length;
    const eveningBrushed = brushingData.filter(day => day.evening.brushed).length;
    const completeBrushing = brushingData.filter(day => day.morning.brushed && day.evening.brushed).length;
    
    return {
      total: totalDays,
      morning: Math.round((morningBrushed / totalDays) * 100),
      evening: Math.round((eveningBrushed / totalDays) * 100),
      complete: Math.round((completeBrushing / totalDays) * 100)
    };
  };
  
  const stats = calculateStats();
  
  // Format date in Persian style (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  // Handle printing the report
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="brushing-report-container">
      <div className="report-header">
        <h2>گزارش مسواک زدن {childName}</h2>
        <div className="report-actions">
          <div className="date-range-filter">
            <label htmlFor="dateRange">بازه زمانی:</label>
            <select 
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="three_days">3 روز اخیر</option>
              <option value="week">هفته اخیر</option>
              <option value="month">ماه اخیر</option>
            </select>
          </div>
          <button className="print-button" onClick={handlePrint}>
            چاپ گزارش
          </button>
        </div>
      </div>
      
      <div className="report-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.morning}%</div>
          <div className="stat-label">مسواک صبح</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.evening}%</div>
          <div className="stat-label">مسواک شب</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.complete}%</div>
          <div className="stat-label">مسواک کامل</div>
        </div>
      </div>
      
      <div className="report-table-container">
        {isLoading ? (
          <div className="loading-indicator">در حال بارگذاری...</div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>مسواک صبح</th>
                <th>زمان (ثانیه)</th>
                <th>بخش‌های تمیز شده</th>
                <th>مسواک شب</th>
                <th>زمان (ثانیه)</th>
                <th>بخش‌های تمیز شده</th>
              </tr>
            </thead>
            <tbody>
              {brushingData.map((day, index) => (
                <tr key={index}>
                  <td>{formatDate(day.date)}</td>
                  <td>
                    <span className={`status-indicator ${day.morning.brushed ? 'success' : 'error'}`}>
                      {day.morning.brushed ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>{day.morning.time}</td>
                  <td>{day.morning.quadrants}/4</td>
                  <td>
                    <span className={`status-indicator ${day.evening.brushed ? 'success' : 'error'}`}>
                      {day.evening.brushed ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>{day.evening.time}</td>
                  <td>{day.evening.quadrants}/4</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="report-tips">
        <h3>توصیه‌های بهداشتی</h3>
        <ul>
          <li>مسواک زدن باید دو بار در روز (صبح و شب) و هر بار به مدت حداقل 2 دقیقه انجام شود.</li>
          <li>برای رسیدن به نتیجه مطلوب، هر چهار ناحیه دندان (بالا راست، بالا چپ، پایین راست، پایین چپ) باید تمیز شوند.</li>
          <li>تعویض مسواک هر 3 ماه یکبار توصیه می‌شود.</li>
          <li>مراجعه به دندانپزشک هر 6 ماه یکبار برای معاینه دوره‌ای ضروری است.</li>
        </ul>
      </div>
    </div>
  );
};

export default BrushingReport;