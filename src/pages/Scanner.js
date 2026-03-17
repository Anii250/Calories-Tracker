/* ============================================================
   Scanner Page — Food scanner with camera & real API data
   ============================================================ */

let currentScannedFood = null;
let scannerQty = 1;

function ScannerPage() {
  return `
    <div class="page" id="scanner-page">
      <div class="page-header">
        <button class="page-header__icon" onclick="Router.navigate('diary')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-header__title">Scanner</div>
        <div style="width:36px;"></div>
      </div>

      <!-- Camera Capture Component -->
      ${CameraCapture()}

      <!-- Analysis Loader -->
      <div class="scanner-loader" id="scanner-loader" style="display:none; text-align:center; padding: 40px 20px;">
        <div class="splash__logo" style="font-size:3rem; margin-bottom:12px;">🔍</div>
        <h3 style="margin-bottom:8px;">Analyzing Food...</h3>
        <p class="text-muted">Using computer vision & Nutrition API</p>
        <div class="splash__dots" style="margin-top:16px;">
          <span style="background:var(--accent);"></span>
          <span style="background:var(--accent);"></span>
          <span style="background:var(--accent);"></span>
        </div>
      </div>

      <!-- Scan Result Details -->
      <div class="food-detail" id="scanner-result" style="display:none; margin-top: 20px;">
        <div class="allergen-alert" id="scanner-alert" style="display:none;">
          <div class="allergen-alert__title">ℹ️ Source: Internet Database</div>
          <div class="allergen-alert__text" id="scanner-source">Real nutrition data fetched from CalorieNinjas API.</div>
        </div>

        <div class="food-detail__name" id="scanner-name">...</div>
        <div class="food-detail__qty">
          <button class="qty-btn" onclick="updateScannerQty(-1)">−</button>
          <span class="qty-value" id="scanner-qty">1</span>
          <button class="qty-btn" onclick="updateScannerQty(1)">+</button>
        </div>
        
        <div id="scanner-macros">
          ${MacroBar(0, 0, 0, 0)}
        </div>
        
        <div class="food-detail__composition" id="scanner-composition" style="margin-top:20px;">
          <!-- Serving info goes here -->
        </div>

        <button class="btn btn-primary" id="btn-add-scanned" style="width:100%;margin-top:18px;" onclick="addScannedFood()">Add to Diary</button>
      </div>
    </div>
    ${NavBar('scanner')}
  `;
}

// Called by CameraCapture.js when a photo is taken
async function processScannedImage() {
  document.getElementById('scanner-loader').style.display = 'block';
  document.getElementById('scanner-result').style.display = 'none';

  let recognizedName = 'Apple'; // Fallback if AI fails

  try {
    // 1. Load TensorFlow.js & MobileNet dynamically if needed
    if (!window.mobilenetModel) {
      document.querySelector('#scanner-loader h3').textContent = 'Loading AI Model...';
      document.querySelector('#scanner-loader .text-muted').textContent = 'First time takes a few seconds';

      if (typeof mobilenet === 'undefined') {
        await new Promise((resolve, reject) => {
          const script1 = document.createElement('script');
          script1.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest';
          script1.onload = () => {
            const script2 = document.createElement('script');
            script2.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@latest';
            script2.onload = resolve;
            script2.onerror = reject;
            document.head.appendChild(script2);
          };
          script1.onerror = reject;
          document.head.appendChild(script1);
        });
      }
      
      window.mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    }

    document.querySelector('#scanner-loader h3').textContent = 'Analyzing Food...';
    document.querySelector('#scanner-loader .text-muted').textContent = 'Using computer vision & Nutrition API';

    // 2. Classify the image using the camera preview element
    const imgEl = document.getElementById('camera-preview');
    const predictions = await window.mobilenetModel.classify(imgEl);
    console.log("AI Predictions:", predictions);

    if (predictions && predictions.length > 0) {
      // e.g. "Granny Smith, apple" -> "apple"
      // e.g. "cheeseburger, hamburger, burger" -> "cheeseburger"
      recognizedName = predictions[0].className.split(',')[0].trim();
    }

    // 3. Fetch REAL nutrition data from API based on the recognized food
    const results = await NutritionAPI.searchFood(recognizedName);

    document.getElementById('scanner-loader').style.display = 'none';

    if (results && results.length > 0) {
      currentScannedFood = results[0]; // Take top result
      currentScannedFood.name = recognizedName; // Use the AI's short name
      scannerQty = 1;
      renderScannerResult();
    } else {
      showScannerError(recognizedName);
    }
  } catch (err) {
    document.getElementById('scanner-loader').style.display = 'none';
    showScannerError(null);
  }
}

function showScannerError(recognizedName) {
  const loader = document.getElementById('scanner-loader');
  if (loader) loader.style.display = 'none';
  // Show a friendly error in the result panel
  const resultEl = document.getElementById('scanner-result');
  resultEl.style.display = 'block';
  document.getElementById('scanner-alert').style.display = 'block';
  document.getElementById('scanner-source').textContent = recognizedName
    ? `Detected "${recognizedName}" but could not find nutritional data. Try retaking with better lighting or a clearer angle.`
    : 'Could not analyze the image. Please check your internet connection and try again.';
  document.getElementById('scanner-name').textContent = recognizedName || '❌ Scan Failed';
  document.getElementById('scanner-macros').innerHTML = MacroBar(0, 0, 0, 0);
  document.getElementById('scanner-composition').innerHTML = '';
  document.getElementById('btn-add-scanned').style.display = 'none';
}

function renderScannerResult() {
  if (!currentScannedFood) return;

  document.getElementById('scanner-result').style.display = 'block';
  document.getElementById('scanner-alert').style.display = 'block';
  document.getElementById('btn-add-scanned').style.display = ''; // Ensure button is visible

  const srcString = currentScannedFood.source === 'calorieninjas' ? 'CalorieNinjas API' : 'OpenFoodFacts API';
  document.getElementById('scanner-source').textContent = `Real nutrition data fetched from ${srcString}.`;

  document.getElementById('scanner-name').textContent = currentScannedFood.name.charAt(0).toUpperCase() + currentScannedFood.name.slice(1);
  updateScannerQty(0); // Update multiplier

  document.getElementById('scanner-composition').innerHTML = `
    <h4>Details:</h4>
    <div class="composition-row" style="margin-top:8px;">
      <span>Serving Size</span>
      <span>${currentScannedFood.serving}</span>
    </div>
    <div class="composition-row">
      <span>Fiber</span>
      <span>${(currentScannedFood.fiber * scannerQty).toFixed(1)}g</span>
    </div>
    <div class="composition-row">
      <span>Sugar</span>
      <span>${(currentScannedFood.sugar * scannerQty).toFixed(1)}g</span>
    </div>
  `;
}

function updateScannerQty(delta) {
  if (!currentScannedFood) return;
  scannerQty = Math.max(1, scannerQty + delta);
  document.getElementById('scanner-qty').textContent = scannerQty;

  const cal = Math.round(currentScannedFood.calories * scannerQty);
  const p = parseFloat((currentScannedFood.proteins * scannerQty).toFixed(1));
  const f = parseFloat((currentScannedFood.fats * scannerQty).toFixed(1));
  const c = parseFloat((currentScannedFood.carbs * scannerQty).toFixed(1));

  document.getElementById('scanner-macros').innerHTML = MacroBar(cal, p, f, c);
  renderScannerResult(); // Update fiber/sugar text
}

function addScannedFood() {
  if (!currentScannedFood) return;

  const cal = Math.round(currentScannedFood.calories * scannerQty);
  const p = parseFloat((currentScannedFood.proteins * scannerQty).toFixed(1));
  const f = parseFloat((currentScannedFood.fats * scannerQty).toFixed(1));
  const c = parseFloat((currentScannedFood.carbs * scannerQty).toFixed(1));

  Store.addMeal(getMealTypeByTime(), { // Auto-detect meal type by time of day
    name: currentScannedFood.name.charAt(0).toUpperCase() + currentScannedFood.name.slice(1),
    calories: cal, proteins: p, fats: f, carbs: c, qty: scannerQty
  });

  const btn = document.getElementById('btn-add-scanned');
  if (btn) {
    btn.textContent = '✓ Added to Diary!';
    btn.style.background = 'var(--green-700)';
    setTimeout(() => {
      btn.textContent = 'Add to Diary';
      btn.style.background = '';
      Router.navigate('diary');
    }, 1000);
  }
}
