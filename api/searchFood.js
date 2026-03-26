module.exports = async (req, res) => {
    const { query } = req.query;
    console.log("Searching for food:", query);

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    let apiKey = (process.env.CALORIENINJAS_API_KEY || '').trim();
    // Strip literal quotes if they were pasted into the env var
    if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
        apiKey = apiKey.slice(1, -1);
    }

    if (!apiKey) {
        console.error("API key not found or empty in env variables.");
        return res.status(500).json({ error: 'API key is not configured on the server. Please add CALORIENINJAS_API_KEY to environment variables.' });
    }

    const apiUrl = `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`;
    console.log("Fetching from API Ninjas:", apiUrl);

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey
            },
        });

        const responseText = await response.text();
        console.log("Raw response from API:", responseText);

        if (!response.ok) {
            console.error(`API Ninjas error: ${response.status} - ${responseText}`);
            return res.status(response.status).json({ 
                error: `API error: ${response.status}`,
                details: responseText
            });
        }

        const data = JSON.parse(responseText);
        // API Ninjas returns an array directly, CalorieNinjas returns { items: [] }
        // We normalize it here so the frontend works with either
        const items = Array.isArray(data) ? data : (data.items || []);
        res.status(200).json({ items });
    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: 'Failed to fetch data from CalorieNinjas API: ' + error.message });
    }
};