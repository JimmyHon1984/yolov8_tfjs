import React from "react";
import "../style/DashboardPage.css";

const DashboardPage = ({ userName, onTrainModel, onDetectObject }) => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>你好，{userName}！</h1>
          <p className="dashboard-subtitle">歡迎來到 AI 物件偵測小助手</p>
        </div>
      </header>
      
      <div className="dashboard-main">
        <div className="dashboard-section">
          <h2>選擇要使用的功能</h2>
          
          <div className="dashboard-cards">
            <div className="dashboard-card" onClick={onTrainModel}>
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C16.4183 3 20 6.58172 20 11C20 15.4183 16.4183 19 12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 10L10 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19V22" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 19L5 22" stroke="currentColor" strokeWidth="2"/>
                  <path d="M17 19L19 22" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="card-content">
                <h2>訓練 AI 模型</h2>
                <p>上傳圖片，教 AI 認識不同的物件</p>
                <ul className="card-features">
                  <li>上傳範例圖片</li>
                  <li>自動標記學習</li>
                  <li>建立專屬 AI 模型</li>
                </ul>
                <button className="card-button">開始訓練</button>
              </div>
            </div>
            
            <div className="dashboard-card" onClick={onDetectObject}>
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="card-content">
                <h2>物件識別</h2>
                <p>上傳圖片、影片或使用網路攝影機進行物件識別</p>
                <ul className="card-features">
                  <li>識別圖片中的物件</li>
                  <li>分析影片內容</li>
                  <li>即時攝影機物件偵測</li>
                </ul>
                <button className="card-button">開始識別</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section tips-section">
          <h2>小提示</h2>
          <div className="tips-container">
            <div className="tip">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <h3>如何獲得更好的識別效果？</h3>
                <p>使用光線充足、清晰且包含完整物件的圖片，可以獲得更準確的識別結果。</p>
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">🔍</div>
              <div className="tip-content">
                <h3>AI 如何學習識別物件？</h3>
                <p>AI 透過大量標記好的圖片學習，分析物件的形狀、顏色和特徵模式。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;