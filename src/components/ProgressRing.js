/* ============================================================
   ProgressRing Component — SVG circular progress
   ============================================================ */

function ProgressRing(eaten, total) {
    const left = Math.max(0, total - eaten);
    const pct = Math.min(1, eaten / total);

    const size = 130;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);

    return `
    <div class="progress-section">
      <div class="progress-stat">
        <div class="progress-stat__value">${total}</div>
        <div class="progress-stat__label">Total</div>
      </div>

      <div class="progress-ring-container" style="width:${size}px;height:${size}px">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle
            cx="${size / 2}" cy="${size / 2}" r="${radius}"
            fill="none" stroke="var(--gray-200)" stroke-width="${stroke}"
          />
          <circle
            cx="${size / 2}" cy="${size / 2}" r="${radius}"
            fill="none" stroke="var(--orange-500)" stroke-width="${stroke}"
            stroke-linecap="round"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            style="--ring-circumference:${circumference};--ring-offset:${offset};animation:ringDraw .8s ease-out forwards;"
          />
        </svg>
        <div class="progress-ring__label">
          <div class="progress-ring__label-title">Eaten</div>
          <div class="progress-ring__label-value">${eaten}</div>
        </div>
      </div>

      <div class="progress-stat">
        <div class="progress-stat__value">${left}</div>
        <div class="progress-stat__label">Left</div>
      </div>
    </div>
  `;
}
