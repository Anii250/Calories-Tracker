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

  document.querySelector('#scanner-loader h3').textContent = 'Analyzing Food...';
  document.querySelector('#scanner-loader .text-muted').textContent = 'Using Google Gemini AI...';

  // Small delay to ensure preview image is fully set
  await new Promise(r => setTimeout(r, 500));

  try {
    const imgEl = document.getElementById('camera-preview');
    if (!imgEl || !imgEl.src || imgEl.src.length < 100) {
        throw new Error('NO_IMAGE_DATA');
    }
    
    const requestBody = {
      image: imgEl.src
    };

    const urls = ['/api/scan', '/api/scan/', `${window.location.origin}/api/scan`];
    let response = null;
    for (const url of urls) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        cache: 'no-store',
        body: JSON.stringify(requestBody)
      });
      if (response.status !== 404) break;
    }

    const errorPayload = await response.clone().json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(errorPayload.error || `API Error: ${response.status}`);
    }

    const parsedData = await response.json();

    document.getElementById('scanner-loader').style.display = 'none';

    currentScannedFood = {
      name: parsedData.name || 'Unknown Food',
      calories: parsedData.calories || 0,
      proteins: parsedData.protein || 0,
      fats: parsedData.fat || 0,
      carbs: parsedData.carbs || 0,
      fiber: 0,
      sugar: 0,
      serving: 'Estimated by Gemini AI',
      source: 'gemini'
    };
    
    scannerQty = 1;
    renderScannerResult();

  } catch (err) {
    console.error('Gemini Scanner Error:', err);
    document.getElementById('scanner-loader').style.display = 'none';
    showScannerError(err.message === 'NO_IMAGE_DATA' ? 'No image captured' : err.message);
  }
}

function showScannerError(message) {
  const loader = document.getElementById('scanner-loader');
  if (loader) loader.style.display = 'none';
  // Show a friendly error in the result panel
  const resultEl = document.getElementById('scanner-result');
  resultEl.style.display = 'block';
  document.getElementById('scanner-alert').style.display = 'block';
  document.getElementById('scanner-source').textContent = message || 'Could not analyze the image. Please try again or check your API key.';
  document.getElementById('scanner-name').textContent = '❌ Scan Failed';
  document.getElementById('scanner-macros').innerHTML = MacroBar(0, 0, 0, 0);
  document.getElementById('scanner-composition').innerHTML = '';
  document.getElementById('btn-add-scanned').style.display = 'none';
}

function renderScannerResult() {
  if (!currentScannedFood) return;

  document.getElementById('scanner-result').style.display = 'block';
  document.getElementById('scanner-alert').style.display = 'block';
  document.getElementById('btn-add-scanned').style.display = ''; // Ensure button is visible

  document.getElementById('scanner-source').textContent = `Nutrition profile generated visually by Google Gemini AI.`;

  document.getElementById('scanner-name').textContent = currentScannedFood.name.charAt(0).toUpperCase() + currentScannedFood.name.slice(1);
  updateScannerQty(0); // Update multiplier

  document.getElementById('scanner-composition').innerHTML = `
    <h4>Details:</h4>
    <div class="composition-row" style="margin-top:8px;">
      <span>Serving Size</span>
      <span>${currentScannedFood.serving}</span>
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
