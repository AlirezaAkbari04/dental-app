import React, { useState, useEffect } from 'react';
import './ParentComponents.css';
import DatabaseService from '../../../services/DatabaseService';
import { Capacitor } from '@capacitor/core';

const InfoGraphics = () => {
  const [selectedInfoGraphic, setSelectedInfoGraphic] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

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
    },
    {
      id: 3,
      title: 'راهنمای جامع بهداشت دهان و دندان',
      description: 'فایل PDF آموزشی کامل برای والدین و کودکان',
      imageUrl: '/infographics/dental-guide.jpg',
      type: 'pdf',
      pdfPath: 'dental-guide.pdf',
      content: `
        <h2>راهنمای جامع بهداشت دهان و دندان</h2>
        <p>این راهنما شامل اطلاعات کاملی در مورد نحوه مراقبت از دندان‌ها، 
        تکنیک‌های صحیح مسواک زدن، استفاده از نخ دندان و سایر نکات مهم بهداشتی است.</p>
      `
    }
  ];

  // useEffect for database initialization
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
        // Mark assets as loaded
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Error initializing database:', error);
        // Still mark assets as loaded even if there's an error
        setAssetsLoaded(true);
      }
    };

    initDatabase();
  }, []);

  // Handle opening PDF file
  const handleViewPDF = () => {
    if (selectedInfoGraphic && selectedInfoGraphic.type === 'pdf') {
      setShowPdfViewer(true);
    }
  };
  
  // Handle closing PDF viewer
  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
  };

  const handleSelectInfoGraphic = (infographic) => {
    setSelectedInfoGraphic(infographic);
    if (infographic.type === 'pdf') {
      setShowPdfViewer(false);
    }
  };

  const handleBackToList = () => {
    setSelectedInfoGraphic(null);
    setShowPdfViewer(false);
  };

  // Show loading state while assets are loading
  if (!assetsLoaded) {
    return (
      <div className="infographics-container">
        <div className="loading-indicator">
          <p>در حال بارگذاری اینفوگرافی‌ها...</p>
        </div>
      </div>
    );
  }

  // Full-screen PDF viewer 
  if (showPdfViewer && selectedInfoGraphic && selectedInfoGraphic.type === 'pdf') {
    // For Capacitor/Android, we use the asset path structure
    const pdfPath = Capacitor.isNativePlatform()
      ? `file:///android_asset/public/assets/pdfs/${selectedInfoGraphic.pdfPath}`
      : `assets/pdfs/${selectedInfoGraphic.pdfPath}`;

    return (
      <div className="pdf-viewer-fullscreen">
        <div className="pdf-viewer-header">
          <h3>{selectedInfoGraphic.title}</h3>
          <button className="close-button" onClick={handleClosePdfViewer}>
            بازگشت
          </button>
        </div>
        
        <div className="pdf-viewer-container-fullscreen">
          <iframe 
            src={pdfPath}
            className="pdf-viewer-iframe"
            title="PDF Viewer"
          ></iframe>
        </div>
      </div>
    );
  }

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
            <div className="detail-actions">
              {selectedInfoGraphic.type === 'pdf' && (
                <button className="view-button" onClick={handleViewPDF}>
                  مشاهده PDF
                </button>
              )}
              <button className="back-button" onClick={handleBackToList}>
                بازگشت به لیست
              </button>
            </div>
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
            
            {/* PDF preview icon for PDF type */}
            {selectedInfoGraphic.type === 'pdf' && (
              <div className="pdf-preview-container">
                <div className="pdf-icon">
                  <span className="pdf-icon-symbol">📄</span>
                </div>
                <p className="pdf-instructions">برای مشاهده فایل PDF کامل، روی دکمه "مشاهده PDF" کلیک کنید.</p>
              </div>
            )}
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
                {infographic.type === 'pdf' ? (
                  <div className="thumbnail-placeholder pdf-thumbnail">
                    <span className="placeholder-icon">📄</span>
                    <span className="placeholder-text">PDF</span>
                  </div>
                ) : (
                  <div className="thumbnail-placeholder">
                    <span className="placeholder-icon">🖼️</span>
                  </div>
                )}
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
          <li>فایل‌های PDF را می‌توانید برای مطالعه بیشتر مشاهده کنید.</li>
        </ul>
      </div>
      
      <style jsx>{`
        .loading-indicator {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        .pdf-thumbnail {
          background-color: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .pdf-thumbnail .placeholder-icon {
          font-size: 2rem;
          margin-bottom: 5px;
        }
        
        .placeholder-text {
          font-size: 0.8rem;
          color: #666;
        }
        
        .pdf-preview-container {
          margin: 20px 0;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          border: 1px dashed #ccc;
        }
        
        .pdf-icon {
          font-size: 2rem;
          margin-left: 20px;
          color: #e74c3c;
          background-color: white;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .pdf-icon-symbol {
          font-size: 2.5rem;
        }
        
        .pdf-instructions {
          flex: 1;
          margin: 0;
          color: #555;
        }
        
        .pdf-viewer-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #fff;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        
        .pdf-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }
        
        .pdf-viewer-header h3 {
          margin: 0;
        }
        
        .close-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
        }
        
        .pdf-viewer-container-fullscreen {
          flex: 1;
          overflow: hidden;
        }
        
        .pdf-viewer-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .detail-actions {
          display: flex;
          gap: 10px;
        }
        
        .view-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
        }
        
        .view-button:hover {
          background-color: #0b7dda;
        }
        
        .back-button {
          background-color: #f0f0f0;
          color: #333;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
        }
        
        .back-button:hover {
          background-color: #ddd;
        }
      `}</style>
    </div>
  );
};

export default InfoGraphics;