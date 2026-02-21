/* ============================================================
   MealReminders Component — notification scheduling
   ============================================================ */

function MealReminders() {
    const r = Store.getReminders();

    return `
    <div class="settings-section">
      <div class="settings-section__title">⏰ Meal Reminders</div>
      <div class="dark-mode-toggle" style="margin-bottom:12px;">
        <div class="dark-mode-toggle__label">
          <span class="icon">🔔</span>
          <span>Enable Reminders</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleReminders(this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div id="reminder-times" style="${r.enabled ? '' : 'opacity:0.5;pointer-events:none;'}">
        <div class="reminder-row">
          <span>🥞 Breakfast</span>
          <input type="time" value="${r.breakfast}" onchange="updateReminderTime('breakfast', this.value)" class="reminder-time-input" />
        </div>
        <div class="reminder-row">
          <span>🥗 Lunch</span>
          <input type="time" value="${r.lunch}" onchange="updateReminderTime('lunch', this.value)" class="reminder-time-input" />
        </div>
        <div class="reminder-row">
          <span>🍣 Dinner</span>
          <input type="time" value="${r.dinner}" onchange="updateReminderTime('dinner', this.value)" class="reminder-time-input" />
        </div>
      </div>
    </div>
  `;
}

function toggleReminders(enabled) {
    if (enabled && 'Notification' in window) {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                Store.updateReminders({ enabled: true });
                scheduleReminders();
            } else {
                Store.updateReminders({ enabled: false });
                Router.navigate('settings');
            }
        });
    } else {
        Store.updateReminders({ enabled: false });
    }
    const timesEl = document.getElementById('reminder-times');
    if (timesEl) {
        timesEl.style.opacity = enabled ? '1' : '0.5';
        timesEl.style.pointerEvents = enabled ? 'auto' : 'none';
    }
}

function updateReminderTime(meal, time) {
    const update = {};
    update[meal] = time;
    Store.updateReminders(update);
    scheduleReminders();
}

let reminderTimers = [];

function scheduleReminders() {
    // Clear existing
    reminderTimers.forEach(t => clearTimeout(t));
    reminderTimers = [];

    const r = Store.getReminders();
    if (!r.enabled) return;

    const meals = { breakfast: r.breakfast, lunch: r.lunch, dinner: r.dinner };
    const labels = { breakfast: '🥞 Breakfast time!', lunch: '🥗 Lunch time!', dinner: '🍣 Dinner time!' };

    for (const [meal, time] of Object.entries(meals)) {
        if (!time) continue;
        const [h, m] = time.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h, m, 0, 0);

        let delay = target - now;
        if (delay < 0) delay += 24 * 60 * 60 * 1000; // Next day

        const timer = setTimeout(() => {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('CalorieAI', {
                    body: labels[meal] + ' Time to log your meal.',
                    icon: 'icons/icon-192.png'
                });
            }
        }, delay);
        reminderTimers.push(timer);
    }
}

// Auto-schedule on load
if (typeof Store !== 'undefined') {
    try { scheduleReminders(); } catch (e) { }
}
