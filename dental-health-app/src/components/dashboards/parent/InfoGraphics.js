import React, { useState } from 'react';
import './ParentComponents.css';

const InfoGraphics = () => {
  const [selectedInfoGraphic, setSelectedInfoGraphic] = useState(null);
  
  // List of available infographics
  const infographics = [
    {
      id: 1,
      title: 'پلاک دندانی',
      description: 'پلاک دندانی چیست و چگونه باعث پوسیدگی دندان می‌شود؟',
      imageUrl: '/infographics/plaque.jpg',
      content: `
        <h2>پلاک دندانی چیست؟</h2>
        <p>پلاک دندانی، لایه‌ای نرم و چسبنده از باکتری‌ها است که روی دندان‌ها تشکیل می‌شود. این لایه میکروبی، مهمترین عامل پوسیدگی دندان و بیماری‌های لثه محسوب می‌شود.</p>
        
        <h3>چگونه پلاک دندانی تشکیل می‌شود؟</h3>
        <p>پلاک دندانی به طور طبیعی و مداوم در دهان تشکیل می‌شود. باکتری‌های موجود در دهان با قندها و نشاسته‌های باقی‌مانده از غذا ترکیب شده و اسید تولید می‌کنند. این اسید به مینای دندان حمله کرده و باعث پوسیدگی می‌شود.</p>
        
        <h3>چگونه از تشکیل پلاک دندانی جلوگیری کنیم؟</h3>
        <ul>
          <li>مسواک زدن منظم (دو بار در روز) با خمیردندان حاوی فلوراید</li>
          <li>استفاده از نخ دندان برای تمیز کردن فضای بین دندان‌ها</li>
          <li>محدود کردن مصرف خوراکی‌های شیرین و نشاسته‌ای</li>
          <li>مراجعه منظم به دندانپزشک (هر 6 ماه)</li>
        </ul>
      `
    },
    {
      id: 2,
      title: 'فلوراید',
      description: 'فواید فلوراید برای سلامت دندان‌ها و چگونگی استفاده صحیح از آن',
      imageUrl: '/infographics/fluoride.jpg',
      content: `
        <h2>فلوراید چیست؟</h2>
        <p>فلوراید، ماده معدنی طبیعی است که در آب، خاک، هوا و برخی غذاها یافت می‌شود. این ماده نقش مهمی در پیشگیری از پوسیدگی دندان داشته و در بسیاری از خمیردندان‌ها و دهان‌شویه‌ها استفاده می‌شود.</p>
        
        <h3>فواید فلوراید برای دندان‌ها</h3>
        <ul>
          <li>تقویت مینای دندان و افزایش مقاومت در برابر اسیدها</li>
          <li>بازگرداندن مواد معدنی به سطوح دندان</li>
          <li>مبارزه با باکتری‌های مضر دهان</li>
          <li>کاهش حساسیت دندان</li>
        </ul>
        
        <h3>استفاده صحیح از فلوراید</h3>
        <p>برای کودکان زیر 3 سال، استفاده از مقدار بسیار کمی خمیردندان حاوی فلوراید (به اندازه یک دانه برنج) توصیه می‌شود. برای کودکان 3 تا 6 سال، مقدار خمیردندان باید به اندازه یک نخود باشد.</p>
        
        <h3>نکات مهم</h3>
        <ul>
          <li>کودکان را هنگام مسواک زدن نظارت کنید تا از قورت دادن خمیردندان جلوگیری شود</li>
          <li>از دهان‌شویه‌های حاوی فلوراید برای کودکان زیر 6 سال استفاده نکنید</li>
          <li>درباره استفاده از مکمل‌های فلوراید با دندانپزشک مشورت کنید</li>
        </ul>
      `
    }
  ];
  
  const handleSelectInfoGraphic = (infographic) => {
    setSelectedInfoGraphic(infographic);
  };
  
  const handleBackToList = () => {
    setSelectedInfoGraphic(null);
  };
  
  // Handle sharing infographic
  const handleShare = () => {
    // In a real app, this would open a sharing dialog
    alert('در یک برنامه واقعی، این قسمت امکان اشتراک‌گذاری اینفوگرافیک را فراهم می‌کند.');
  };
  
  // Handle downloading infographic
  const handleDownload = () => {
    // In a real app, this would trigger a download
    alert('در یک برنامه واقعی، این قسمت اینفوگرافیک را دانلود می‌کند.');
  };
  
  // Handle printing infographic
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="infographics-container">
      <div className="infographics-header">
        <h2>اینفوگرافی‌های دندانپزشکی</h2>
        <p className="infographics-description">
          در این بخش می‌توانید به اینفوگرافی‌های آموزشی در مورد سلامت دهان و دندان دسترسی داشته باشید.
        </p>
      </div>
      
      {selectedInfoGraphic ? (
        <div className="infographic-detail">
          <div className="detail-header">
            <button className="back-button" onClick={handleBackToList}>
              بازگشت به لیست
            </button>
            <h3 className="detail-title">{selectedInfoGraphic.title}</h3>
          </div>
          
          <div className="infographic-content">
            <div className="infographic-image-container">
              {/* در یک برنامه واقعی، تصویر اینفوگرافیک نمایش داده می‌شود */}
              <div className="infographic-placeholder">
                <span className="placeholder-icon">🖼️</span>
                <span className="placeholder-text">تصویر اینفوگرافیک: {selectedInfoGraphic.title}</span>
              </div>
            </div>
            
            <div 
              className="infographic-text"
              dangerouslySetInnerHTML={{ __html: selectedInfoGraphic.content }}
            />
          </div>
          
          <div className="infographic-actions">
            <button className="action-button share-button" onClick={handleShare}>
              <span className="action-icon">🔗</span>
              <span className="action-text">اشتراک‌گذاری</span>
            </button>
            <button className="action-button download-button" onClick={handleDownload}>
              <span className="action-icon">📥</span>
              <span className="action-text">دانلود</span>
            </button>
            <button className="action-button print-button" onClick={handlePrint}>
              <span className="action-icon">🖨️</span>
              <span className="action-text">چاپ</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="infographics-list">
          {infographics.map(infographic => (
            <div 
              key={infographic.id} 
              className="infographic-card" 
              onClick={() => handleSelectInfoGraphic(infographic)}
            >
              <div className="infographic-thumbnail">
                {/* در یک برنامه واقعی، تصویر بندانگشتی اینفوگرافیک نمایش داده می‌شود */}
                <div className="thumbnail-placeholder">
                  <span className="placeholder-icon">🖼️</span>
                </div>
              </div>
              <div className="infographic-info">
                <h3 className="infographic-title">{infographic.title}</h3>
                <p className="infographic-description">{infographic.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="infographics-tips">
        <h3>چگونه از این اطلاعات استفاده کنیم؟</h3>
        <ul>
          <li>اینفوگرافی‌ها را با کودک خود مرور کنید و مفاهیم را به زبان ساده برای او توضیح دهید.</li>
          <li>می‌توانید این اینفوگرافی‌ها را چاپ کرده و در محیطی که کودک مسواک می‌زند نصب کنید.</li>
          <li>با اشتراک‌گذاری این اطلاعات با دیگر والدین، به ارتقای سطح آگاهی درباره بهداشت دهان و دندان کمک کنید.</li>
        </ul>
      </div>
    </div>
  );
};

export default InfoGraphics;