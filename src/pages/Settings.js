/* ============================================================
   Settings Page — Profile & preferences
   ============================================================ */

function onHeightChange(val) { Store.updateProfile({ height: val }); }
function onWeightChange(val) { Store.updateProfile({ weight: val }); }

function SettingsPage() {
  const state = Store.getState();
  const p = state.profile;
  const user = Auth.getCurrentUser();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userPhoto = user?.photoURL || '';

  return `
    <div class="page" id="settings-page">
      <div class="page-header">
        <button class="page-header__icon" onclick="Router.navigate('diary')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-header__title">Settings</div>
        <div style="width:36px;"></div>
      </div>

      <!-- User Profile Card -->
      <div class="user-profile-card">
        <div class="user-profile-card__avatar">
          ${userPhoto ? `<img src="${userPhoto}" alt="" />` : `<span>${userName.charAt(0).toUpperCase()}</span>`}
        </div>
        <div class="user-profile-card__info">
          <div class="user-profile-card__name">${userName}</div>
          <div class="user-profile-card__email">${userEmail}</div>
        </div>
        <span class="user-profile-card__badge">☁️ Synced</span>
      </div>

      <!-- Dark Mode -->
      <div class="settings-section">
        <div class="dark-mode-toggle">
          <div class="dark-mode-toggle__label">
            <span class="icon">${Store.getDarkMode() ? '🌙' : '☀️'}</span>
            <span>Dark Mode</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="dark-mode-checkbox" ${Store.getDarkMode() ? 'checked' : ''} onchange="toggleDarkMode(this.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Gender -->
      <div class="settings-section">
        <div class="settings-section__title">Gender</div>
        <div class="gender-toggle">
          <button class="gender-btn ${p.gender === 'male' ? 'active' : ''}" onclick="setGender('male')">Male</button>
          <button class="gender-btn ${p.gender === 'female' ? 'active' : ''}" onclick="setGender('female')">Female</button>
        </div>
      </div>

      <!-- Height -->
      <div class="settings-section">
        <div class="settings-section__title">Height, cm</div>
        ${NumberPicker('height', 140, 220, p.height, 'cm', 'onHeightChange')}
      </div>

      <!-- Weight -->
      <div class="settings-section">
        <div class="settings-section__title">Weight, kg</div>
        ${NumberPicker('weight', 40, 150, p.weight, 'kg', 'onWeightChange')}
      </div>

      <!-- Goal -->
      <div class="settings-section">
        <div class="settings-section__title">Goal</div>
        <div class="goal-cards">
          <div class="goal-card ${p.goal === 'lose' ? 'active' : ''}" onclick="setGoal('lose')">Lose weight</div>
          <div class="goal-card ${p.goal === 'keep' ? 'active' : ''}" onclick="setGoal('keep')">Keep my current weight</div>
          <div class="goal-card ${p.goal === 'gain' ? 'active' : ''}" onclick="setGoal('gain')">Gain weight</div>
        </div>
      </div>

      <!-- Meal Reminders -->
      ${MealReminders()}

      <!-- Export -->
      ${ExportData()}

      <!-- Activity -->
      <div class="settings-section">
        <div class="settings-section__title">Type of physical activity</div>
        <div class="activity-cards">
          <div class="activity-card ${p.activity === 'sedentary' ? 'active' : ''}" onclick="setActivity('sedentary')">
            <div class="activity-card__icon">🪑</div>
            <div class="activity-card__text"><div class="activity-card__title">Sedentary</div><div class="activity-card__desc">Little to no exercise</div></div>
          </div>
          <div class="activity-card ${p.activity === 'light' ? 'active' : ''}" onclick="setActivity('light')">
            <div class="activity-card__icon">🚶</div>
            <div class="activity-card__text"><div class="activity-card__title">Light</div><div class="activity-card__desc">Exercise 1-3 days/week</div></div>
          </div>
          <div class="activity-card ${p.activity === 'moderate' ? 'active' : ''}" onclick="setActivity('moderate')">
            <div class="activity-card__icon">🏃</div>
            <div class="activity-card__text"><div class="activity-card__title">Moderate</div><div class="activity-card__desc">Exercise 3-5 days/week</div></div>
          </div>
          <div class="activity-card ${p.activity === 'active' ? 'active' : ''}" onclick="setActivity('active')">
            <div class="activity-card__icon">🏋️</div>
            <div class="activity-card__text"><div class="activity-card__title">Active</div><div class="activity-card__desc">Exercise 6-7 days/week</div></div>
          </div>
          <div class="activity-card ${p.activity === 'very_active' ? 'active' : ''}" onclick="setActivity('very_active')">
            <div class="activity-card__icon">⚡</div>
            <div class="activity-card__text"><div class="activity-card__title">Very Active</div><div class="activity-card__desc">Intense exercise daily</div></div>
          </div>
        </div>
      </div>

      <!-- Daily Steps Goal -->
      <div class="settings-section">
        <div class="settings-section__title">👟 Daily Steps Goal</div>
        <div class="steps-goal-presets">
          ${[5000, 8000, 10000, 12000, 15000].map(v => `
            <button class="steps-goal-preset ${Store.getStepsTarget() === v ? 'active' : ''}" onclick="setStepsGoal(${v})">${(v/1000).toFixed(0)}k</button>
          `).join('')}
        </div>
        <div class="steps-goal-custom">
          <input type="number" id="custom-steps-goal" placeholder="Custom goal..." min="1000" step="500" value="${Store.getStepsTarget()}" />
          <button class="btn btn-primary" style="padding:10px 16px;font-size:.82rem;" onclick="setCustomStepsGoal()">Set</button>
        </div>
      </div>

      <!-- Logout -->
      <div class="settings-section" style="margin-top:16px;">
        <button class="btn auth-logout-btn" onclick="Auth.logout()" style="width:100%;">
          🚪 Sign Out
        </button>
      </div>

      <div style="height:20px;"></div>
    </div>
    ${NavBar('settings')}
  `;
}

function setGender(g) { Store.updateProfile({ gender: g }); Router.navigate('settings'); }
function setGoal(g) { Store.updateProfile({ goal: g }); Router.navigate('settings'); }
function setActivity(a) { Store.updateProfile({ activity: a }); Router.navigate('settings'); }
function toggleDarkMode(enabled) {
  Store.setDarkMode(enabled);
  const iconEl = document.querySelector('.dark-mode-toggle__label .icon');
  if (iconEl) iconEl.textContent = enabled ? '🌙' : '☀️';
}
function setStepsGoal(val) {
  Store.setStepsTarget(val);
  Router.navigate('settings');
}
function setCustomStepsGoal() {
  const input = document.getElementById('custom-steps-goal');
  const val = parseInt(input?.value);
  if (val && val >= 100) {
    Store.setStepsTarget(val);
    Router.navigate('settings');
  }
}
