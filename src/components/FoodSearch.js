/* ============================================================
   FoodSearch Component — searchable food database
   ============================================================ */

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
      <div class="food-search__results" id="food-search-results"></div>
    </div>
  `;
}

function handleFoodSearch(query) {
    const results = Store.searchFood(query);
    const container = document.getElementById('food-search-results');
    if (!container) return;

    if (results.length === 0 && query.length >= 2) {
        container.innerHTML = '<div class="food-search__empty">No foods found. Use manual entry below.</div>';
        return;
    }

    if (query.length < 2) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = results.map(food => `
    <div class="food-search__item" onclick="quickAddFood('${food.name.replace(/'/g, "\\'")}', ${food.calories}, ${food.proteins}, ${food.fats}, ${food.carbs})">
      <div class="food-search__item-info">
        <div class="food-search__item-name">${food.name}</div>
        <div class="food-search__item-macros">${food.proteins}g P · ${food.fats}g F · ${food.carbs}g C</div>
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
