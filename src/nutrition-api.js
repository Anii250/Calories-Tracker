/* ============================================================
   NutritionAPI — Real food data from CalorieNinjas
   ============================================================ */

const NutritionAPI = (() => {
    // Free API — get your key at https://calorieninjas.com/api
    const API_KEY = '';  // User can add their key for more requests
    const BASE_URL = 'https://api.calorieninjas.com/v1/nutrition';

    // Fallback: use Open Food Facts (no key needed)
    const OFF_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

    async function searchFood(query) {
        if (!query || query.length < 2) return [];

        // Try CalorieNinjas first if key is set
        if (API_KEY) {
            try {
                const res = await fetch(`${BASE_URL}?query=${encodeURIComponent(query)}`, {
                    headers: { 'X-Api-Key': API_KEY }
                });
                if (res.ok) {
                    const data = await res.json();
                    return (data.items || []).map(item => ({
                        name: item.name,
                        calories: Math.round(item.calories || 0),
                        proteins: +(item.protein_g || 0).toFixed(1),
                        fats: +(item.fat_total_g || 0).toFixed(1),
                        carbs: +(item.carbohydrates_total_g || 0).toFixed(1),
                        fiber: +(item.fiber_g || 0).toFixed(1),
                        sugar: +(item.sugar_g || 0).toFixed(1),
                        serving: item.serving_size_g ? `${item.serving_size_g}g` : 'per serving',
                        source: 'calorieninjas'
                    }));
                }
            } catch (e) {
                console.log('CalorieNinjas API error:', e);
            }
        }

        // Fallback: Open Food Facts (free, no key)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch(
                `${OFF_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return (data.products || [])
                    .filter(p => p.product_name && p.nutriments)
                    .map(p => ({
                        name: p.product_name,
                        calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
                        proteins: +(p.nutriments.proteins_100g || 0).toFixed(1),
                        fats: +(p.nutriments.fat_100g || 0).toFixed(1),
                        carbs: +(p.nutriments.carbohydrates_100g || 0).toFixed(1),
                        fiber: +(p.nutriments.fiber_100g || 0).toFixed(1),
                        sugar: +(p.nutriments.sugars_100g || 0).toFixed(1),
                        serving: 'per 100g',
                        source: 'openfoodfacts'
                    }))
                    .slice(0, 10);
            }
        } catch (e) {
            console.log('OpenFoodFacts API error:', e);
        }

        return [];
    }

    return { searchFood };
})();
