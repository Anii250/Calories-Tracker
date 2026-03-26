/* ============================================================
   FoodSearch Component — searchable food database + CalorieNinjas API
   ============================================================ */

let searchTimeout = null;

function FoodSearch(mealType) {
  return `
    <div class="food-search" id="food-search-container">
      <div class="food-search__input-wrap">
        <svg class="food-search__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          class="food-search__input"
          id="food-search-input"
          placeholder="Search foods (e.g. 2 eggs, 1 cup rice...)"
          oninput="debouncedSearch(this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();handleFoodSearch(this.value);}"
          autocomplete="off"
        />
        <button class="food-search__search-btn" onclick="handleFoodSearch(document.getElementById('food-search-input')?.value)" title="Search Food">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
      <div class="food-search__tabs">
        <button class="food-search__tab active" id="fs-tab-online" onclick="switchFoodTab('online')">🌐 Online Search</button>
        <button class="food-search__tab" id="fs-tab-local" onclick="switchFoodTab('local')">📦 Local</button>
      </div>
      <div class="food-search__results" id="food-search-results"></div>
    </div>
  `;
}

let currentFoodTab = 'online';

function switchFoodTab(tab) {
  currentFoodTab = tab;
  document.getElementById('fs-tab-local')?.classList.toggle('active', tab === 'local');
  document.getElementById('fs-tab-online')?.classList.toggle('active', tab === 'online');

  const query = document.getElementById('food-search-input')?.value || '';
  if (query.length >= 2) handleFoodSearch(query);
}

function debouncedSearch(query) {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleFoodSearch(query);
  }, 700); // 700ms debounce
}

async function handleFoodSearch(query) {
  if (searchTimeout) clearTimeout(searchTimeout); // Cancel any pending debounce if called directly (e.g. via Enter key)

  const container = document.getElementById('food-search-results');
  const trimmedQuery = query ? query.trim() : '';

  if (!trimmedQuery || trimmedQuery.length < 3) {
    container.innerHTML = '';
    return;
  }

  if (currentFoodTab === 'local') {
    const results = Store.searchFood(trimmedQuery);
    renderFoodResults(results, container, '📦');
  } else {


    container.innerHTML = `
      <div class="food-search__loading">
        <div class="food-search__spinner"></div>
        <span>Searching online...</span>
      </div>`;

    // Disable search button while loading
    const searchBtn = document.querySelector('.food-search__search-btn');
    const searchInput = document.getElementById('food-search-input');
    if (searchBtn) { searchBtn.disabled = true; searchBtn.style.opacity = '0.5'; }
    if (searchInput) searchInput.disabled = true;

    try {
      const response = await fetch(`/api/searchFood?query=${encodeURIComponent(trimmedQuery)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
      }
      const results = await response.json();
      renderFoodCards(results.items, container);
    } catch (e) {
      console.error("FoodSearch API Error details:", e);
      let icon = '⚠️', title = 'Something went wrong', desc = e.message || 'The server returned an unexpected error.';

      container.innerHTML = `
        <div class="food-search__empty">
          <div style="font-size:1.8rem;margin-bottom:6px;">${icon}</div>
          <div><strong>${title}</strong></div>
          <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px;">${desc}</div>
        </div>`;
    } finally {
      // Re-enable search button and input
      if (searchBtn) { searchBtn.disabled = false; searchBtn.style.opacity = '1'; }
      if (searchInput) {
        searchInput.disabled = false;
        searchInput.focus(); // keep focus after loading
      }
    }
  }
}

/* ---- Render: Card format ---- */
function renderFoodCards(results, container) {
  const esc = (s) => (s || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
  const val = (v) => v || 0;

  container.innerHTML = `
    <div class="food-search__cards">
      ${results.map((food, i) => {
        const name = food.name || 'Unknown Food';
        const calories = val(food.calories);
        const proteins = val(food.proteins);
        const fats = val(food.fats);
        const carbs = val(food.carbs);
        const serving = food.serving || '';

        return `
        <div class="food-result-card" id="food-result-${i}">
          <div class="food-result-card__top">
            <div class="food-result-card__info">
              <div class="food-result-card__name">${escapeHtml(name)}</div>
              <div class="food-result-card__qty">${escapeHtml(serving)}</div>
            </div>
            <div class="food-result-card__cal">${calories}<small> kcal</small></div>
          </div>
          <div class="food-result-card__macros">
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#43a047">${proteins}g</span>
              <span class="food-result-card__macro-lbl">Protein</span>
            </div>
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#ff9800">${carbs}g</span>
              <span class="food-result-card__macro-lbl">Carbs</span>
            </div>
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#e53935">${fats}g</span>
              <span class="food-result-card__macro-lbl">Fat</span>
            </div>
            ${food.fiber ? `
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#8d6e63">${food.fiber}g</span>
              <span class="food-result-card__macro-lbl">Fiber</span>
            </div>` : ''}
          </div>
          <div class="food-result-card__actions">
            <button class="food-result-card__use-btn" onclick="useFoodResult('${esc(name)}', ${calories}, ${proteins}, ${fats}, ${carbs})">
              ✅ Use This
            </button>
            <button class="food-result-card__add-btn" onclick="quickAddFood('${esc(name)}', ${calories}, ${proteins}, ${fats}, ${carbs})">
              ➕ Quick Add
            </button>
          </div>
        </div>
      `;
      }).join('')}
    </div>
  `;
}

/* ---- Use This: auto-fill the manual form ---- */
function useFoodResult(name, cal, protein, fats, carbs) {
  const nameEl = document.getElementById('food-name');
  const calEl = document.getElementById('food-cal');
  const proteinEl = document.getElementById('food-protein');
  const fatsEl = document.getElementById('food-fats');
  const carbsEl = document.getElementById('food-carbs');

  if (nameEl) nameEl.value = name;
  if (calEl) calEl.value = cal;
  if (proteinEl) proteinEl.value = protein;
  if (fatsEl) fatsEl.value = fats;
  if (carbsEl) carbsEl.value = carbs;

  nameEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  nameEl?.style.setProperty('border-color', 'var(--accent)');
  setTimeout(() => nameEl?.style.removeProperty('border-color'), 2000);
}

/* ---- Render: List format (local results) ---- */
function renderFoodResults(results, container, sourceIcon) {
  if (results.length === 0) {
    container.innerHTML = '<div class="food-search__empty">No foods found. Try another search.</div>';
    return;
  }

  container.innerHTML = results.map(food => `
    <div class="food-search__item" onclick="quickAddFood('${food.name.replace(/'/g, "\\'")}', ${food.calories}, ${food.proteins}, ${food.fats}, ${food.carbs})">
      <div class="food-search__item-info">
        <div class="food-search__item-name">${sourceIcon} ${food.name}</div>
        <div class="food-search__item-macros">${food.proteins}g P · ${food.fats}g F · ${food.carbs}g C${food.serving ? ' · ' + food.serving : ''}</div>
      </div>
      <div class="food-search__item-cal">${food.calories} Cal</div>
    </div>
  `).join('');
}

function quickAddFood(name, cal, protein, fats, carbs) {
  const mealType = document.getElementById('meal-type')?.value || Store.getMealTypeByTime();
  Store.addMeal(mealType, {
    name, calories: cal, proteins: protein, fats, carbs, qty: 1
  });
  closeAddFoodModal();
  Router.navigate('diary');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
