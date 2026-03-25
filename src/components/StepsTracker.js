/* ============================================================
   StepsTracker Component — daily step count tracker
   with automatic step detection via DeviceMotion API
   ============================================================ */

// ---- Pedometer Engine (accelerometer-based) ----
const Pedometer = (() => {
    let isTracking = false;
    let lastStepTimestamp = 0;
    let isAboveThreshold = false;

    const STEP_THRESHOLD = 12.5;
    const STEP_COOLDOWN_MS = 350;

    let motionHandler = null;
    let permissionGranted = false;
    let updateInterval = null;

    function getMagnitude(x, y, z) {
        return Math.sqrt(x * x + y * y + z * z);
    }

    function handleMotion(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc || acc.x === null) return;

        const magnitude = getMagnitude(acc.x, acc.y, acc.z);
        const now = Date.now();
        const cooldownElapsed = now - lastStepTimestamp >= STEP_COOLDOWN_MS;

        if (magnitude >= STEP_THRESHOLD && cooldownElapsed && !isAboveThreshold) {
            isAboveThreshold = true;
            lastStepTimestamp = now;
            Store.addSteps(1);
            reRenderSteps();
        }

        if (magnitude < STEP_THRESHOLD - 1) {
            isAboveThreshold = false;
        }
    }

    async function requestPermission() {
        // iOS 13+ requires explicit permission
        if (typeof DeviceMotionEvent !== 'undefined' &&
            typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const perm = await DeviceMotionEvent.requestPermission();
                if (perm === 'granted') {
                    permissionGranted = true;
                    return true;
                }
                return false;
            } catch (e) {
                console.warn('Motion permission error:', e);
                return false;
            }
        }
        // Android / desktop — no permission needed
        permissionGranted = true;
        return true;
    }

    function isSupported() {
        return 'DeviceMotionEvent' in window;
    }

    async function start() {
        if (isTracking) return true;

        if (!isSupported()) {
            return false;
        }

        const hasPermission = await requestPermission();
        if (!hasPermission) return false;

        lastStepTimestamp = Date.now();
        isAboveThreshold = false;

        motionHandler = handleMotion;
        window.addEventListener('devicemotion', motionHandler, { passive: true });
        isTracking = true;

        // Periodic UI refresh every 2 seconds
        updateInterval = setInterval(() => {
            reRenderSteps();
        }, 2000);

        // Save tracking state
        localStorage.setItem('calorieai_pedometer_active', 'true');
        return true;
    }

    function stop() {
        if (!isTracking) return;

        if (motionHandler) {
            window.removeEventListener('devicemotion', motionHandler);
            motionHandler = null;
        }
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }

        isTracking = false;
        isAboveThreshold = false;

        localStorage.setItem('calorieai_pedometer_active', 'false');
    }

    function getIsTracking() {
        return isTracking;
    }

    return { start, stop, isTracking: getIsTracking, isSupported };
})();


// ---- StepsTracker Component ----
function StepsTracker() {
    const steps = Store.getSteps();
    const target = Store.getStepsTarget();
    const pct = Math.min(100, Math.round((steps / target) * 100));
    const caloriesBurned = Math.round(steps * 0.04);
    const tracking = Pedometer.isTracking();
    const supported = Pedometer.isSupported();

    // SVG ring parameters
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return `
    <div class="steps-tracker" id="steps-tracker-card">
      <div class="steps-tracker__header">
        <span class="steps-tracker__title">👟 Steps</span>
        <span class="steps-tracker__count">${steps.toLocaleString()} / ${target.toLocaleString()}</span>
      </div>

      <!-- Auto-tracking toggle -->
      <div class="steps-tracker__auto">
        <button class="steps-tracker__track-btn ${tracking ? 'active' : ''}" onclick="toggleStepTracking()" id="step-track-btn">
          <span class="steps-tracker__track-icon">${tracking ? '⏸' : '▶'}</span>
          <span>${tracking ? 'Tracking Active' : 'Start Tracking'}</span>
          ${tracking ? '<span class="steps-tracker__pulse"></span>' : ''}
        </button>
        ${!supported ? '<div class="steps-tracker__no-sensor">⚠️ Motion sensor not available on this device</div>' : ''}
        ${tracking ? '<div class="steps-tracker__tracking-hint">🟢 Walk with your phone — steps are counted automatically</div>' : ''}
      </div>

      <div class="steps-tracker__body">
        <!-- Progress Ring -->
        <div class="steps-tracker__ring-wrap">
          <svg class="steps-tracker__ring" width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="${radius}" fill="none" stroke="var(--gray-200)" stroke-width="7"/>
            <circle cx="48" cy="48" r="${radius}" fill="none" stroke="${pct >= 100 ? '#43a047' : '#66bb6a'}"
              stroke-width="7" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
              style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset .5s ease;"/>
          </svg>
          <div class="steps-tracker__ring-label">
            <div class="steps-tracker__ring-pct">${pct}%</div>
            <div class="steps-tracker__ring-sub">${pct >= 100 ? '🎉 Goal!' : 'of goal'}</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="steps-tracker__controls" style="display:flex;gap:8px;margin-top:16px;width:100%;">
          <input type="number" id="manual-steps-input" class="steps-tracker__input" placeholder="e.g. 500" 
            style="flex:1;padding:10px 14px;border-radius:12px;border:none;background:rgba(128,128,128,0.15);color:var(--text);font-size:1rem;outline:none;" />
          <button class="steps-tracker__btn" onclick="addManualSteps()" 
            style="padding:10px 20px;border-radius:12px;background:var(--accent);color:#fff;border:none;font-weight:600;cursor:pointer;font-size:1rem;">Add</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="steps-tracker__stats">
        <div class="steps-tracker__stat">
          <span class="steps-tracker__stat-value">🔥 ${caloriesBurned}</span>
          <span class="steps-tracker__stat-label">cal burned</span>
        </div>
        <div class="steps-tracker__stat">
          <span class="steps-tracker__stat-value">📏 ${(steps * 0.000762).toFixed(1)}</span>
          <span class="steps-tracker__stat-label">km walked</span>
        </div>
        <div class="steps-tracker__stat">
          <span class="steps-tracker__stat-value">⏱ ${Math.round(steps / 100)}</span>
          <span class="steps-tracker__stat-label">min active</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="steps-tracker__bar">
        <div class="steps-tracker__bar-fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

async function toggleStepTracking() {
    if (Pedometer.isTracking()) {
        Pedometer.stop();
    } else {
        const started = await Pedometer.start();
        if (!started) {
            // Show feedback to user
            const btn = document.getElementById('step-track-btn');
            if (btn) {
                btn.style.borderColor = '#ef5350';
                btn.querySelector('span:nth-child(2)').textContent = 'Sensor unavailable';
                setTimeout(() => reRenderSteps(), 1500);
            }
            return;
        }
    }
    reRenderSteps();
}

function updateStepsBy(amount) {
    const current = Store.getSteps();
    Store.setSteps(Math.max(0, current + amount));
    reRenderSteps();
}

function addManualSteps() {
    const input = document.getElementById('manual-steps-input');
    if (!input || !input.value) return;
    const amount = parseInt(input.value, 10);
    if (!isNaN(amount) && amount !== 0) {
        updateStepsBy(amount);
    }
}


function reRenderSteps() {
    const container = document.getElementById('steps-section');
    if (container) {
        container.innerHTML = StepsTracker();
    }
}
