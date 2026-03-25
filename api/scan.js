/**
 * CalorieAI — Vercel Serverless Function (Node.js)
 * Identify food and extract nutrition data from an image using Google Gemini AI.
 */

export default async function handler(req, res) {
  // 1. Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Backend API Key configuration missing' });
    }

    // 2. Call Gemini API using native fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: 'Analyze this image. Identify the primary food item. Respond ONLY with a valid, raw JSON object (no markdown, no backticks) containing exactly these keys: "name" (string), "calories" (number), "protein" (number), "fat" (number), "carbs" (number).' },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(502).json({ error: 'Error communicating with Gemini AI' });
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
      return res.status(502).json({ error: 'Empty response from Gemini AI' });
    }

    const responseText = data.candidates[0].content.parts[0].text.trim();

    // 3. Robust JSON extraction
    let cleanJson = responseText;
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      cleanJson = responseText.substring(startIdx, endIdx + 1);
    }

    const parsedData = JSON.parse(cleanJson);

    // 4. Return the nutritional data back to the frontend
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during scan' });
  }
}
