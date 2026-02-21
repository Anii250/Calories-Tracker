/* ============================================================
   MacroBar Component — 4-column macro nutrient display
   ============================================================ */

function MacroBar(cal, proteins, fats, carbs) {
    return `
    <div class="macro-bar">
      <div class="macro-bar__item">
        <div class="macro-bar__value">${cal}</div>
        <div class="macro-bar__label">Cal</div>
      </div>
      <div class="macro-bar__item">
        <div class="macro-bar__value">${proteins}</div>
        <div class="macro-bar__label">Proteins</div>
      </div>
      <div class="macro-bar__item">
        <div class="macro-bar__value">${fats}</div>
        <div class="macro-bar__label">Fats</div>
      </div>
      <div class="macro-bar__item">
        <div class="macro-bar__value">${carbs}</div>
        <div class="macro-bar__label">Carbs</div>
      </div>
    </div>
  `;
}
