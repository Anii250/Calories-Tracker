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
        settings: SettingsPage,
        onboarding: OnboardingPage
    };

    function getRoute() {
        const hash = location.hash.replace('#/', '').replace('#', '');
        return hash || 'diary';
    }

    function render() {
        const route = getRoute();
        const user = Auth.getCurrentUser();
        const isLoggedIn = !!user;

        // Auth guard — redirect to login if not signed in
        if (!isLoggedIn && route !== 'login') {
            location.hash = '#/login';
            return;
        }

        // If logged in but on login page, go to diary
        if (isLoggedIn && route === 'login') {
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
        const targetHash = '#/' + route;
        if (location.hash === targetHash) {
            render();
            return;
        }
        location.hash = targetHash;
    }

    let isAuthInitialized = false;

    window.addEventListener('hashchange', () => {
        if (isAuthInitialized) render();
    });

    window.addEventListener('DOMContentLoaded', async () => {
        initSplash();

        // 1. First, handle any pending redirect results
        try {
            const redirectUser = await Auth.handleRedirectResult();
            if (redirectUser) {
                console.log("Redirect sign-in successful:", redirectUser.email);
                // Force hash to diary if we just came back from a successful redirect
                if (!window.location.hash || window.location.hash.includes('login')) {
                    window.location.hash = '#/diary';
                }
            }
        } catch (err) {
            console.error("Redirect auth error:", err);
            window.__AUTH_REDIRECT_ERROR__ =
                "Sign-in failed: " + (err?.message || "Unknown error") +
                (err?.code ? ` (code: ${err.code})` : "");
        }

        // 2. Listen for Firebase auth state to handle the initial session load
        Auth.onAuthChanged(async (user) => {
            const currentHash = window.location.hash;
            
            if (user) {
                try {
                    const dateKey = Store.getTodayKey();
                    const [cloudData, meals, water] = await Promise.all([
                        CloudSync.loadFromCloud(),
                        CloudSync.loadMeals(dateKey),
                        CloudSync.loadWater(dateKey)
                    ]);

                    if (cloudData) {
                        Store.mergeCloudData(cloudData);
                    }
                    if (meals) {
                        Store.syncMealsForDay(dateKey, meals);
                    }
                    if (water) {
                        Store.setWater(water, dateKey);
                    }
                } catch (e) {
                    console.warn("Cloud sync failed, using local data:", e);
                }

                if (!currentHash || currentHash === '#/login' || currentHash === '#/') {
                    window.location.hash = '#/diary';
                    // The hash change will trigger render if isAuthInitialized is true,
                    // but on first load we need to ensure render() is called.
                }
            } else {
                if (currentHash && currentHash !== '#/login') {
                    window.location.hash = '#/login';
                }
            }
            
            isAuthInitialized = true;
            render();
        });
    });

    return { navigate, render };
})();
