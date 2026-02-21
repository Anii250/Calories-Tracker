/* ============================================================
   CameraCapture Component — phone camera for food scanning
   ============================================================ */

function CameraCapture() {
    return `
    <div class="camera-capture" id="camera-capture">
      <video id="camera-video" class="camera-capture__video" autoplay playsinline style="display:none;"></video>
      <canvas id="camera-canvas" class="camera-capture__canvas" style="display:none;"></canvas>
      <img id="camera-preview" class="camera-capture__preview" style="display:none;" alt="Captured photo" />
      <div class="camera-capture__controls" id="camera-controls">
        <button class="btn btn-primary" onclick="startCamera()" id="btn-start-camera">
          📸 Open Camera
        </button>
        <button class="btn btn-outline" onclick="capturePhoto()" id="btn-capture" style="display:none;">
          Take Photo
        </button>
        <button class="btn btn-outline" onclick="retakePhoto()" id="btn-retake" style="display:none;">
          ↩️ Retake
        </button>
      </div>
    </div>
  `;
}

let cameraStream = null;

function startCamera() {
    const video = document.getElementById('camera-video');
    const btnStart = document.getElementById('btn-start-camera');
    const btnCapture = document.getElementById('btn-capture');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera is not available on this device/browser.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
            video.style.display = 'block';
            btnStart.style.display = 'none';
            btnCapture.style.display = 'inline-flex';
        })
        .catch(err => {
            console.log('Camera error:', err);
            alert('Could not access camera. Please allow camera permission.');
        });
}

function capturePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('camera-preview');
    const btnCapture = document.getElementById('btn-capture');
    const btnRetake = document.getElementById('btn-retake');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    preview.src = imageData;
    preview.style.display = 'block';
    video.style.display = 'none';

    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }

    btnCapture.style.display = 'none';
    btnRetake.style.display = 'inline-flex';
}

function retakePhoto() {
    const preview = document.getElementById('camera-preview');
    const btnRetake = document.getElementById('btn-retake');

    preview.style.display = 'none';
    btnRetake.style.display = 'none';
    startCamera();
}
