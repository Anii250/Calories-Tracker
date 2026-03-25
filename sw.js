/* ============================================================
   CalorieAI — Service Worker (offline caching)
   ============================================================ */

// Bump cache version so updated auth files are fetched.
const CACHE_NAME = 'calorieai-v16';

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './styles/index.css',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './src/firebase-config.js?v=11',
    './src/nutrition-api.js?v=8',
    './src/store.js?v=8',
    './src/main.js?v=11',
    './src/components/ProgressRing.js?v=8',
    './src/components/MacroBar.js?v=8',
    './src/components/MealCard.js?v=8',
    './src/components/NavBar.js?v=8',
    './src/components/NumberPicker.js?v=8',
    './src/components/AchievementModal.js?v=8',
    './src/components/WaterTracker.js?v=9',
    './src/components/StepsTracker.js?v=9',
    './src/components/BMICard.js?v=9',
    './src/components/StreakCounter.js?v=8',
    './src/components/FoodSearch.js?v=8',
    './src/components/CameraCapture.js?v=8',
    './src/components/MealReminders.js?v=8',
    './src/components/ExportData.js?v=8',
    './src/pages/AuthPage.js?v=11',
    './src/pages/FoodDiary.js?v=8',
    './src/pages/Charts.js?v=8',
    './src/pages/Scanner.js?v=12',
    './src/pages/Settings.js?v=8',
    './src/pages/Onboarding.js?v=8'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.pathname.startsWith('/api/') || event.request.method !== 'GET') {
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok && event.request.method === 'GET') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});
