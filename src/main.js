/* ============================================================
   CalorieAI — Hash Router & App Init
   ============================================================ */

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
    if (quoteEl) {
        quoteEl.textContent = SPLASH_QUOTES[Math.floor(Math.random() * SPLASH_QUOTES.length)];
    }
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 600);
    }, 2500);
}

const Router = (() => {
    const routes = {
        login: AuthPage,
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

        // Auth guard — redirect to login if not signed in
        if (!Auth.isLoggedIn() && route !== 'login') {
            location.hash = '#/login';
            return;
        }

        // If logged in but on login page, go to diary
        if (Auth.isLoggedIn() && route === 'login') {
            location.hash = '#/diary';
            return;
        }

        // Onboarding check
        if (route === 'diary' && !Store.hasOnboarded()) {
            location.hash = '#/onboarding';
            return;
        }

        const pageFn = routes[route] || routes.diary;
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = pageFn();
        }

        if (route === 'charts') {
            setTimeout(() => renderChart(), 50);
        }
    }

    function navigate(route) {
        location.hash = '#/' + route;
    }

    window.addEventListener('hashchange', render);
    window.addEventListener('DOMContentLoaded', async () => {
        initSplash();

        // Handle Google Sign-In redirect results
        try {
            await Auth.handleRedirectResult();
        } catch (err) {
            console.error("Redirect auth error:", err);
            // If we are on login page, we can show this error.
            // Note: error UI might not exist yet (AuthPage may render after this),
            // so store a global value that AuthPage can read when building HTML.
            if (window.location.hash.includes('login')) {
                window.__AUTH_REDIRECT_ERROR__ =
                    "Sign-in failed: " + (err?.message || "Unknown error") +
                    (err?.code ? ` (code: ${err.code})` : "");

                const errorEl = document.getElementById('auth-error');
                if (errorEl) {
                    errorEl.textContent = window.__AUTH_REDIRECT_ERROR__;
                    errorEl.style.display = 'block';
                }
            }
        }

        // Listen for Firebase auth state
        Auth.onAuthChanged(async (user) => {
            if (user) {
                // Sync from cloud on login — MUST happen before render()
                // so that hasOnboarded and profile are available for routing
                try {
                    const cloudData = await CloudSync.loadFromCloud();
                    if (cloudData) {
                        Store.mergeCloudData(cloudData);
                    }
                } catch (e) {
                    // Cloud unavailable — use whatever is in localStorage
                }
            }
            render();
        });
    });

    return { navigate, render };
})();
