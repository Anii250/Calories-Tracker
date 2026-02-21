/* ============================================================
   CalorieAI — Hash Router & App Init
   ============================================================ */

const Router = (() => {
    const routes = {
        diary: FoodDiaryPage,
        scanner: ScannerPage,
        settings: SettingsPage
    };

    function getRoute() {
        const hash = location.hash.replace('#/', '').replace('#', '');
        return hash || 'diary';
    }

    function render() {
        const route = getRoute();
        const pageFn = routes[route] || routes.diary;
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = pageFn();
        }
    }

    function navigate(route) {
        location.hash = '#/' + route;
    }

    // Listen for hash changes
    window.addEventListener('hashchange', render);

    // Initial render
    window.addEventListener('DOMContentLoaded', () => {
        render();
    });

    return { navigate, render };
})();
