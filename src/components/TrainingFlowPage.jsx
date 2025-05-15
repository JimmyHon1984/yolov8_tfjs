import React, { useState, useRef, useEffect } from "react";
import "../style/TrainingFlowPage.css";

// 預設樣本圖片 - 這裡用的是 base64 編碼的小型圖示，實際開發中可以換成真實的範例圖片
const mockImages = [
  { id: 1, label: "貓", icon: "🐱" },
  { id: 2, label: "狗", icon: "🐶" },
  { id: 3, label: "蘋果", icon: "🍎" },
  { id: 4, label: "汽車", icon: "🚗" },
];

const TrainingFlowPage = ({ onTrainingComplete, onReturnHome }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [labeledImages, setLabeledImages] = useState([]);
  const [modelName, setModelName] = useState("");
  const [trainingType, setTrainingType] = useState("new");
  const [baseModel, setBaseModel] = useState("通用物件模型 (預設)");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [isLabeling, setIsLabeling] = useState(false);
  
  // 模擬上傳圖片
  const handleUploadImages = () => {
    setUploadedImages([...mockImages]);
  };

  // 模擬自動標記圖片
  const handleAutoLabelImages = () => {
    setIsLabeling(true);
    
    // 顯示標記中的提示
    setTimeout(() => {
      setLabeledImages([...uploadedImages]);
      setIsLabeling(false);
    }, 2000);
  };

  // 處理模型訓練
  const handleStartTraining = () => {
    setCurrentStep(3);
    
    // 模擬訓練進度
    let progress = 0;
    const trainingInterval = setInterval(() => {
      progress += 1;
      setTrainingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(trainingInterval);
        setTrainingComplete(true);
      }
    }, 600); // 總時間約 1 分鐘

    return () => clearInterval(trainingInterval);
  };

  // 渲染當前步驟
  const renderStep = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="training-step">
            <h2>第一步：準備訓練圖片</h2>
            
            <div className="step-content">
              <button 
                className="primary-button" 
                onClick={handleUploadImages}
                disabled={uploadedImages.length > 0}
              >
                『上傳』示例圖片 (模擬，3-5張)
              </button>
              
              {uploadedImages.length > 0 && (
                <div className="image-gallery">
                  {uploadedImages.map(img => (
                    <div className="thumbnail-container" key={img.id}>
                      <div className="thumbnail mock-image">
                        <span className="image-icon">{img.icon}</span>
    </div>
                      <p className="image-name">{img.label}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {uploadedImages.length > 0 && (
                <button 
                  className="primary-button" 
                  onClick={handleAutoLabelImages}
                  disabled={labeledImages.length > 0 || isLabeling}
                >
                  {isLabeling ? "標記中..." : "自動標記圖片 (模擬)"}
                </button>
              )}
              
              {labeledImages.length > 0 && (
                <div className="image-gallery">
                  {labeledImages.map(img => (
                    <div className="thumbnail-container labeled" key={img.id}>
                      <div className="thumbnail mock-image">
                        <span className="image-icon">{img.icon}</span>
                        <div className="bounding-box"></div>
                      </div>
                      <div className="image-label">{img.label}</div>
                    </div>
                  ))}
                  <div className="success-message">圖片標記完成！</div>
                </div>
              )}
            </div>
            
            {labeledImages.length > 0 && (
              <button className="primary-button" onClick={() => setCurrentStep(2)}>
                下一步
              </button>
            )}
          </div>
  );
      
      case 2:
        return (
          <div className="training-step">
            <h2>第二步：設定訓練任務</h2>
            
            <div className="step-content">
              <div className="input-group">
                <label htmlFor="model-name">為你的 AI 模型命名</label>
                <input
                  type="text"
                  id="model-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="例如：我的動物識別模型"
                />
              </div>
              
              <div className="radio-group">
                <p>選擇訓練類型</p>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="new-model"
                    name="training-type"
                    value="new"
                    checked={trainingType === "new"}
                    onChange={() => setTrainingType("new")}
                  />
                  <label htmlFor="new-model">訓練一個全新的模型</label>
                </div>
                
                <div className="radio-option">
                  <input
                    type="radio"
                    id="existing-model"
                    name="training-type"
                    value="existing"
                    checked={trainingType === "existing"}
                    onChange={() => setTrainingType("existing")}
                  />
                  <label htmlFor="existing-model">在現有模型基礎上繼續訓練</label>
                </div>
              </div>
              
              {trainingType === "existing" && (
                <div className="select-group">
                  <label htmlFor="base-model">選擇基礎模型</label>
                  <select
                    id="base-model"
                    value={baseModel}
                    onChange={(e) => setBaseModel(e.target.value)}
                  >
                    <option value="通用物件模型 (預設)">通用物件模型 (預設)</option>
                  </select>
                </div>
              )}
              
              <button 
                className="primary-button" 
                onClick={handleStartTraining}
                disabled={!modelName}
              >
                開始訓練
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="training-step">
            <h2>第三步：AI 模型學習中...</h2>
            
            <div className="step-content">
              <p className="training-status">
                {trainingType === "new" 
                  ? `AI 模型 '${modelName}' 正在學習中... 請稍候。`
                  : `AI 模型 '${modelName}' 正在基於 '${baseModel}' 進行學習... 請稍候。`
                }
              </p>
              
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${trainingProgress}%` }}
                ></div>
                <div className="progress-text">{trainingProgress}%</div>
              </div>
              
              {trainingComplete && (
                <div className="training-complete">
                  <div className="success-message">
                    恭喜！AI 模型 '{modelName}' 訓練完成！
                  </div>
                  
                  <div className="button-group">
                    <button 
                      className="primary-button" 
                      onClick={() => onTrainingComplete(modelName)}
                    >
                      去試試新模型 (物件識別)
                    </button>
                    <button 
                      className="secondary-button" 
                      onClick={onReturnHome}
                    >
                      返回主頁
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return <div>未知步驟</div>;
    }
};

  return (
    <div className="training-container">
      <h1>AI 模型訓練</h1>
      {renderStep()}
    </div>
  );
};

export default TrainingFlowPage;