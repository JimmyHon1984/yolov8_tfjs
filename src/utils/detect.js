import * as tf from "@tensorflow/tfjs";
import { renderBoxes } from "./renderBox";
import labels from "./labels.json";

const numClass = labels.length;

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
// At the beginning of the preprocess function, add this modification
const preprocess = (source, modelWidth, modelHeight, displayRatio = 1.0) => {
  let xRatio, yRatio; // ratios for boxes

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source);

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2); // get source width and height
    const maxSize = Math.max(w, h); // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0],
    ]);

    // Calculate ratios properly accounting for display dimensions
    xRatio = (maxSize / w) * displayRatio; 
    yRatio = (maxSize / h) * displayRatio;

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0); // add batch
  });

  return [input, xRatio, yRatio];
};

/**
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {Function} callback function to run after detection process
 * @param {Function} updateMetrics function to update metrics data
 */
export const detect = async (source, model, canvasRef, callback = () => {}, updateMetrics = null, displayRatio = 1.0) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  // Start timing the inference
  const inferenceStartTime = performance.now();
  
  tf.engine().startScope(); // start scoping tf enginef
  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight, displayRatio); // preprocess image

  const res = model.net.execute(input); // inference model
  const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
    return tf
      .concat(
        [
          y1,
          x1,
          tf.add(y1, h), //y2
          tf.add(x1, w), //x2
        ],
        2
      )
      .squeeze();
  }); // process boxes [y1, x1, y2, x2]

  const [scores, classes] = tf.tidy(() => {
    // class scores
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
    return [rawScores.max(1), rawScores.argMax(1)];
  }); // get max scores and classes index

  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes

  const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
  const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
  const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index
  // In detect.js, before calling renderBoxes
  console.log("Bounding box data:", boxes_data);
  console.log("Ratios:", xRatio, yRatio);
  renderBoxes(canvasRef, boxes_data, scores_data, classes_data, [xRatio, yRatio]); // render boxes
  tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory

  // End timing the inference
  const inferenceTime = performance.now() - inferenceStartTime;
  
  // If updateMetrics function is provided, call it with the inference time
  if (updateMetrics) {
    updateMetrics(inferenceTime);
  }

  callback();

  tf.engine().endScope(); // end of scoping
};

// Variables to track FPS calculation
let frameCount = 0;
let lastFPSUpdateTime = 0;
let currentFPS = 0;

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {Function} updateMetrics function to update metrics data
 */
export const detectVideo = (vidSource, model, canvasRef, updateMetrics = null) => {
  // Reset FPS tracking variables when starting a new video detection
  frameCount = 0;
  lastFPSUpdateTime = performance.now();
  currentFPS = 0;
  
  /**
   * Function to detect every frame from video
   */
  const detectFrame = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      return; // handle if source is closed
    }

    // Update FPS calculation
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFPSUpdateTime;
    
    // Update FPS every half second
    if (elapsed > 500) {
      currentFPS = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastFPSUpdateTime = now;
    }

    // Pass the FPS to the updateMetrics function
    const updateFrameMetrics = (inferenceTime) => {
      if (updateMetrics) {
        updateMetrics(inferenceTime, currentFPS);
      }
    };

    detect(vidSource, model, canvasRef, () => {
      requestAnimationFrame(detectFrame); // get another frame
    }, updateFrameMetrics);
  };

  detectFrame(); // initialize to detect every frame
};