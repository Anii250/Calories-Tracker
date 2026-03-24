/* ============================================================
   StepsTracker Component — daily step count tracker
   with automatic step detection via DeviceMotion API
   ============================================================ */

// ---- Pedometer Engine (accelerometer-based) ----
const Pedometer = (() => {
    let isTracking = false;
    let lastMagnitude = 0;
    let lastTimestamp = 0;
    let stepBuffer = [];
    let smoothedMag = 0;

    // Tuning constants
    const STEP_THRESHOLD = 1.35;       // Min acceleration spike to count as step
    const STEP_COOLDOWN_MS = 280;      // Min ms between steps (prevents double-count)
    const SMOOTHING_FACTOR = 0.2;      // Low-pass filter factor (0–1, lower = smoother)
    const MIN_STEP_MAGNITUDE = 0.6;    // Min magnitude change to register
    const BUFFER_SIZE = 4;             // Rolling buffer for peak detection

    let motionHandler = null;
    let permissionGranted = false;
    let updateInterval = null;

    function getMagnitude(x, y, z) {
        return Math.sqrt(x * x + y * y + z * z);
    }

    function handleMotion(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc || acc.x === null) return;

        const rawMag = getMagnitude(acc.x, acc.y, acc.z);

        // Remove gravity (~9.8) to get dynamic acceleration
        const dynamicMag = Math.abs(rawMag - 9.81);

        // Low-pass filter to smooth noise
        smoothedMag = SMOOTHING_FACTOR * dynamicMag + (1 - SMOOTHING_FACTOR) * smoothedMag;

        // Add to buffer for peak detection
        stepBuffer.push(smoothedMag);
        if (stepBuffer.length > BUFFER_SIZE) stepBuffer.shift();

        const now = Date.now();
        const timeSinceLast = now - lastTimestamp;

        // Peak detection: current value is higher than threshold AND
        // is a local peak (higher than neighbours) AND enough time has passed
        if (stepBuffer.length >= 3 && timeSinceLast > STEP_COOLDOWN_MS) {
            const len = stepBuffer.length;
            const curr = stepBuffer[len - 2]; // use second-to-last for confirmed peak
            const prev = stepBuffer[len - 3];
            const next = stepBuffer[len - 1];

            if (curr > STEP_THRESHOLD &&
                curr > prev &&
                curr >= next &&
                (curr - Math.min(prev, next)) > MIN_STEP_MAGNITUDE) {
                // Step detected!
                lastTimestamp = now;
                const currentSteps = Store.getSteps();
                Store.setSteps(currentSteps + 1);
            }
        }

        lastMagnitude = smoothedMag;
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

        // Reset state
        stepBuffer = [];
        smoothedMag = 0;
        lastTimestamp = Date.now();
        lastMagnitude = 0;

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
        stepBuffer = [];
        smoothedMag = 0;

        localStorage.setItem('calorieai_pedometer_active', 'false');
    }

    function getIsTracking() {
        return isTracking;
    }

    // Auto-start tracking on page load
    function autoStart() {
        if (!isSupported()) return;

        // Check if user explicitly stopped tracking
        if (localStorage.getItem('calorieai_pedometer_active') === 'false') return;

        // Try to start directly (works on Android/desktop)
        // On iOS, requestPermission requires a user gesture — handled below
        start().catch(() => {});
    }

    return { start, stop, isTracking: getIsTracking, isSupported, autoStart };
})();

// Auto-start on page load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Pedometer.autoStart(), 1500);

    // iOS fallback: if auto-start failed due to gesture requirement,
    // start on first user tap anywhere in the app
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
        const iosAutoStart = () => {
            if (!Pedometer.isTracking() && localStorage.getItem('calorieai_pedometer_active') !== 'false') {
                Pedometer.start();
            }
            document.removeEventListener('touchstart', iosAutoStart);
            document.removeEventListener('click', iosAutoStart);
        };
        document.addEventListener('touchstart', iosAutoStart, { once: true });
        document.addEventListener('click', iosAutoStart, { once: true });
    }
});


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
        <div class="steps-tracker__controls">
          <div class="steps-tracker__inc-row">
            <button class="steps-tracker__btn steps-tracker__btn--minus" onclick="updateStepsBy(-500)" title="−500">−500</button>
            <button class="steps-tracker__btn steps-tracker__btn--plus" onclick="updateStepsBy(500)" title="+500">+500</button>
            <button class="steps-tracker__btn steps-tracker__btn--plus-lg" onclick="updateStepsBy(1000)" title="+1000">+1k</button>
          </div>
          <div class="steps-tracker__quick">
            <button class="steps-tracker__chip" onclick="quickSetSteps(1000)">1,000</button>
            <button class="steps-tracker__chip" onclick="quickSetSteps(2000)">2,000</button>
            <button class="steps-tracker__chip" onclick="quickSetSteps(5000)">5,000</button>
            <button class="steps-tracker__chip" onclick="quickSetSteps(10000)">10,000</button>
          </div>
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

function quickSetSteps(count) {
    Store.setSteps(count);
    reRenderSteps();
}

function reRenderSteps() {
    const container = document.getElementById('steps-section');
    if (container) {
        container.innerHTML = StepsTracker();
    }
}
