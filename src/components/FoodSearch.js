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
          oninput="handleFoodSearch(this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();handleFoodSearch(this.value);}"
          autocomplete="off"
        />
        <button class="food-search__search-btn" onclick="handleFoodSearch(document.getElementById('food-search-input')?.value)" title="Search Food">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
      <div class="food-search__tabs">
        <button class="food-search__tab active" id="fs-tab-local" onclick="switchFoodTab('local')">📦 Local</button>
        <button class="food-search__tab" id="fs-tab-online" onclick="switchFoodTab('online')">🌐 Online</button>
      </div>
      <div class="food-search__results" id="food-search-results"></div>
    </div>
  `;
}

let currentFoodTab = 'local';

function switchFoodTab(tab) {
  currentFoodTab = tab;
  document.getElementById('fs-tab-local')?.classList.toggle('active', tab === 'local');
  document.getElementById('fs-tab-online')?.classList.toggle('active', tab === 'online');

  const query = document.getElementById('food-search-input')?.value || '';
  if (query.length >= 2) handleFoodSearch(query);
}

function handleFoodSearch(query) {
  if (searchTimeout) clearTimeout(searchTimeout);

  const container = document.getElementById('food-search-results');
  if (!container) return;

  if (!query || query.length < 2) {
    container.innerHTML = '';
    return;
  }

  if (currentFoodTab === 'local') {
    const results = Store.searchFood(query);
    renderFoodResults(results, container, '📦');
  } else {
    // CalorieNinjas API
    if (!Store.getApiKey()) {
      container.innerHTML = `
        <div class="food-search__empty" style="padding: 24px; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔑</div>
          <h4 style="margin-bottom: 8px;">API Key Required</h4>
          <p style="font-size: 13px; color: var(--gray-500); margin-bottom: 12px;">
            Get your free key at <a href="https://calorieninjas.com/api" target="_blank" style="color:var(--accent)">calorieninjas.com/api</a> and add it in Settings.
          </p>
          <button class="btn btn-primary" onclick="Router.navigate('settings')" style="padding: 8px 16px; font-size: 14px;">Go to Settings</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="food-search__loading">
        <div class="food-search__spinner"></div>
        <span>Searching CalorieNinjas...</span>
      </div>`;

    searchTimeout = setTimeout(async () => {
      try {
        const results = await NutritionAPI.searchFood(query);
        renderFoodCards(results, container);
      } catch (e) {
        let icon = '⚠️', title = 'Something went wrong', desc = 'Please try again later.';

        if (e.message === 'INVALID_KEY') {
          icon = '🔑'; title = 'Invalid API Key';
          desc = 'Your CalorieNinjas API key is invalid or expired. Update it in Settings.';
        } else if (e.message === 'NO_RESULTS') {
          icon = '🔍'; title = 'No results found';
          desc = `Try something like "2 eggs" or "1 cup rice" for better results.`;
        } else if (e.message === 'TIMEOUT') {
          icon = '⏳'; title = 'Request timed out';
          desc = 'The server took too long. Check your connection and try again.';
        } else if (e.message === 'NETWORK_ERROR') {
          icon = '📡'; title = 'Network error';
          desc = 'Check your internet connection and try again.';
        }

        container.innerHTML = `
          <div class="food-search__empty">
            <div style="font-size:1.8rem;margin-bottom:6px;">${icon}</div>
            <div><strong>${title}</strong></div>
            <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px;">${desc}</div>
          </div>`;
      }
    }, 400);
  }
}

/* ---- Render: Card format ---- */
function renderFoodCards(results, container) {
  container.innerHTML = `
    <div class="food-search__cards">
      ${results.map((food, i) => `
        <div class="food-result-card" id="food-result-${i}">
          <div class="food-result-card__top">
            <div class="food-result-card__info">
              <div class="food-result-card__name">${escapeHtml(food.name)}</div>
              <div class="food-result-card__qty">${escapeHtml(food.serving)}</div>
            </div>
            <div class="food-result-card__cal">${food.calories}<small> kcal</small></div>
          </div>
          <div class="food-result-card__macros">
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#43a047">${food.proteins}g</span>
              <span class="food-result-card__macro-lbl">Protein</span>
            </div>
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#ff9800">${food.carbs}g</span>
              <span class="food-result-card__macro-lbl">Carbs</span>
            </div>
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#e53935">${food.fats}g</span>
              <span class="food-result-card__macro-lbl">Fat</span>
            </div>
            ${food.fiber ? `
            <div class="food-result-card__macro">
              <span class="food-result-card__macro-val" style="color:#8d6e63">${food.fiber}g</span>
              <span class="food-result-card__macro-lbl">Fiber</span>
            </div>` : ''}
          </div>
          <div class="food-result-card__actions">
            <button class="food-result-card__use-btn" onclick="useFoodResult('${food.name.replace(/'/g, "\\'")}', ${food.calories}, ${food.proteins}, ${food.fats}, ${food.carbs})">
              ✅ Use This
            </button>
            <button class="food-result-card__add-btn" onclick="quickAddFood('${food.name.replace(/'/g, "\\'")}', ${food.calories}, ${food.proteins}, ${food.fats}, ${food.carbs})">
              ➕ Quick Add
            </button>
          </div>
        </div>
      `).join('')}
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
  const mealType = document.getElementById('meal-type')?.value || getMealTypeByTime();
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
