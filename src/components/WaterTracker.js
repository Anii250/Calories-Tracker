/* ============================================================
   WaterTracker Component — daily water intake
   ============================================================ */

function WaterTracker() {
    const glasses = Store.getWater();
    const target = Store.getWaterTarget();
    const pct = Math.min(100, Math.round((glasses / target) * 100));

    let glassesHtml = '';
    for (let i = 1; i <= target; i++) {
        const filled = i <= glasses;
        glassesHtml += `
      <button class="water-glass ${filled ? 'filled' : ''}" onclick="toggleWaterGlass(${i})" title="Glass ${i}">
        💧
      </button>
    `;
    }

    return `
    <div class="water-tracker">
      <div class="water-tracker__header">
        <span class="water-tracker__title">💧 Water Intake</span>
        <span class="water-tracker__count">${glasses}/${target} glasses</span>
      </div>
      <div class="water-tracker__glasses">${glassesHtml}</div>
      <div class="water-tracker__bar">
        <div class="water-tracker__bar-fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

function toggleWaterGlass(glassNum) {
    const current = Store.getWater();
    if (glassNum <= current) {
        Store.setWater(glassNum - 1);
    } else {
        Store.setWater(glassNum);
    }
    // Re-render water section only
    const container = document.getElementById('water-section');
    if (container) {
        container.innerHTML = WaterTracker();
    }
}
