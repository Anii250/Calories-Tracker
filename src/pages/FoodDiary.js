/* ============================================================
   Food Diary Page — Main dashboard
   ============================================================ */

function FoodDiaryPage() {
    const totals = Store.getTotals();
    const dailyGoal = Store.getDailyGoal();
    const meals = Store.getTodayMeals();
    const eaten = totals.cal;
    const dateStr = Store.getFormattedToday();

    return `
    <div class="page" id="food-diary-page">
      <!-- Header -->
      <div class="page-header">
        <button class="page-header__icon" onclick="history.back()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-header__title">Food Diary</div>
        <button class="page-header__icon" onclick="showAchievementModal()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>

      <!-- Tip Card -->
      <div class="tip-card">
        <div class="tip-card__text">
          <h3>More proteins!</h3>
          <p>Breakfast was quite filling, let's make dinner light and focus on protein products.</p>
        </div>
        <div style="font-size:3.5rem;line-height:1;">🥬</div>
      </div>

      <!-- Date Row -->
      <div class="date-row">
        <div class="date-row__left">
          <h2>Today:</h2>
          <span>${dateStr}</span>
        </div>
        <div class="date-row__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
      </div>

      <!-- Progress Ring -->
      ${ProgressRing(eaten, dailyGoal)}

      <!-- Macro Bar -->
      ${MacroBar(totals.cal, totals.proteins, totals.fats, totals.carbs)}

      <!-- Eaten section -->
      <div class="section-title">Eaten:</div>
      <div id="meals-list">
        ${MealSection('breakfast', meals.breakfast)}
        ${MealSection('lunch', meals.lunch)}
        ${MealSection('dinner', meals.dinner)}
        ${MealSection('snacks', meals.snacks)}
      </div>

      <!-- FAB -->
      <button class="fab" id="fab-add" onclick="openAddFoodModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    ${NavBar('diary')}
  `;
}

/* Add Food Modal */
function openAddFoodModal() {
    const existing = document.getElementById('add-food-overlay');
    if (existing) existing.remove();

    const html = `
    <div class="add-food-overlay" id="add-food-overlay" onclick="closeAddFoodModal(event)">
      <div class="add-food-sheet" onclick="event.stopPropagation()">
        <h3>Add Food</h3>
        <div class="form-group">
          <label for="food-name">Food Name</label>
          <input type="text" id="food-name" placeholder="e.g. Grilled Chicken" />
        </div>
        <div class="form-group">
          <label for="meal-type">Meal</label>
          <select id="meal-type">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="food-cal">Calories</label>
            <input type="number" id="food-cal" placeholder="0" min="0" />
          </div>
          <div class="form-group">
            <label for="food-protein">Proteins (g)</label>
            <input type="number" id="food-protein" placeholder="0" min="0" step="0.1" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="food-fats">Fats (g)</label>
            <input type="number" id="food-fats" placeholder="0" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label for="food-carbs">Carbs (g)</label>
            <input type="number" id="food-carbs" placeholder="0" min="0" step="0.1" />
          </div>
        </div>
        <div style="margin-top:18px;display:flex;gap:10px;">
          <button class="btn btn-outline" style="flex:1;" onclick="closeAddFoodModal(event)">Cancel</button>
          <button class="btn btn-primary" style="flex:1;" onclick="submitAddFood()">Add</button>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Focus name field
    setTimeout(() => document.getElementById('food-name')?.focus(), 100);
}

function closeAddFoodModal(e) {
    if (e) e.stopPropagation();
    const modal = document.getElementById('add-food-overlay');
    if (modal) {
        modal.style.animation = 'fadeIn .2s ease reverse';
        setTimeout(() => modal.remove(), 200);
    }
}

function submitAddFood() {
    const name = document.getElementById('food-name')?.value?.trim();
    const mealType = document.getElementById('meal-type')?.value;
    const cal = parseFloat(document.getElementById('food-cal')?.value) || 0;
    const protein = parseFloat(document.getElementById('food-protein')?.value) || 0;
    const fats = parseFloat(document.getElementById('food-fats')?.value) || 0;
    const carbs = parseFloat(document.getElementById('food-carbs')?.value) || 0;

    if (!name) {
        document.getElementById('food-name').style.borderColor = 'red';
        return;
    }

    Store.addMeal(mealType, {
        name,
        calories: cal,
        proteins: protein,
        fats: fats,
        carbs: carbs,
        qty: 1
    });

    closeAddFoodModal();
    Router.navigate('diary');
}
