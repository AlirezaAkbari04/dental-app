import React, { useState } from 'react';
import './ParentComponents.css';

const InfoGraphics = () => {
  const [selectedInfoGraphic, setSelectedInfoGraphic] = useState(null);
  
  // List of available infographics
  const infographics = [
    {
      id: 1,
      title: 'اهمیت دندان شیری',
      description: 'چرا دندان‌های شیری مهم هستند و چگونه از آنها مراقبت کنیم؟',
      imageUrl: '/infographics/baby-teeth.jpg',
      content: `
        <h2>اهمیت دندان‌های شیری</h2>
        <p>دندان‌های شیری نقش مهمی در رشد و سلامت کودک دارند. این دندان‌ها فضا را برای دندان‌های دائمی حفظ می‌کنند و به رشد صحیح فک و صورت کمک می‌کنند.</p>
        
        <div class="audio-container">
          <div class="audio-placeholder">
            <span class="placeholder-icon">🔊</span>
            <span class="placeholder-text">فایل صوتی: توضیحات تکمیلی درباره اهمیت دندان‌های شیری</span>
          </div>
        </div>
      `
    },
    {
      id: 2,
      title: 'فلوراید',
      description: 'فواید فلوراید برای سلامت دندان‌ها و چگونگی استفاده صحیح از آن',
      imageUrl: '/infographics/fluoride.jpg',
      content: `
        <h2>فلوراید</h2>
        <div class="fluoride-brochure-container">
          <img 
            src="/assets/images/fluoride-brochure-1.png" 
            alt="" 
            class="fluoride-brochure-image"
          />
          <img 
            src="/assets/images/fluoride-brochure-2.png" 
            alt="" 
            class="fluoride-brochure-image"
          />
        </div>
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
            <h3 className="detail-title">{selectedInfoGraphic.title}</h3>
            <button className="back-button" onClick={handleBackToList}>
              بازگشت به لیست
            </button>
          </div>
          
          <div className="infographic-content">
            {/* Only show tooth anatomy images for the Baby Teeth section (id: 1) */}
            {selectedInfoGraphic.id === 1 && (
              <div className="side-by-side-images">
                <div className="tooth-image">
                  <img 
                    src="/assets/images/tooth-anatomy-english.png" 
                    alt="" 
                    className="anatomy-image"
                  />
                </div>
                
                <div className="tooth-image">
                  <img 
                    src="/assets/images/tooth-anatomy-persian.png" 
                    alt="" 
                    className="anatomy-image"
                  />
                </div>
              </div>
            )}
            
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