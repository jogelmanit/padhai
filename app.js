const video = document.getElementById("video");
const audio = document.getElementById("alertSound");

let model;
let isPlaying = false;

// Start webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  video.srcObject = stream;
}

// Load AI model
async function loadModel() {
  model = await cocoSsd.load();
  console.log("Model Loaded");
}

// Detect objects
async function detect() {
  const predictions = await model.detect(video);

  let phoneDetected = false;

  predictions.forEach(pred => {
    if (pred.class === "cell phone" && pred.score > 0.6) {
      phoneDetected = true;
    }
  });

  if (phoneDetected) {
    if (!isPlaying) {
      audio.play();
      isPlaying = true;
    }
  } else {
    isPlaying = false;
  }

  requestAnimationFrame(detect);
}

// Main
async function main() {
  await setupCamera();
  await loadModel();
  detect();
}

main();
