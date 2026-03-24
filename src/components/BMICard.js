/* ============================================================
   BMICard Component — Body Mass Index calculator & display
   ============================================================ */

function BMICard() {
    const state = Store.getState();
    const height = state.profile.height;  // cm
    const weight = state.profile.weight;  // kg
    const bmi = Store.getBMI();
    const category = getBMICategory(bmi);

    // Gauge position: BMI range 15–40 mapped to 0–100%
    const gaugeMin = 15;
    const gaugeMax = 40;
    const gaugePos = Math.min(100, Math.max(0, ((bmi - gaugeMin) / (gaugeMax - gaugeMin)) * 100));

    return `
    <div class="bmi-card" id="bmi-card">
      <div class="bmi-card__header">
        <span class="bmi-card__title">⚖️ BMI</span>
        <span class="bmi-card__value">${bmi.toFixed(1)}</span>
      </div>

      <!-- Category Badge -->
      <div class="bmi-card__category bmi-card__category--${category.class}">
        ${category.emoji} ${category.label}
      </div>

      <!-- Visual Gauge -->
      <div class="bmi-gauge">
        <div class="bmi-gauge__bar">
          <div class="bmi-gauge__zone bmi-gauge__zone--underweight"></div>
          <div class="bmi-gauge__zone bmi-gauge__zone--normal"></div>
          <div class="bmi-gauge__zone bmi-gauge__zone--overweight"></div>
          <div class="bmi-gauge__zone bmi-gauge__zone--obese"></div>
          <div class="bmi-gauge__marker" style="left:${gaugePos}%"></div>
        </div>
        <div class="bmi-gauge__labels">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      <!-- Info Row -->
      <div class="bmi-card__info">
        <div class="bmi-card__info-item">
          <span class="bmi-card__info-value">📏 ${height} cm</span>
          <span class="bmi-card__info-label">Height</span>
        </div>
        <div class="bmi-card__info-item">
          <span class="bmi-card__info-value">⚖️ ${weight} kg</span>
          <span class="bmi-card__info-label">Weight</span>
        </div>
        <div class="bmi-card__info-item">
          <span class="bmi-card__info-value">${getHealthyWeightRange(height)}</span>
          <span class="bmi-card__info-label">Healthy</span>
        </div>
      </div>

      <!-- Tip -->
      <div class="bmi-card__tip">${category.tip}</div>
    </div>
  `;
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return {
        label: 'Underweight', class: 'underweight', emoji: '🔵',
        tip: '💡 Try to increase your calorie intake with nutrient-dense foods.'
    };
    if (bmi < 25) return {
        label: 'Normal', class: 'normal', emoji: '🟢',
        tip: '✨ Great job! Your BMI is in the healthy range. Keep it up!'
    };
    if (bmi < 30) return {
        label: 'Overweight', class: 'overweight', emoji: '🟡',
        tip: '💡 A balanced diet and regular exercise can help reach a healthier weight.'
    };
    return {
        label: 'Obese', class: 'obese', emoji: '🔴',
        tip: '💡 Consider consulting a doctor for a personalized health plan.'
    };
}

function getHealthyWeightRange(heightCm) {
    const heightM = heightCm / 100;
    const minW = (18.5 * heightM * heightM).toFixed(0);
    const maxW = (24.9 * heightM * heightM).toFixed(0);
    return `${minW}–${maxW} kg`;
}
