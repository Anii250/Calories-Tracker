/* ============================================================
   NutritionAPI — Real food data from CalorieNinjas
   ============================================================ */

const NutritionAPI = (() => {
    // Free API — get your key at https://calorieninjas.com/api
    const BASE_URL = 'https://api.calorieninjas.com/v1/nutrition';

    // Fallback: use Open Food Facts (no key needed)
    const OFF_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

    async function searchFood(query) {
        if (!query || query.length < 2) return [];

        // Try CalorieNinjas first if key is set
        const apiKey = typeof Store !== 'undefined' ? Store.getApiKey() : '';
        if (apiKey) {
            try {
                const res = await fetch(`${BASE_URL}?query=${encodeURIComponent(query)}`, {
                    headers: { 'X-Api-Key': apiKey }
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
                `${OFF_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&lc=en&language=en&fields=product_name,product_name_en,nutriments,lang`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return (data.products || [])
                    .filter(p => {
                        // Prefer English product names; skip if only non-Latin characters
                        const name = p.product_name_en || p.product_name || '';
                        if (!name || !p.nutriments) return false;
                        // Skip names that are clearly not English (contain mostly non-ASCII Latin characters)
                        const nonAsciiRatio = (name.match(/[^\x00-\x7F]/g) || []).length / name.length;
                        if (nonAsciiRatio > 0.3) return false;
                        // Skip if lang is set and not English
                        if (p.lang && p.lang !== 'en') return false;
                        return true;
                    })
                    .map(p => {
                        const name = p.product_name_en || p.product_name;
                        return {
                            name: name,
                            calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
                            proteins: +(p.nutriments.proteins_100g || 0).toFixed(1),
                            fats: +(p.nutriments.fat_100g || 0).toFixed(1),
                            carbs: +(p.nutriments.carbohydrates_100g || 0).toFixed(1),
                            fiber: +(p.nutriments.fiber_100g || 0).toFixed(1),
                            sugar: +(p.nutriments.sugars_100g || 0).toFixed(1),
                            serving: 'per 100g',
                            source: 'openfoodfacts'
                        };
                    })
                    .slice(0, 10);
            }
        } catch (e) {
            console.log('OpenFoodFacts API error:', e);
        }

        return [];
    }

    return { searchFood };
})();
