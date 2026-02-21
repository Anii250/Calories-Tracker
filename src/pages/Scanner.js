/* ============================================================
   Scanner Page — Food scanner with camera + overlays
   ============================================================ */

function ScannerPage() {
  const scannerItems = [
    { name: 'Strawberry', cal: 8, x: '55%', y: '18%' },
    { name: 'Hazelnut', cal: 20, x: '28%', y: '35%' },
    { name: 'Caramel', cal: 50, x: '58%', y: '42%' },
    { name: 'Pancakes', cal: 490, x: '30%', y: '60%' }
  ];

  const food = {
    name: 'Pancakes with caramel, strawberries and nuts',
    calories: 568, proteins: 6.6, fats: 5.1, carbs: 40,
    composition: [
      { name: 'Pancakes', cal: 490 },
      { name: 'Caramel', cal: 50 },
      { name: 'Strawberry', cal: 8 },
      { name: 'Hazelnut', cal: 20 }
    ]
  };

  return `
    <div class="page" id="scanner-page">
      <div class="page-header">
        <button class="page-header__icon" onclick="Router.navigate('diary')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-header__title">Scanner</div>
        <div style="width:36px;"></div>
      </div>

      <!-- Camera Capture -->
      ${CameraCapture()}

      <!-- Demo Scanner View -->
      <div class="scanner-view" id="scanner-view">
        <img class="scanner-view__img"
          src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop&auto=format"
          alt="Pancakes with toppings"
          onerror="this.style.background='var(--gray-300)';this.alt='Food Image'" />
        ${scannerItems.map((item, i) => `
          <div class="scanner-label" style="left:${item.x};top:${item.y};animation-delay:${i * 0.15}s;">
            ${item.name} <strong>${item.cal} Cal</strong>
          </div>
        `).join('')}
      </div>

      <div class="allergen-alert">
        <div class="allergen-alert__title">⚠️ Possible allergen detected</div>
        <div class="allergen-alert__text">Perhaps there is mustard in the dish. Be careful!</div>
      </div>

      <div class="food-detail">
        <div class="food-detail__name">${food.name}</div>
        <div class="food-detail__qty">
          <button class="qty-btn" onclick="updateScannerQty(-1)">−</button>
          <span class="qty-value" id="scanner-qty">1</span>
          <button class="qty-btn" onclick="updateScannerQty(1)">+</button>
        </div>
        ${MacroBar(food.calories, food.proteins, food.fats, food.carbs)}
        <div class="food-detail__composition">
          <h4>Composition:</h4>
          ${food.composition.map(c => `
            <div class="composition-row">
              <span>${c.name}</span>
              <span>${c.cal} Cal</span>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:18px;" onclick="addScannedFood()">Add</button>
      </div>
    </div>
    ${NavBar('scanner')}
  `;
}

let scannerQty = 1;

function updateScannerQty(delta) {
  scannerQty = Math.max(1, scannerQty + delta);
  const el = document.getElementById('scanner-qty');
  if (el) el.textContent = scannerQty;
}

function addScannedFood() {
  Store.addMeal('breakfast', {
    name: 'Pancakes with caramel, strawberries and nuts',
    calories: 568, proteins: 6.6, fats: 5.1, carbs: 40, qty: scannerQty
  });
  scannerQty = 1;
  const btn = document.querySelector('#scanner-page .btn-primary');
  if (btn) {
    btn.textContent = '✓ Added!';
    btn.style.background = 'var(--green-700)';
    setTimeout(() => { btn.textContent = 'Add'; btn.style.background = ''; }, 1200);
  }
}
