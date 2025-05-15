import React, { useState, useRef, useEffect } from "react";
import { detect, detectVideo } from "../utils/detect";
import { Webcam } from "../utils/webcam";
import "../style/ObjectDetectionPage.css";

const ObjectDetectionPage = ({ model, trainedModels, onReturnHome }) => {
  const [streaming, setStreaming] = useState(null);
  const [selectedModel, setSelectedModel] = useState("通用物件模型 (預設)");
  const [isDetecting, setIsDetecting] = useState(false);
  const [metrics, setMetrics] = useState({ inferenceTime: 0, fps: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [panelWidth, setPanelWidth] = useState(360);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // 新增：直接追踪圖片URL
  
  // 參考
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const inputImageRef = useRef(null);
  const inputVideoRef = useRef(null);
  const resizerRef = useRef(null);
  const displayContainerRef = useRef(null);
  const contentRef = useRef(null);
  
  // 網路攝影機處理
  const webcam = new Webcam();
  
  // 關閉圖片
  const closeImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setStreaming(null);
    if (inputImageRef.current) inputImageRef.current.value = "";
    
    // 清除畫布
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };
  
  // 關閉影片
  const closeVideo = () => {
    if (!videoRef.current) return;
    
    const url = videoRef.current.src;
    if (url && url !== "") {
      videoRef.current.src = "";
      URL.revokeObjectURL(url);
    }
    setStreaming(null);
    if (inputVideoRef.current) inputVideoRef.current.value = "";
    if (videoRef.current) videoRef.current.style.display = "none";
    
    // 清除畫布
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };
  
  // 更新效能指標
  const updateMetrics = (inferenceTime, fps = 0) => {
    console.log("Metrics updated:", inferenceTime, fps);
    setMetrics({ inferenceTime, fps });
  };
  
  // 執行偵測
  const handleDetect = () => {
    if (!imageRef.current || !canvasRef.current) {
      console.error("Image or canvas reference not available");
      return;
    }
    
    console.log("Starting detection...");
    setIsDetecting(true);
    
    if (streaming === "image") {
      detect(imageRef.current, model, canvasRef.current, () => {
        console.log("Detection completed");
        setIsDetecting(false);
      }, updateMetrics);
    }
  };

  // 拖放處理函數
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    console.log("File dropped");

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log("File type:", file.type);
      
      const type = file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : null;

      if (type === 'image') {
        console.log("Processing image file");
        if (streaming === "video") closeVideo();
        if (streaming === "camera" && cameraRef.current) {
          webcam.close(cameraRef.current);
          cameraRef.current.style.display = "none";
        }

        handleImageFile(file);
      } else if (type === 'video' && videoRef.current) {
        console.log("Processing video file");
        if (streaming === "image") closeImage();
        if (streaming === "camera" && cameraRef.current) {
          webcam.close(cameraRef.current);
          cameraRef.current.style.display = "none";
        }

        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
        videoRef.current.addEventListener("ended", () => closeVideo());
        videoRef.current.style.display = "block";
        setStreaming("video");
      } else {
        console.error("Unsupported file type or references not available");
      }
    }
  };

  // 新增：處理圖片文件
  const handleImageFile = (file) => {
    try {
      // 清除任何以前的圖片URL
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      // 創建新的URL並保存
      const newUrl = URL.createObjectURL(file);
      console.log("New image URL created:", newUrl);
      setImageUrl(newUrl);
      setStreaming("image");
    } catch (error) {
      console.error("Error handling image file:", error);
    }
  };

  // 全螢幕功能
  const toggleFullscreen = () => {
    if (!displayContainerRef.current) return;
    
    if (!isFullscreen) {
      if (displayContainerRef.current.requestFullscreen) {
        displayContainerRef.current.requestFullscreen();
      } else if (displayContainerRef.current.mozRequestFullScreen) { // Firefox
        displayContainerRef.current.mozRequestFullScreen();
      } else if (displayContainerRef.current.webkitRequestFullscreen) { // Chrome, Safari
        displayContainerRef.current.webkitRequestFullscreen();
      } else if (displayContainerRef.current.msRequestFullscreen) { // IE/Edge
        displayContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // 監聽全螢幕變化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // 分割線調整功能
  useEffect(() => {
    if (!resizerRef.current) return;
    
    const resizer = resizerRef.current;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    
    const startResize = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = panelWidth;
      document.body.classList.add('resizing');
      resizer.classList.add('resizing');
    };
    
    const doResize = (e) => {
      if (!isResizing) return;
      
      const newWidth = startWidth + (e.clientX - startX);
      // 設置最小和最大值
      if (newWidth >= 250 && newWidth <= 500) {
        setPanelWidth(newWidth);
        resizer.style.left = `${newWidth}px`;
      }
    };
    
    const endResize = () => {
      isResizing = false;
      document.body.classList.remove('resizing');
      resizer.classList.remove('resizing');
    };
    
    resizer.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', endResize);
    
    return () => {
      resizer.removeEventListener('mousedown', startResize);
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, [panelWidth]);
  
  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyPress = (e) => {
      // ESC 鍵關閉當前顯示的內容
      if (e.key === 'Escape') {
        if (streaming === "image") closeImage();
        else if (streaming === "video") closeVideo();
        else if (streaming === "camera" && cameraRef.current) {
          webcam.close(cameraRef.current);
          cameraRef.current.style.display = "none";
          setStreaming(null);
          
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }
      
      // 1, 2, 3 鍵可以快速選擇輸入源
      if (e.key === '1' && inputImageRef.current) inputImageRef.current.click();
      if (e.key === '2' && inputVideoRef.current) inputVideoRef.current.click();
      if (e.key === '3' && streaming !== "camera" && cameraRef.current) {
        if (streaming === "image") closeImage();
        if (streaming === "video") closeVideo();
        
        webcam.open(cameraRef.current);
        cameraRef.current.style.display = "block";
        setStreaming("camera");
      }
      
      // Space 鍵可以在圖片模式下啟動識別
      if (e.key === ' ' && streaming === "image" && !isDetecting) {
        handleDetect();
      }
      
      // F 鍵可以切換全螢幕
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [streaming, isDetecting]);
  
  // 確保在組件卸載時釋放資源
  useEffect(() => {
    return () => {
      if (streaming === "camera" && cameraRef.current) {
        webcam.close(cameraRef.current);
      }
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [streaming, imageUrl]);
  
  // 印出階段資訊用於除錯
  useEffect(() => {
    console.log("Current streaming state:", streaming);
    console.log("Current image URL:", imageUrl);
  }, [streaming, imageUrl]);
  
  // 圖片載入效果
  useEffect(() => {
    if (streaming === "image" && imageUrl && imageRef.current) {
      console.log("Setting image src:", imageUrl);
      
      // 確保圖片元素可見
      imageRef.current.style.display = "block";
      imageRef.current.src = imageUrl;
      
      // 初始化畫布
      if (canvasRef.current) {
        canvasRef.current.style.display = "block";
      }
    }
  }, [streaming, imageUrl]);
  
  // 當圖片加載完成後自動進行檢測
  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imageRef.current?.src);
    // In handleImageLoad in ObjectDetectionPage.jsx
    console.log("Image dimensions:", imageRef.current.width, imageRef.current.height);
    console.log("Canvas dimensions:", canvasRef.current.width, canvasRef.current.height);
    
    if (imageRef.current && canvasRef.current) {
    // Get the natural (original) dimensions of the image
    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;
      
    // Calculate how the image will be displayed (without scaling up)
    const containerWidth = contentRef.current.clientWidth;
    const containerHeight = contentRef.current.clientHeight;
      
    // Calculate the display scale (capped at 1.0 to prevent upscaling)
    const displayScale = Math.min(
      containerWidth * 0.9 / naturalWidth,
      containerHeight * 0.9 / naturalHeight,
      1.0
    );
    
    // Calculate actual displayed dimensions
    const displayWidth = Math.round(naturalWidth * displayScale);
    const displayHeight = Math.round(naturalHeight * displayScale);
    
    console.log(`Original dimensions: ${naturalWidth}x${naturalHeight}`);
    console.log(`Display dimensions: ${displayWidth}x${displayHeight}`);
    
    // Set image to exact dimensions
    imageRef.current.style.width = `${displayWidth}px`;
    imageRef.current.style.height = `${displayHeight}px`;
    imageRef.current.style.maxWidth = 'none';
    imageRef.current.style.maxHeight = 'none';
    
    // Set canvas to match exactly the image dimensions - this is critical
        canvasRef.current.width = displayWidth;
        canvasRef.current.height = displayHeight;
        
    // Position canvas exactly over the image
        const imageRect = imageRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        canvasRef.current.style.position = "absolute";
        canvasRef.current.style.left = `${imageRect.left - contentRect.left}px`;
        canvasRef.current.style.top = `${imageRect.top - contentRect.top}px`;
        canvasRef.current.style.width = `${displayWidth}px`;
        canvasRef.current.style.height = `${displayHeight}px`;
        
    const detectWithCorrectRatios = () => {
    // Calculate the display scale factor relative to the original image
    const displayScaleX = displayWidth / naturalWidth;
    const displayScaleY = displayHeight / naturalHeight;
    
    detect(
      imageRef.current, 
      model, 
      canvasRef.current, 
      () => {
        console.log("Detection completed with correct scaling");
        setIsDetecting(false);
      }, 
      updateMetrics,
      displayScaleX  // Pass this as the displayRatio parameter
    );
  };
    
    detectWithCorrectRatios();
  }
};
  
  return (
    <div className="detection-container">
      <header className="detection-header">
        <h1>物件識別測試</h1>
        <div className="header-actions">
          <div className="shortcut-hint">按 F1 顯示快捷鍵幫助</div>
          <button className="return-button" onClick={onReturnHome}>返回主頁</button>
        </div>
      </header>
      
      <div className="detection-main">
        <div className="detection-panel" style={{ width: `${panelWidth}px` }}>
          <div className="panel-header">
            <h2>選擇輸入來源</h2>
          </div>
          
          <div className="input-methods">
            <div className={`input-method ${streaming === 'image' ? 'active' : ''}`}>
              <div className="method-icon">🖼️</div>
              <div className="method-content">
                <h3>圖片識別 <span className="shortcut-badge">1</span></h3>
                <p>上傳圖片進行物件識別</p>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    console.log("Image input changed");
                    if (e.target.files.length > 0) {
                      const file = e.target.files[0];
                      console.log("Processing selected image file:", file.name);
                      
                      // 如果其他串流正在進行，先關閉
                      if (streaming === "video") closeVideo();
                      if (streaming === "camera" && cameraRef.current) {
                        webcam.close(cameraRef.current);
                        cameraRef.current.style.display = "none";
                      }
                      
                      handleImageFile(file);
                    }
                  }}
                  ref={inputImageRef}
                />
                <button 
                  className="method-button tooltip" 
                  onClick={() => {
                    if (streaming !== "image" && inputImageRef.current) {
                      console.log("Triggering image selection");
                      inputImageRef.current.click();
                    } else {
                      console.log("Closing image");
                      closeImage();
                    }
                  }}
                >
                  {streaming === "image" ? "取消" : "選擇圖片"}
                  <span className="tooltip-text">選擇圖片或直接拖放到右側區域</span>
                </button>
              </div>
            </div>
            
            <div className={`input-method ${streaming === 'video' ? 'active' : ''}`}>
              <div className="method-icon">🎬</div>
              <div className="method-content">
                <h3>影片識別 <span className="shortcut-badge">2</span></h3>
                <p>上傳影片進行物件識別</p>
                <input
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    console.log("Video input changed");
                    if (e.target.files.length > 0 && videoRef.current) {
                      // 如果其他串流正在進行，先關閉
                      if (streaming === "image") closeImage();
                      if (streaming === "camera" && cameraRef.current) {
                        webcam.close(cameraRef.current);
                        cameraRef.current.style.display = "none";
                      }
                      
                      const url = URL.createObjectURL(e.target.files[0]);
                      videoRef.current.src = url;
                      videoRef.current.addEventListener("ended", () => closeVideo());
                      videoRef.current.style.display = "block";
                      setStreaming("video");
                    }
                  }}
                  ref={inputVideoRef}
                />
                <button 
                  className="method-button tooltip" 
                  onClick={() => {
                    if (streaming !== "video" && inputVideoRef.current) {
                      inputVideoRef.current.click();
                    } else {
                      closeVideo();
                    }
                  }}
                >
                  {streaming === "video" ? "取消" : "選擇影片"}
                  <span className="tooltip-text">選擇影片或直接拖放到右側區域</span>
                </button>
              </div>
            </div>
            
            <div className={`input-method ${streaming === 'camera' ? 'active' : ''}`}>
              <div className="method-icon">📹</div>
              <div className="method-content">
                <h3>攝影機識別 <span className="shortcut-badge">3</span></h3>
                <p>使用網路攝影機進行即時物件識別</p>
                <button 
                  className="method-button tooltip"
                  onClick={() => {
                    if (streaming !== "camera" && cameraRef.current) {
                      // 如果其他串流正在進行，先關閉
                      if (streaming === "image") closeImage();
                      if (streaming === "video") closeVideo();
                      
                      webcam.open(cameraRef.current);
                      cameraRef.current.style.display = "block";
                      setStreaming("camera");
                    } else if (cameraRef.current) {
                      webcam.close(cameraRef.current);
                      cameraRef.current.style.display = "none";
                      setStreaming(null);
                      
                      // 清除畫布
                      if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext("2d");
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                      }
                    }
                  }}
                >
                  {streaming === "camera" ? "關閉攝影機" : "開啟攝影機"}
                  <span className="tooltip-text">開啟或關閉網路攝影機</span>
                </button>
              </div>
            </div>
          </div>
          
          {streaming && (
            <div className="detection-controls">
              <div className="model-selector">
                <label htmlFor="model-selector">選擇識別模型</label>
                <select 
                  id="model-selector" 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="通用物件模型 (預設)">通用物件模型 (預設)</option>
                  {trainedModels && trainedModels.map((m, index) => (
                    <option key={index} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              {streaming === "image" && (
                <button 
                  className="detect-button tooltip" 
                  onClick={handleDetect}
                  disabled={isDetecting}
                >
                  {isDetecting ? "識別中..." : "開始識別"}
                  <span className="tooltip-text">按空格鍵也可以開始識別</span>
                </button>
              )}
            </div>
          )}
          
          {streaming && (
            <div className="metrics-panel">
              <div className="metric-item">
                <div className="metric-label">推論時間</div>
                <div className="metric-value">{metrics.inferenceTime.toFixed(2)} ms</div>
              </div>
              {(streaming === "video" || streaming === "camera") && (
                <div className="metric-item">
                  <div className="metric-label">每秒幀數</div>
                  <div className="metric-value">{metrics.fps.toFixed(1)} FPS</div>
                </div>
              )}
            </div>
          )}
          
          <div className="keyboard-shortcuts">
            <h3>鍵盤快捷鍵:</h3>
            <div className="shortcut-list">
              <div className="key-combo">1</div>
              <div className="key-description">上傳圖片</div>
              
              <div className="key-combo">2</div>
              <div className="key-description">上傳影片</div>
              
              <div className="key-combo">3</div>
              <div className="key-description">開啟/關閉攝影機</div>
              
              <div className="key-combo">Space</div>
              <div className="key-description">圖片模式下開始識別</div>
              
              <div className="key-combo">F</div>
              <div className="key-description">切換全螢幕</div>
              
              <div className="key-combo">Esc</div>
              <div className="key-description">關閉當前顯示內容</div>
            </div>
          </div>
        </div>
        
        <div className="resizer" ref={resizerRef}></div>
        
        <div className="detection-display">
          <div 
            ref={displayContainerRef}
            className={`display-container ${isDragging ? 'dragging' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!streaming ? (
              <div className="placeholder">
                <div className="placeholder-icon">🔍</div>
                <p>請選擇左側的輸入來源以開始識別</p>
                <p className="drop-hint">或直接拖放圖片/影片文件到此處</p>
              </div>
            ) : (
              <div 
                ref={contentRef} 
                className="content"
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%", 
                  height: "100%",
                  overflow: "hidden"
                }}
              >
                {streaming === "image" && (
                  <img
                    ref={imageRef}
                    src={imageUrl || "#"}
                    alt="偵測圖片"
                    onLoad={handleImageLoad}
                    style={{
                      display: imageUrl ? "block" : "none",   
                    }}
                  />
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  style={{ 
                    display: streaming === "video" ? "block" : "none",
                    maxWidth: "90%", 
                    maxHeight: "90%"
                  }}
                  onPlay={() => {
                    console.log("Video started playing");
                    if (videoRef.current && canvasRef.current) {
                      detectVideo(videoRef.current, model, canvasRef.current, updateMetrics);
                    }
                  }}
                />
                
                <video
                  ref={cameraRef}
                  autoPlay
                  muted
                  style={{ 
                    display: streaming === "camera" ? "block" : "none",
                    maxWidth: "90%", 
                    maxHeight: "90%"
                  }}
                  onPlay={() => {
                    console.log("Camera started streaming");
                    if (cameraRef.current && canvasRef.current) {
                      detectVideo(cameraRef.current, model, canvasRef.current, updateMetrics);
                    }
                  }}
                />
                
                <canvas 
                  ref={canvasRef} 
                  style={{
                    position: "absolute",
                    pointerEvents: "none",
                    zIndex: 10
                  }}
                />
              </div>
            )}
            
            {isDragging && (
              <div className="drop-overlay">
                <div className="drop-icon">📥</div>
                <div className="drop-message">釋放文件以上傳</div>
              </div>
            )}
            
            <button className="fullscreen-button" onClick={toggleFullscreen}>
              {isFullscreen ? '離開全螢幕' : '全螢幕顯示'}
            </button>
          </div>
        </div>
      </div>
      
      {/* 調試信息 */}
      {imageUrl && (
        <div style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 9999
        }}>
          已載入圖片: {imageUrl.substring(0, 30)}...
        </div>
      )}
    </div>
  );
};

export default ObjectDetectionPage;
