/* ============================================================
   CalorieAI — Hash Router & App Init
   ============================================================ */

// Splash Screen Quotes
const SPLASH_QUOTES = [
    '"Take care of your body. It\'s the only place you have to live." — Jim Rohn',
    '"The food you eat can be either the safest medicine or the slowest poison."',
    '"Your body is a temple, but only if you treat it as one." — Astrid Alauda',
    '"Eat breakfast like a king, lunch like a prince, dinner like a pauper."',
    '"Health is not about the weight you lose, but the life you gain."',
    '"Small changes can make a big difference." — Stay consistent!',
    '"You don\'t have to eat less. You have to eat right."',
    '"Every journey begins with a single step. Track yours today."',
    '"Nourish your body, fuel your life." ✨',
    '"The only bad workout is the one that didn\'t happen."'
];

function initSplash() {
    const splash = document.getElementById('splash');
    const quoteEl = document.getElementById('splash-quote');
    if (!splash) return;

    // Set random quote
    if (quoteEl) {
        const q = SPLASH_QUOTES[Math.floor(Math.random() * SPLASH_QUOTES.length)];
        quoteEl.textContent = q;
    }

    // Dismiss after 2.5 seconds
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
        }, 600);
    }, 2500);
}

const Router = (() => {
    const routes = {
        diary: FoodDiaryPage,
        charts: ChartsPage,
        scanner: ScannerPage,
        settings: SettingsPage,
        onboarding: OnboardingPage
    };

    function getRoute() {
        const hash = location.hash.replace('#/', '').replace('#', '');
        return hash || 'diary';
    }

    function render() {
        const route = getRoute();

        // Check onboarding on first load
        if (route === 'diary' && !Store.hasOnboarded()) {
            location.hash = '#/onboarding';
            return;
        }

        const pageFn = routes[route] || routes.diary;
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = pageFn();
        }

        // Render chart if on charts page
        if (route === 'charts') {
            setTimeout(() => renderChart(), 50);
        }
    }

    function navigate(route) {
        location.hash = '#/' + route;
    }

    window.addEventListener('hashchange', render);
    window.addEventListener('DOMContentLoaded', () => {
        initSplash();
        render();
    });

    return { navigate, render };
})();
