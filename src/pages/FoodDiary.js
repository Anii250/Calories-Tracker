/* ============================================================
   Food Diary Page — Main dashboard
   ============================================================ */

let diaryViewDate = null; // null = today

function getViewDateKey() {
  return diaryViewDate || new Date().toISOString().slice(0, 10);
}

function getViewDateLabel() {
  if (!diaryViewDate) return Store.getFormattedToday();
  const d = new Date(diaryViewDate + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function isViewingToday() {
  return !diaryViewDate || diaryViewDate === new Date().toISOString().slice(0, 10);
}

function openDatePicker() {
  const today = new Date().toISOString().slice(0, 10);
  const existing = document.getElementById('date-picker-overlay');
  if (existing) { existing.remove(); return; }

  const html = `
    <div id="date-picker-overlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;
      display:flex;align-items:center;justify-content:center;padding:20px;
    " onclick="this.remove()">
      <div style="
        background:var(--card);border-radius:20px;padding:24px;width:100%;max-width:340px;
        box-shadow:0 8px 32px rgba(0,0,0,.3);
      " onclick="event.stopPropagation()">
        <h3 style="margin:0 0 16px;text-align:center;">📅 Pick a Date</h3>
        <input type="date" id="diary-date-input" 
          value="${diaryViewDate || today}" 
          max="${today}"
          style="
            width:100%;padding:12px;border-radius:12px;
            border:1px solid var(--border);background:var(--bg);
            color:var(--text);font-size:1rem;box-sizing:border-box;
          "
        />
        <div style="display:flex;gap:10px;margin-top:16px;">
          <button class="btn btn-outline" style="flex:1" onclick="document.getElementById('date-picker-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" style="flex:1" onclick="applyDiaryDate()">View Day</button>
        </div>
        ${!isViewingToday() ? `<button class="btn btn-outline" style="width:100%;margin-top:10px;" onclick="goBackToToday()">⬅ Back to Today</button>` : ''}
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function applyDiaryDate() {
  const val = document.getElementById('diary-date-input')?.value;
  if (!val) return;
  const today = new Date().toISOString().slice(0, 10);
  diaryViewDate = (val === today) ? null : val;
  document.getElementById('date-picker-overlay')?.remove();
  Router.navigate('diary');
}

function goBackToToday() {
  diaryViewDate = null;
  document.getElementById('date-picker-overlay')?.remove();
  Router.navigate('diary');
}

function FoodDiaryPage() {
  const dateKey = getViewDateKey();
  const totals = Store.getTotals(dateKey);
  const dailyGoal = Store.getDailyGoal();
  const data = Store.getState();
  const meals = data.meals[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const eaten = totals.cal;
  const dateStr = getViewDateLabel();

  return `
    <div class="page" id="food-diary-page">
      <!-- Header -->
      <div class="page-header">
        <button class="page-header__icon" onclick="history.back()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-header__title">Food Diary</div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${StreakCounter()}
          <button class="page-header__icon" onclick="showAchievementModal()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
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
      <div class="date-row" style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0;">
        <div class="date-row__left" style="display: flex; align-items: baseline; gap: 8px;">
          <h2 style="margin: 0; font-size: 1.4rem;">Today:</h2>
          <span style="color: var(--text-muted); font-size: 0.95rem;">${dateStr}</span>
        </div>
        <button class="page-header__icon" onclick="openDatePicker()" style="background:rgba(255,255,255,0.08);border-radius:12px;margin:0;display:flex;align-items:center;justify-content:center;" title="View past days">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
      </div>

      ${!isViewingToday() ? `
      <div style="
        background:var(--accent);color:#fff;text-align:center;padding:8px 16px;
        border-radius:12px;font-size:.85rem;font-weight:600;margin-bottom:4px;
        display:flex;align-items:center;justify-content:space-between;
      ">
        <span>📅 Viewing past day</span>
        <button onclick="goBackToToday()" style="background:rgba(255,255,255,.25);border:none;color:#fff;padding:4px 10px;border-radius:8px;font-size:.8rem;cursor:pointer;">Today →</button>
      </div>` : ''}

      <!-- Progress Ring -->
      ${ProgressRing(eaten, dailyGoal)}

      <!-- Macro Bar -->
      ${MacroBar(totals.cal, totals.proteins, totals.fats, totals.carbs)}

      <!-- Water Tracker -->
      <div id="water-section" style="margin-top:12px;">
        ${WaterTracker()}
      </div>


      <!-- Eaten section -->
      <div class="section-title">Eaten:</div>
      <div id="meals-list">
        ${MealSection('breakfast', meals.breakfast)}
        ${MealSection('lunch', meals.lunch)}
        ${MealSection('dinner', meals.dinner)}
        ${MealSection('snacks', meals.snacks)}
      </div>

    </div>

    <!-- FAB — only show when viewing today (moved out of scrolling page content) -->
    ${isViewingToday() ? `<button class="fab" id="fab-add" onclick="openAddFoodModal()">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>` : ''}

    ${NavBar('diary')}
  `;
}

/* Add Food Modal — now with Food Search */
function openAddFoodModal() {
  const existing = document.getElementById('add-food-overlay');
  if (existing) existing.remove();

  const autoMeal = Store.getMealTypeByTime();
  const html = `
    <div class="add-food-overlay" id="add-food-overlay" onclick="closeAddFoodModal(event)">
      <div class="add-food-sheet" onclick="event.stopPropagation()">
        <h3>Add Food</h3>

        <!-- Food Search -->
        ${FoodSearch()}

        <div style="text-align:center;color:var(--text-muted);font-size:.78rem;margin:12px 0;">— or enter manually —</div>

        <div class="form-group">
          <label for="food-name">Food Name</label>
          <input type="text" id="food-name" placeholder="e.g. Grilled Chicken" />
        </div>
        <div class="form-group">
          <label for="meal-type">Meal</label>
          <select id="meal-type">
            <option value="breakfast" ${autoMeal==='breakfast'?'selected':''}>Breakfast</option>
            <option value="lunch" ${autoMeal==='lunch'?'selected':''}>Lunch</option>
            <option value="dinner" ${autoMeal==='dinner'?'selected':''}>Dinner</option>
            <option value="snacks" ${autoMeal==='snacks'?'selected':''}>Snacks</option>
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
  setTimeout(() => document.getElementById('food-search-input')?.focus(), 100);
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

  Store.addMeal(mealType, { name, calories: cal, proteins: protein, fats, carbs, qty: 1 });
  closeAddFoodModal();
  Router.navigate('diary');
}
