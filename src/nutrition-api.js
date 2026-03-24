/* ============================================================
   NutritionAPI — CalorieNinjas API integration
   ============================================================ */

const NutritionAPI = (() => {
    const BASE_URL = 'https://api.calorieninjas.com/v1/nutrition';

    /**
     * Search CalorieNinjas API for nutrition data.
     * @param {string} query - e.g. "apple", "2 eggs", "1 cup rice"
     * @returns {Promise<Array>} Parsed food results
     * @throws {Error} With message 'INVALID_KEY' | 'NO_RESULTS' | 'NETWORK_ERROR'
     */
    async function searchFood(query) {
        if (!query || query.trim().length < 2) return [];

        const apiKey = typeof Store !== 'undefined' ? Store.getApiKey() : '';
        if (!apiKey) throw new Error('NO_API_KEY');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch(
                `${BASE_URL}?query=${encodeURIComponent(query.trim())}`,
                {
                    method: 'GET',
                    headers: { 'X-Api-Key': apiKey },
                    signal: controller.signal
                }
            );
            clearTimeout(timeoutId);

            // Handle HTTP errors
            if (res.status === 401 || res.status === 403) {
                throw new Error('INVALID_KEY');
            }
            if (!res.ok) {
                throw new Error('API_ERROR');
            }

            const data = await res.json();
            const items = data.items || [];

            if (items.length === 0) {
                throw new Error('NO_RESULTS');
            }

            return items.map(item => ({
                name: capitalizeFirst(item.name || query),
                calories: Math.round(item.calories || 0),
                proteins: +(item.protein_g || 0).toFixed(1),
                fats: +(item.fat_total_g || 0).toFixed(1),
                carbs: +(item.carbohydrates_total_g || 0).toFixed(1),
                fiber: +(item.fiber_g || 0).toFixed(1),
                sugar: +(item.sugar_g || 0).toFixed(1),
                sodium: +(item.sodium_mg || 0).toFixed(0),
                cholesterol: +(item.cholesterol_mg || 0).toFixed(0),
                serving: item.serving_size_g ? `${item.serving_size_g}g serving` : 'per serving',
                source: 'calorieninjas'
            }));

        } catch (e) {
            clearTimeout(timeoutId);

            // Re-throw known errors
            if (['INVALID_KEY', 'NO_RESULTS', 'API_ERROR', 'NO_API_KEY'].includes(e.message)) {
                throw e;
            }

            // Network / abort errors
            if (e.name === 'AbortError') {
                throw new Error('TIMEOUT');
            }

            console.error('CalorieNinjas error:', e);
            throw new Error('NETWORK_ERROR');
        }
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return { searchFood };
})();
