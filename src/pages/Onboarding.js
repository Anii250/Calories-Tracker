/* ============================================================
   Onboarding Page — First-time welcome flow
   ============================================================ */

let onboardingStep = 0;

function OnboardingPage() {
    onboardingStep = 0;
    return `
    <div class="page onboarding" id="onboarding-page">
      <div class="onboarding__slides" id="onboarding-slides">
        ${OnboardingSlide1()}
      </div>
      <div class="onboarding__dots">
        <span class="onboarding__dot active" id="dot-0"></span>
        <span class="onboarding__dot" id="dot-1"></span>
        <span class="onboarding__dot" id="dot-2"></span>
      </div>
    </div>
  `;
}

function OnboardingSlide1() {
    return `
    <div class="onboarding__slide" style="animation:fadeSlideUp .4s ease-out;">
      <div class="onboarding__emoji">🥗</div>
      <h1 class="onboarding__title">Welcome to CalorieAI</h1>
      <p class="onboarding__text">Track your calories, macros, and meals with a beautiful food diary. Stay healthy, stay fit!</p>
      <div class="onboarding__features">
        <div class="onboarding__feature">📊 <span>Track Calories & Macros</span></div>
        <div class="onboarding__feature">🔍 <span>Scan Food Items</span></div>
        <div class="onboarding__feature">💧 <span>Water Intake Tracking</span></div>
        <div class="onboarding__feature">📈 <span>Weekly & Monthly Charts</span></div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:24px;" onclick="nextOnboardingStep()">Get Started →</button>
    </div>
  `;
}

function OnboardingSlide2() {
    return `
    <div class="onboarding__slide" style="animation:fadeSlideUp .4s ease-out;">
      <div class="onboarding__emoji">⚙️</div>
      <h1 class="onboarding__title">Set Your Profile</h1>
      <p class="onboarding__text">Let's personalize your experience.</p>

      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-section__title">Gender</div>
        <div class="gender-toggle">
          <button class="gender-btn active" id="ob-male" onclick="obSetGender('male')">Male</button>
          <button class="gender-btn" id="ob-female" onclick="obSetGender('female')">Female</button>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section__title">Goal</div>
        <div class="goal-cards">
          <div class="goal-card active" id="ob-lose" onclick="obSetGoal('lose')">Lose weight</div>
          <div class="goal-card" id="ob-keep" onclick="obSetGoal('keep')">Keep my weight</div>
          <div class="goal-card" id="ob-gain" onclick="obSetGoal('gain')">Gain weight</div>
        </div>
      </div>

      <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="nextOnboardingStep()">Continue →</button>
    </div>
  `;
}

function OnboardingSlide3() {
    return `
    <div class="onboarding__slide" style="animation:fadeSlideUp .4s ease-out;text-align:center;">
      <div class="onboarding__emoji">🎉</div>
      <h1 class="onboarding__title">You're All Set!</h1>
      <p class="onboarding__text">Start tracking your meals and reach your health goals. You've got this!</p>
      <div style="font-size:3rem;margin:20px 0;">🏆🔥💪</div>
      <button class="btn btn-primary" style="width:100%;margin-top:24px;" onclick="finishOnboarding()">Start Tracking →</button>
    </div>
  `;
}

let obGender = 'male';
let obGoal = 'lose';

function obSetGender(g) {
    obGender = g;
    document.getElementById('ob-male')?.classList.toggle('active', g === 'male');
    document.getElementById('ob-female')?.classList.toggle('active', g === 'female');
}

function obSetGoal(g) {
    obGoal = g;
    ['lose', 'keep', 'gain'].forEach(v => {
        document.getElementById('ob-' + v)?.classList.toggle('active', v === g);
    });
}

function nextOnboardingStep() {
    onboardingStep++;
    const slides = document.getElementById('onboarding-slides');
    if (!slides) return;

    if (onboardingStep === 1) slides.innerHTML = OnboardingSlide2();
    else if (onboardingStep === 2) slides.innerHTML = OnboardingSlide3();

    // Update dots
    for (let i = 0; i < 3; i++) {
        const dot = document.getElementById('dot-' + i);
        if (dot) dot.classList.toggle('active', i === onboardingStep);
    }
}

function finishOnboarding() {
    Store.completeOnboarding({ gender: obGender, goal: obGoal });
    // Push to Firestore immediately so it's never asked again on any device
    Store.syncToCloud();
    Router.navigate('diary');
}
