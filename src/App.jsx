import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // 設定後端為 webgl
import Loader from "./components/loader";
import "./style/App.css";
import WelcomePage from "./components/WelcomePage";
import UserInfoPage from "./components/UserInfoPage";
import DashboardPage from "./components/DashboardPage";
import TrainingFlowPage from "./components/TrainingFlowPage";
import ObjectDetectionPage from "./components/ObjectDetectionPage";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // 載入狀態
  const [currentPage, setCurrentPage] = useState("welcome"); // 當前頁面
  const [userName, setUserName] = useState(""); // 用戶名稱
  const [userClass, setUserClass] = useState(""); // 班級學號
  const [trainedModels, setTrainedModels] = useState([]); // 訓練過的模型列表
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // 初始化模型和輸入形狀

  // 加載模型
  useEffect(() => {
    tf.ready().then(async () => {
      const modelName = "yolov8n";
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions });
          },
        }
      );

      // 模型預熱
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      });

      tf.dispose([warmupResults, dummyInput]);
    });
  }, []);

  // 頁面導航函數
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // 添加訓練好的模型
  const addTrainedModel = (modelName) => {
    setTrainedModels([...trainedModels, { name: modelName, date: new Date() }]);
  };

  // 渲染當前頁面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "welcome":
        return <WelcomePage onStart={() => navigateTo("userInfo")} />;
      case "userInfo":
        return (
          <UserInfoPage 
            onSubmit={(name, classId) => {
              setUserName(name);
              setUserClass(classId);
              navigateTo("dashboard");
            }} 
          />
        );
      case "dashboard":
        return (
          <DashboardPage 
            userName={userName}
            onTrainModel={() => navigateTo("training")}
            onDetectObject={() => navigateTo("detection")}
          />
        );
      case "training":
        return (
          <TrainingFlowPage 
            onTrainingComplete={(modelName) => {
              addTrainedModel(modelName);
              navigateTo("detection");
            }}
            onReturnHome={() => navigateTo("dashboard")}
          />
        );
      case "detection":
        return (
          <ObjectDetectionPage 
            model={model}
            trainedModels={trainedModels}
            onReturnHome={() => navigateTo("dashboard")}
          />
        );
      default:
        return <WelcomePage onStart={() => navigateTo("userInfo")} />;
    }
  };

  return (
    <div className="App">
      {loading.loading && <Loader>載入模型中... {(loading.progress * 100).toFixed(2)}%</Loader>}
      {!loading.loading && renderCurrentPage()}
    </div>
  );
};

export default App;