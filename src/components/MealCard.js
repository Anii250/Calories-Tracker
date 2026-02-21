/* ============================================================
   MealCard Component — single meal item row
   ============================================================ */

function MealCard(item) {
    const icons = {
        breakfast: '🥞',
        lunch: '🥗',
        dinner: '🍣',
        snacks: '🍎'
    };
    const icon = icons[item._mealType] || '🍽️';

    return `
    <div class="meal-card" data-id="${item.id}">
      <div class="meal-card__icon">${icon}</div>
      <div class="meal-card__info">
        <div class="meal-card__title">${item._mealType ? item._mealType.charAt(0).toUpperCase() + item._mealType.slice(1) : 'Meal'}</div>
        <div class="meal-card__desc">${item.name}</div>
      </div>
      <div class="meal-card__cals">${Math.round(item.calories * item.qty)} Cal</div>
    </div>
  `;
}

function MealSection(mealType, items) {
    if (!items || items.length === 0) return '';

    const totalCals = items.reduce((s, i) => s + i.calories * i.qty, 0);
    const icons = {
        breakfast: '🥞',
        lunch: '🥗',
        dinner: '🍣',
        snacks: '🍎'
    };

    const label = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return `
    <div class="meal-section" style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;">
        <span style="font-weight:600;font-size:.92rem;">${icons[mealType] || '🍽️'} ${label}</span>
        <span style="font-size:.82rem;color:var(--text-muted);font-weight:600;">${Math.round(totalCals)} Cal</span>
      </div>
      ${items.map(item => {
        return `
          <div class="meal-card" data-id="${item.id}">
            <div class="meal-card__info" style="padding-left:8px;">
              <div class="meal-card__desc" style="color:var(--text-secondary);font-size:.82rem;">${item.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted);">${Math.round(item.calories * item.qty)} Cal</div>
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;
}
