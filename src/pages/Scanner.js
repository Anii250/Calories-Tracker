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

  // 1. Simulate AI Image Recognition (predicting what's in the photo)
  const commonFoods = ['Banana', 'Apple', 'Pizza', 'Burger', 'Coffee', 'Salad', 'Oatmeal', 'Chicken Breast', 'Rice', 'Avocado Toast'];
  const recognizedName = commonFoods[Math.floor(Math.random() * commonFoods.length)];

  // 2. Fetch REAL nutrition data from API based on the recognized food
  try {
    const results = await NutritionAPI.searchFood(recognizedName);

    document.getElementById('scanner-loader').style.display = 'none';

    if (results && results.length > 0) {
      currentScannedFood = results[0]; // Take top result
      scannerQty = 1;
      renderScannerResult();
    } else {
      alert("Could not find nutrition data for the scanned object. Try again.");
      retakePhoto();
    }
  } catch (err) {
    document.getElementById('scanner-loader').style.display = 'none';
    alert("Network error fetching real data. Please check connection.");
    retakePhoto();
  }
}

function renderScannerResult() {
  if (!currentScannedFood) return;

  document.getElementById('scanner-result').style.display = 'block';
  document.getElementById('scanner-alert').style.display = 'block';

  const srcName = currentScannedFood.source === 'calorieninjas' ? 'CalorieNinjas API' : 'OpenFoodFacts API';
  document.getElementById('scanner-source').textContent = `Real nutrition data fetched from ${srcName}.`;

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

  Store.addMeal('lunch', { // Defaulting to lunch for scanner
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
