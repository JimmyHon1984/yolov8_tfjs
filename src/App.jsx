import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detect, detectVideo } from "./utils/detect";
import "./style/App.css";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [downloadTime, setDownloadTime] = useState(null); // download time state
  const [metrics, setMetrics] = useState({ inferenceTime: 0, fps: 0 }); // metrics state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // model configs
  const modelName = "best";

  useEffect(() => {
    tf.ready().then(async () => {
      // Record start time before loading the model
      const startTime = performance.now();
      
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // Record end time after loading the model
      const endTime = performance.now();
      // Calculate download time in milliseconds
      const timeInMs = endTime - startTime;
      setDownloadTime(timeInMs);

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  // Function to update metrics
  const updateMetrics = (inferenceTime, fps = 0) => {
    setMetrics({ inferenceTime, fps });
  };

  return (
    <div className="App">
      {loading.loading && <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>}
      <div className="header">
        <h1>📷 YOLOv8 Live Detection App</h1>
        <p>
          YOLOv8 live detection application on browser powered by <code>tensorflow.js</code>
        </p>
        <p>
          Serving : <code className="code">{modelName}</code>
        </p>
        {/* Display the download time if available */}
        {downloadTime !== null && (
          <p>
            Model download time: <code className="code">{downloadTime.toFixed(2)}ms</code> ({(downloadTime / 1000).toFixed(2)} seconds)
          </p>
        )}
        {/* Display performance metrics */}
        <div className="metrics">
          <p>
            Inference time: <code className="code">{metrics.inferenceTime.toFixed(2)}ms</code>
          </p>
          <p>
            Frame rate: <code className="code">{metrics.fps}</code> FPS
          </p>
        </div>
      </div>

      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={() => detect(imageRef.current, model, canvasRef.current, null, updateMetrics)}
        />
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={() => detectVideo(cameraRef.current, model, canvasRef.current, updateMetrics)}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, canvasRef.current, updateMetrics)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>

      <ButtonHandler imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} />
    </div>
  );
};

export default App;