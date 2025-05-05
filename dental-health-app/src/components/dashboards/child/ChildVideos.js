import React, { useState } from 'react';
import '../../../styles/ChildComponents.css';

const ChildVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const educationalVideos = [
    {
      id: 1,
      title: 'فیشور سیلنت (شیارپوش) چیست؟',
      description: 'در این ویدیو می‌آموزید که فیشور سیلنت چیست و چگونه از دندان‌های شما محافظت می‌کند.',
      thumbnail: '/video-thumbnails/fissure-sealant.jpg',
      videoUrl: '/videos/fissure-sealant.mp4',
    },
    {
      id: 2,
      title: 'اهمیت دندان‌های شیری',
      description: 'چرا دندان‌های شیری مهم هستند و چرا باید از آنها مراقبت کنیم؟',
      thumbnail: '/video-thumbnails/baby-teeth.jpg',
      videoUrl: '/videos/baby-teeth.mp4',
    },
    {
      id: 3,
      title: 'فواید فلوراید و خمیردندان',
      description: 'بیاموزید که فلوراید چیست و چگونه به سلامت دندان‌های شما کمک می‌کند.',
      thumbnail: '/video-thumbnails/fluoride.jpg',
      videoUrl: '/videos/fluoride.mp4',
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
          
          <div className="video-player">
            {/* در حالت واقعی، از تگ video برای پخش ویدیو استفاده می‌شود */}
            <div className="video-placeholder">
              <p>پخش ویدیو: {selectedVideo.title}</p>
              <p>در اینجا ویدیوی واقعی بارگذاری می‌شود</p>
            </div>
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
                {/* در حالت واقعی، از تصویر بندانگشتی ویدیو استفاده می‌شود */}
                <div className="thumbnail-placeholder">
                  <span className="video-icon">🎬</span>
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
    </div>
  );
};

export default ChildVideos;