/* ============================================================
   StreakCounter Component — consecutive logging days
   ============================================================ */

function StreakCounter() {
    const streak = Store.getStreak();
    return `
    <div class="streak-badge" title="${streak} day streak">
      <span class="streak-badge__icon">🔥</span>
      <span class="streak-badge__count">${streak}</span>
    </div>
  `;
}
