module.exports = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const apiKey = process.env.CALORIENINJAS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server. Please add CALORIENINJAS_API_KEY to environment variables.' });
    }

    const url = `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-Api-Key': apiKey,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`CalorieNinjas API error: ${response.status} - ${errorBody}`);
            return res.status(response.status).json({ error: `CalorieNinjas API error: ${response.status}` });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: 'Failed to fetch data from CalorieNinjas API: ' + error.message });
    }
};