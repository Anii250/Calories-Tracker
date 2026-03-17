/* ============================================================
   CalorieAI — Service Worker (offline caching)
   ============================================================ */

const CACHE_NAME = 'calorieai-v8';

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './styles/index.css',
    './src/firebase-config.js',
    './src/nutrition-api.js?v=6',
    './src/store.js',
    './src/main.js',
    './src/components/ProgressRing.js',
    './src/components/MacroBar.js',
    './src/components/MealCard.js',
    './src/components/NavBar.js',
    './src/components/NumberPicker.js',
    './src/components/AchievementModal.js',
    './src/components/WaterTracker.js',
    './src/components/StreakCounter.js',
    './src/components/FoodSearch.js',
    './src/components/CameraCapture.js',
    './src/components/MealReminders.js',
    './src/components/ExportData.js',
    './src/pages/AuthPage.js',
    './src/pages/FoodDiary.js',
    './src/pages/Charts.js',
    './src/pages/Scanner.js?v=6',
    './src/pages/Settings.js',
    './src/pages/Onboarding.js'
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
