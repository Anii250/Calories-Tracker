/* ============================================================
   Charts Page — Weekly/Monthly calorie visualization
   ============================================================ */

function ChartsPage() {
    return `
    <div class="page" id="charts-page">
      <div class="page-header">
        <button class="page-header__icon" onclick="Router.navigate('diary')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-header__title">Charts</div>
        <div style="width:36px;"></div>
      </div>

      <!-- Period Toggle -->
      <div class="chart-toggle">
        <button class="chart-toggle__btn active" id="btn-weekly" onclick="showChart('weekly')">Weekly</button>
        <button class="chart-toggle__btn" id="btn-monthly" onclick="showChart('monthly')">Monthly</button>
      </div>

      <!-- Chart Canvas -->
      <div class="chart-container">
        <canvas id="calorie-chart" width="400" height="220"></canvas>
      </div>

      <!-- Stats -->
      <div id="chart-stats"></div>
    </div>

    ${NavBar('charts')}
  `;
}

let currentChartView = 'weekly';

function showChart(view) {
    currentChartView = view;
    document.getElementById('btn-weekly')?.classList.toggle('active', view === 'weekly');
    document.getElementById('btn-monthly')?.classList.toggle('active', view === 'monthly');
    renderChart();
}

function renderChart() {
    const canvas = document.getElementById('calorie-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 220 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '220px';
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 220;
    const data = currentChartView === 'weekly' ? Store.getWeeklyData() : Store.getMonthlyData();
    const goal = Store.getDailyGoal();
    const isDark = Store.getDarkMode();

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (data.length === 0) return;

    const maxCal = Math.max(goal, ...data.map(d => d.cal)) * 1.15;
    const padding = { top: 20, right: 15, bottom: 35, left: 15 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barGap = currentChartView === 'weekly' ? 12 : 2;
    const barW = Math.max(4, (chartW - barGap * data.length) / data.length);

    // Goal line
    const goalY = padding.top + chartH * (1 - goal / maxCal);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, goalY);
    ctx.lineTo(w - padding.right, goalY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Goal label
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Goal: ${goal}`, w - padding.right, goalY - 4);

    // Bars
    data.forEach((d, i) => {
        const barH = (d.cal / maxCal) * chartH;
        const x = padding.left + i * (barW + barGap) + barGap / 2;
        const y = padding.top + chartH - barH;

        // Bar gradient
        const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
        if (d.cal > goal) {
            grad.addColorStop(0, '#ff9800');
            grad.addColorStop(1, '#ffcc80');
        } else {
            grad.addColorStop(0, '#43a047');
            grad.addColorStop(1, '#a5d6a7');
        }
        ctx.fillStyle = grad;

        // Rounded top
        const radius = Math.min(barW / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x, padding.top + chartH);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, padding.top + chartH);
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
        ctx.font = currentChartView === 'weekly' ? '11px Inter, sans-serif' : '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barW / 2, h - 8);

        // Calorie value on top (weekly only)
        if (currentChartView === 'weekly' && d.cal > 0) {
            ctx.fillStyle = isDark ? '#e8e8e8' : '#333';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText(d.cal, x + barW / 2, y - 6);
        }
    });

    // Stats
    renderChartStats(data, goal);
}

function renderChartStats(data, goal) {
    const statsEl = document.getElementById('chart-stats');
    if (!statsEl) return;

    const withCals = data.filter(d => d.cal > 0);
    if (withCals.length === 0) {
        statsEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">No data yet for this period.</p>';
        return;
    }

    const avg = Math.round(withCals.reduce((s, d) => s + d.cal, 0) / withCals.length);
    const max = Math.max(...withCals.map(d => d.cal));
    const min = Math.min(...withCals.map(d => d.cal));
    const underGoal = withCals.filter(d => d.cal <= goal).length;
    const withSteps = data.filter(d => d.steps > 0);
    const avgSteps = withSteps.length > 0 ? Math.round(withSteps.reduce((s, d) => s + d.steps, 0) / withSteps.length) : 0;

    statsEl.innerHTML = `
    <div class="chart-stats-grid">
      <div class="chart-stat-card">
        <div class="chart-stat-card__value">${avg}</div>
        <div class="chart-stat-card__label">Avg Cal</div>
      </div>
      <div class="chart-stat-card">
        <div class="chart-stat-card__value">${max}</div>
        <div class="chart-stat-card__label">Highest</div>
      </div>
      <div class="chart-stat-card">
        <div class="chart-stat-card__value">${min}</div>
        <div class="chart-stat-card__label">Lowest</div>
      </div>
      <div class="chart-stat-card">
        <div class="chart-stat-card__value" style="color:var(--accent)">${underGoal}/${withCals.length}</div>
        <div class="chart-stat-card__label">Under Goal</div>
      </div>
      <div class="chart-stat-card">
        <div class="chart-stat-card__value">👟 ${avgSteps.toLocaleString()}</div>
        <div class="chart-stat-card__label">Avg Steps</div>
      </div>
    </div>
  `;
}

// Render chart after page loads
setTimeout(() => { if (document.getElementById('calorie-chart')) renderChart(); }, 100);
