/* ============================================================
   CalorieAI — Hash Router & App Init
   ============================================================ */

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
    window.addEventListener('DOMContentLoaded', () => { render(); });

    return { navigate, render };
})();
