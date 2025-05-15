import React from "react";
import "../style/WelcomePage.css";

const WelcomePage = ({ onStart }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>AI 物件偵測小助手</h1>
        <p className="welcome-subtitle">歡迎來到 AI 物件偵測的奇妙世界！</p>
        <div className="welcome-features">
          <div className="feature">
            <div className="feature-icon">📷</div>
            <div className="feature-text">
              <h3>上傳圖片</h3>
              <p>上傳你的圖片，讓 AI 幫你識別其中的物件</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🎥</div>
            <div className="feature-text">
              <h3>分析影片</h3>
              <p>上傳影片或使用網路攝影機，進行即時物件偵測</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🧠</div>
            <div className="feature-text">
              <h3>學習 AI</h3>
              <p>了解 AI 是如何識別物件的</p>
            </div>
          </div>
        </div>
        <button className="start-button" onClick={onStart}>點擊開始探索</button>
      </div>
      <div className="welcome-illustration">
        <div className="welcome-image">
          <div className="ai-brain-animation">
            <div className="brain-container">
              <div className="brain-center"></div>
              <div className="brain-node n1"></div>
              <div className="brain-node n2"></div>
              <div className="brain-node n3"></div>
              <div className="brain-node n4"></div>
              <div className="brain-node n5"></div>
              <div className="brain-node n6"></div>
              <div className="brain-connection c1"></div>
              <div className="brain-connection c2"></div>
              <div className="brain-connection c3"></div>
              <div className="brain-connection c4"></div>
              <div className="brain-connection c5"></div>
              <div className="brain-connection c6"></div>
            </div>
            <div className="detection-box"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;