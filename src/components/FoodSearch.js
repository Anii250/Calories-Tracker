/* ============================================================
   FoodSearch Component — searchable food database + Live API
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
          placeholder="Search foods (e.g. chicken, rice, banana...)"
          oninput="handleFoodSearch(this.value)"
          autocomplete="off"
        />
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

  if (query.length < 2) {
    container.innerHTML = '';
    return;
  }

  if (currentFoodTab === 'local') {
    // Search local database
    const results = Store.searchFood(query);
    renderFoodResults(results, container, '📦');
  } else {
    // Search online — debounce 500ms
    container.innerHTML = '<div class="food-search__empty">🔍 Searching online...</div>';
    searchTimeout = setTimeout(async () => {
      try {
        const results = await NutritionAPI.searchFood(query);
        if (results.length === 0) {
          container.innerHTML = '<div class="food-search__empty">No results found online. Try a different query.</div>';
        } else {
          renderFoodResults(results, container, '🌐');
        }
      } catch (e) {
        container.innerHTML = '<div class="food-search__empty">Network error. Check your connection.</div>';
      }
    }, 500);
  }
}

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
  const mealType = document.getElementById('meal-type')?.value || 'lunch';
  Store.addMeal(mealType, {
    name, calories: cal, proteins: protein, fats, carbs, qty: 1
  });
  closeAddFoodModal();
  Router.navigate('diary');
}
