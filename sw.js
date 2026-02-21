/* ============================================================
   CalorieAI — Service Worker (offline caching)
   ============================================================ */

const CACHE_NAME = 'calorieai-v1';

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './styles/index.css',
    './src/store.js',
    './src/main.js',
    './src/components/ProgressRing.js',
    './src/components/MacroBar.js',
    './src/components/MealCard.js',
    './src/components/NavBar.js',
    './src/components/NumberPicker.js',
    './src/components/AchievementModal.js',
    './src/pages/FoodDiary.js',
    './src/pages/Settings.js',
    './src/pages/Scanner.js'
];

// Install — pre-cache all app files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;

                return fetch(event.request).then(response => {
                    // Cache successful GET responses
                    if (response.ok && event.request.method === 'GET') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback for navigation
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});
