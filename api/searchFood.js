const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const apiKey = process.env.CALORIENINJAS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured' });
    }

    const url = `https://api.calorieninjas.com/v1/nutrition?query=${query}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-Api-Key': apiKey,
            },
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from CalorieNinjas API' });
    }
};