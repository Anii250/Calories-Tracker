/* ============================================================
   BMICard Component — Body Mass Index calculator & display
   ============================================================ */

function BMICard() {
    const state = Store.getState();
    const profile = state.profile || {};
    const height = profile.height;  // cm
    const weight = profile.weight;  // kg
    const age = profile.age || 25;
    const activity = profile.activity || 'moderate';
    const bmi = Store.getBMI();
    const category = getBMICategory(bmi);
    const timeline = getSmartTargetTimeline(height, weight, bmi);
    const energy = getEnergyInsights(weight, height, age, activity);

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

      <div class="bmi-card__timeline ${timeline.className}">
        ${timeline.message}
      </div>

      <div class="bmi-card__energy">
        <div class="bmi-card__energy-title">🔥 Energy Engine</div>
        <div class="bmi-card__energy-row">
          <span class="bmi-card__energy-label">BMR:</span>
          <span class="bmi-card__energy-value">${energy.bmr} kcal</span>
        </div>
        <div class="bmi-card__energy-note">Calories burned at rest</div>
        <div class="bmi-card__energy-row">
          <span class="bmi-card__energy-label">TDEE:</span>
          <span class="bmi-card__energy-value">${energy.tdee} kcal</span>
        </div>
        <div class="bmi-card__energy-note">Maintenance calories based on activity</div>
        <div class="bmi-card__energy-indicator">📉 Weight loss target: ~${energy.cutTarget} kcal/day (TDEE - 50)</div>
      </div>

      <div class="bmi-card__ai" id="bmi-ai-section">
        <button class="bmi-card__ai-btn" id="bmi-ai-btn" onclick="fetchBMIInsight(${bmi.toFixed(1)}, ${weight}, ${height}, ${energy.tdee})">✨ Get AI Insight</button>
        <div class="bmi-card__ai-tip" id="bmi-ai-tip" style="display:none;"></div>
      </div>
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

function getSmartTargetTimeline(heightCm, currentWeight, bmi) {
    const heightM = heightCm / 100;
    const healthyMin = 18.5 * heightM * heightM;
    const healthyMax = 24.9 * heightM * heightM;
    const pacePerWeek = 0.5;

    if (bmi >= 18.5 && bmi <= 24.9) {
        return {
            className: 'bmi-card__timeline--success',
            message: '🎉 You are already in the healthy BMI zone. Keep up your great routine!'
        };
    }

    const targetWeight = bmi > 24.9 ? healthyMax : healthyMin;
    const kgAway = Math.abs(currentWeight - targetWeight);
    const weeks = Math.max(1, Math.ceil(kgAway / pacePerWeek));

    return {
        className: 'bmi-card__timeline--plan',
        message: `You are ${kgAway.toFixed(1)} kg away from your healthy zone. At a safe pace of 0.5kg/week, you can reach this in ~${weeks} weeks!`
    };
}

function getEnergyInsights(weightKg, heightCm, age, activity) {
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };
    const multiplier = activityMultipliers[activity] || activityMultipliers.moderate;
    const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
    const tdee = Math.round(bmr * multiplier);
    const cutTarget = Math.max(1200, tdee - 50);
    return { bmr, tdee, cutTarget };
}

async function fetchBMIInsight(bmi, weight, height, tdee) {
    const button = document.getElementById('bmi-ai-btn');
    const tipBox = document.getElementById('bmi-ai-tip');
    if (!button || !tipBox) return;
    button.disabled = true;
    button.textContent = 'Generating...';

    try {
        const response = await fetch('/api/insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bmi, weight, height, tdee })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || 'Could not generate AI insight');
        }
        tipBox.textContent = data.insight || 'You are making progress. Stay consistent with your calorie target and daily movement.';
        button.style.display = 'none';
        tipBox.style.display = 'block';
        tipBox.classList.remove('bmi-card__ai-tip--visible');
        void tipBox.offsetWidth;
        tipBox.classList.add('bmi-card__ai-tip--visible');
    } catch (error) {
        button.disabled = false;
        button.textContent = '✨ Get AI Insight';
        alert(error.message || 'Could not generate AI insight right now.');
    }
}
