import React, { useState } from 'react';
import '../../../styles/ChildComponents.css';

const ChildVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const educationalVideos = [
    {
      id: 1,
      title: 'فیشور سیلنت (شیارپوش) چیست؟',
      description: 'در این ویدیو می‌آموزید که فیشور سیلنت چیست و چگونه از دندان‌های شما محافظت می‌کند.',
      thumbnail: '/assets/images/video-thumbnail-1.jpg',
      videoUrl: '/assets/videos/Fissure_sealant.mp4',
    }
  ];
  
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };
  
  const handleBackToList = () => {
    setSelectedVideo(null);
  };
  
  return (
    <div className="videos-container">
      <h2>ویدیوهای آموزشی</h2>
      
      {selectedVideo ? (
        <div className="video-player-container">
          <div className="video-header">
            <button className="back-button" onClick={handleBackToList}>
              بازگشت به لیست ویدیوها
            </button>
            <h3 className="video-title">{selectedVideo.title}</h3>
          </div>
          
          <div className="video-player-wrapper">
            <video 
              controls
              preload="metadata"
              className="responsive-video-player"
            >
              <source src={selectedVideo.videoUrl} type="video/mp4" />
              مرورگر شما از این ویدیو پشتیبانی نمی‌کند.
            </video>
          </div>
          
          <div className="video-description">
            <p>{selectedVideo.description}</p>
          </div>
        </div>
      ) : (
        <div className="video-list">
          {educationalVideos.map(video => (
            <div 
              key={video.id} 
              className="video-card" 
              onClick={() => handleVideoSelect(video)}
            >
              <div className="video-thumbnail">
                <div className="thumbnail-container">
                  <span className="play-icon">▶️</span>
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-card-title">{video.title}</h3>
                <p className="video-card-description">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="video-tips">
        <h3>نکات مفید</h3>
        <ul>
          <li>همیشه پس از تماشای ویدیوهای آموزشی، از والدین خود سؤال بپرسید.</li>
          <li>سعی کنید مطالبی را که در ویدیوها یاد می‌گیرید، به خاطر بسپارید.</li>
          <li>مطالب آموزنده را با دوستان و خانواده خود به اشتراک بگذارید.</li>
        </ul>
      </div>

      <style jsx>{`
        .videos-container {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 12px;
          max-width: 100%;
        }
        
        h2 {
          color: #4a6bff;
          text-align: center;
          margin-bottom: 25px;
        }
        
        .video-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .video-card {
          display: flex;
          align-items: center;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .video-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
        }
        
        .video-thumbnail {
          flex: 0 0 120px;
          height: 90px;
          background-color: #f0f0f0;
          position: relative;
        }
        
        .thumbnail-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background-color: #e0e0e0;
        }
        
        .play-icon {
          font-size: 30px;
        }
        
        .video-info {
          padding: 15px;
          flex: 1;
        }
        
        .video-card-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #333;
        }
        
        .video-card-description {
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }
        
        .video-player-container {
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }
        
        .video-header {
          padding: 15px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #eee;
        }
        
        .back-button {
          background-color: #f0f0f0;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          margin-left: 15px;
          cursor: pointer;
          font-size: 13px;
        }
        
        .video-title {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        
        .video-player-wrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
          overflow: hidden;
        }
        
        .responsive-video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: #000;
        }
        
        .video-description {
          padding: 15px;
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }
        
        .video-tips {
          background-color: #f0f5ff;
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
        }
        
        .video-tips h3 {
          color: #4a6bff;
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .video-tips ul {
          padding-right: 20px;
          margin: 0;
        }
        
        .video-tips li {
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .video-thumbnail {
            flex: 0 0 100px;
            height: 75px;
          }
          
          .video-card-title {
            font-size: 15px;
          }
          
          .video-card-description {
            font-size: 12px;
          }
          
          .back-button {
            padding: 6px 10px;
            font-size: 12px;
          }
          
          .video-header {
            padding: 12px;
          }
          
          .video-description {
            padding: 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChildVideos;