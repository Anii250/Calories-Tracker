/* ============================================================
   CameraCapture Component — phone camera for food scanning
   ============================================================ */

function CameraCapture() {
  return `
    <div class="camera-capture" id="camera-capture">
      <!-- Media Elements -->
      <video id="camera-video" class="camera-capture__video" autoplay playsinline style="display:none;"></video>
      <canvas id="camera-canvas" class="camera-capture__canvas" style="display:none;"></canvas>
      <img id="camera-preview" class="camera-capture__preview" style="display:none;" alt="Captured photo" />
      
      <!-- Placeholder Viewfinder (shows when camera is off) -->
      <div id="camera-placeholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:280px; border:2.5px dashed var(--gray-300); border-radius:var(--radius-lg); margin-bottom:24px; background:rgba(128,128,128,0.05);">
        <div style="font-size: 3.5rem; margin-bottom: 12px; opacity: 0.9;">🍽️</div>
        <div style="color:var(--text-muted); font-weight:600; font-size:1.1rem;">Camera Inactive</div>
      </div>

      <!-- Controls -->
      <div class="camera-capture__controls" id="camera-controls" style="display:flex; flex-direction:column; gap:12px;">
        
        <div id="camera-instructions" style="text-align:center; padding: 0 10px; margin-bottom: 8px;">
          <p style="color: var(--text-primary); font-size: 0.95rem; font-weight:500; margin:0; line-height:1.4;">Snap a photo of your food to automatically track its calories and macros.</p>
        </div>

        <button class="btn btn-primary" onclick="startCamera()" id="btn-start-camera" style="width:100%; padding:14px; font-size:1rem;">
          📸 Open Camera
        </button>
        <button class="btn btn-outline" onclick="uploadFromGallery()" id="btn-upload-gallery" style="width:100%; padding:14px; font-size:1rem; border-width:2px;">
          🖼️ Upload from Gallery
        </button>

        <button class="btn btn-outline" onclick="capturePhoto()" id="btn-capture" style="display:none; width:100%; padding:14px; border-width:2px; color:var(--accent); border-color:var(--accent);">
          Take Photo
        </button>
        <button class="btn btn-outline" onclick="retakePhoto()" id="btn-retake" style="display:none; width:100%; padding:14px; border-width:2px;">
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
  const placeholder = document.getElementById('camera-placeholder');
  const instructions = document.getElementById('camera-instructions');
  const btnGallery = document.getElementById('btn-upload-gallery');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Camera is not available on this device/browser.');
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      cameraStream = stream;
      video.srcObject = stream;
      
      // Toggle UI for active camera
      placeholder.style.display = 'none';
      instructions.style.display = 'none';
      btnGallery.style.display = 'none';
      btnStart.style.display = 'none';
      
      video.style.display = 'block';
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

  // Trigger processing
  if (typeof processScannedImage === 'function') {
    processScannedImage();
  }
}

function uploadFromGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById('camera-preview');
      preview.src = event.target.result;
      preview.style.display = 'block';
      
      // Update UI state
      document.getElementById('camera-placeholder').style.display = 'none';
      document.getElementById('btn-start-camera').style.display = 'none';
      document.getElementById('btn-upload-gallery').style.display = 'none';
      document.getElementById('camera-instructions').style.display = 'none';
      document.getElementById('btn-retake').style.display = 'inline-flex';
      
      // Trigger processing immediately on upload
      if (typeof processScannedImage === 'function') {
        processScannedImage();
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function retakePhoto() {
  const preview = document.getElementById('camera-preview');
  const btnRetake = document.getElementById('btn-retake');
  const scannerResult = document.getElementById('scanner-result');
  const scannerLoader = document.getElementById('scanner-loader');

  preview.style.display = 'none';
  btnRetake.style.display = 'none';
  
  if (scannerResult) scannerResult.style.display = 'none';
  if (scannerLoader) scannerLoader.style.display = 'none';

  // Reset to default starting view state instead of forcing camera auto-start
  document.getElementById('camera-placeholder').style.display = 'flex';
  document.getElementById('camera-instructions').style.display = 'block';
  document.getElementById('btn-start-camera').style.display = 'inline-flex';
  document.getElementById('btn-upload-gallery').style.display = 'inline-flex';
}
