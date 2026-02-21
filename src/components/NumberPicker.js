/* ============================================================
   NumberPicker Component — horizontal scroll number picker
   ============================================================ */

function NumberPicker(id, min, max, current, unit, onChange) {
    const items = [];
    for (let i = min; i <= max; i++) {
        items.push(i);
    }

    // Register init after render
    setTimeout(() => {
        const track = document.getElementById(`picker-${id}`);
        if (!track) return;

        // Scroll to active item
        const activeItem = track.querySelector('.number-picker__item.active');
        if (activeItem) {
            const scrollPos = activeItem.offsetLeft - track.offsetWidth / 2 + activeItem.offsetWidth / 2;
            track.scrollLeft = scrollPos;
        }

        // Click handler
        track.addEventListener('click', (e) => {
            const item = e.target.closest('.number-picker__item');
            if (!item) return;
            const val = parseInt(item.dataset.value);

            // Update active state
            track.querySelectorAll('.number-picker__item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            // Smooth scroll to center
            const scrollPos = item.offsetLeft - track.offsetWidth / 2 + item.offsetWidth / 2;
            track.scrollTo({ left: scrollPos, behavior: 'smooth' });

            // Callback
            if (window[onChange]) window[onChange](val);
        });
    }, 50);

    return `
    <div class="number-picker">
      <div class="number-picker__track" id="picker-${id}">
        ${items.map(i => `
          <div class="number-picker__item ${i === current ? 'active' : ''}" data-value="${i}">${i}</div>
        `).join('')}
      </div>
    </div>
  `;
}
