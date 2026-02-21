/* ============================================================
   AchievementModal Component — popup overlay
   ============================================================ */

function AchievementModal(title, message, onClose) {
    return `
    <div class="modal-overlay" id="achievement-modal" onclick="closeAchievementModal(event)">
      <div class="modal-card" onclick="event.stopPropagation()">
        <div style="font-size:4rem;margin-bottom:12px;">🏆</div>
        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:12px;">
          <span style="font-size:1.5rem;">🎉</span>
          <span style="font-size:1.2rem;">⭐</span>
          <span style="font-size:1.5rem;">🎉</span>
        </div>
        <div class="modal-card__title">${title}</div>
        <div class="modal-card__text">${message}</div>
        <button class="btn btn-primary" style="width:100%;" onclick="closeAchievementModal(event)">
          View analysis
        </button>
      </div>
    </div>
  `;
}

function closeAchievementModal(e) {
    if (e) e.stopPropagation();
    const modal = document.getElementById('achievement-modal');
    if (modal) {
        modal.style.animation = 'fadeIn .2s ease reverse';
        setTimeout(() => modal.remove(), 200);
    }
}

function showAchievementModal() {
    const existing = document.getElementById('achievement-modal');
    if (existing) existing.remove();

    const html = AchievementModal(
        'New achievement!',
        'We have not eaten bad food for a week and keep the bar on the heels. In short, you are great!'
    );
    document.body.insertAdjacentHTML('beforeend', html);
}
