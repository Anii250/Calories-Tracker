module.exports = async (req, res) => {
    const { query } = req.query;
    console.log("Searching Open Food Facts for:", query);

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Open Food Facts API endpoint
    const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
    console.log("Fetching from URL:", apiUrl);

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'CalorieAI - Web App' // Open Food Facts requests a user agent
            }
        });

        const responseText = await response.text();
        console.log("Raw response from API:", responseText);

        if (!response.ok) {
            console.error(`Open Food Facts API error: ${response.status} - ${responseText}`);
            let details = responseText;
            // If the error is an HTML page, try to extract the title for a cleaner message
            if (responseText.trim().startsWith('<!DOCTYPE html')) {
                const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
                if (titleMatch && titleMatch[1]) {
                    details = titleMatch[1];
                } else {
                    details = "The service returned an HTML error page.";
                }
            }
            return res.status(response.status).json({ 
                error: `API error: ${response.status}`,
                details: details
            });
        }

        const data = JSON.parse(responseText);

        if (!data.products || data.products.length === 0) {
            return res.status(404).json({ error: "No results found", details: "The query returned no products from Open Food Facts." });
        }

        // Normalize the data to match the frontend's expected format
        const items = data.products.map(p => ({
            name: p.product_name || query,
            calories: Math.round(p.nutriments.energy_kcal_value || p.nutriments['energy-kcal_100g'] || 0),
            proteins: +(p.nutriments.proteins_100g || 0).toFixed(1),
            fats: +(p.nutriments.fat_100g || 0).toFixed(1),
            carbs: +(p.nutriments.carbohydrates_100g || 0).toFixed(1),
            fiber: +(p.nutriments.fiber_100g || 0).toFixed(1),
            serving: p.serving_size || '100g'
        })).filter(item => item.calories > 0); // Only include items with calorie data

        res.status(200).json({ items });

    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: 'Failed to fetch data from Open Food Facts API: ' + error.message });
    }
};