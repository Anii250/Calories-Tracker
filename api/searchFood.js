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

    const apiUrl = `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`;
    console.log("Fetching from CalorieNinjas:", apiUrl);

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                'Accept': 'application/json'
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`CalorieNinjas API error: ${response.status} - ${errorBody}`);
            return res.status(response.status).json({ 
                error: `CalorieNinjas API error: ${response.status}`,
                details: errorBody
            });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: 'Failed to fetch data from CalorieNinjas API: ' + error.message });
    }
};