const webcam = document.getElementById("webcam");
const alertBox = document.getElementById("alertBox");
const alertVideo = document.getElementById("alertVideo");
const closeBtn = document.getElementById("closeBtn");

let model;
let alertShown = false;

// Start webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  webcam.srcObject = stream;
}

// Load model
async function loadModel() {
  model = await cocoSsd.load();
  console.log("Model Loaded");
}

// Detection loop
async function detect() {
  const predictions = await model.detect(webcam);

  let phoneDetected = false;

  predictions.forEach(p => {
    if (p.class === "cell phone" && p.score > 0.6) {
      phoneDetected = true;
    }
  });

  // If phone detected → show video
  if (phoneDetected && !alertShown) {
    showAlert();
  }

  requestAnimationFrame(detect);
}

// Show alert
function showAlert() {
  alertShown = true;
  alertBox.style.display = "flex";
  alertVideo.play();
}

// Close alert
closeBtn.onclick = () => {
  alertBox.style.display = "none";
  alertVideo.pause();
  alertVideo.currentTime = 0;
  alertShown = false;
};

// Start everything
async function main() {
  await setupCamera();
  await loadModel();
  detect();
}

main();
