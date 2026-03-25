export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bmi, weight, height, tdee } = req.body || {};
    if (bmi === undefined || weight === undefined || height === undefined || tdee === undefined) {
      return res.status(400).json({ error: 'Missing required health metrics' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment variables' });
    }

    const prompt = `Act as a supportive fitness coach. Given a user with a BMI of ${bmi}, weight of ${weight}, and TDEE of ${tdee}, write exactly two short, highly personalized sentences of actionable advice to help them reach a healthy weight. Do not use markdown.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const apiMessage = data?.error?.message || 'Gemini API rejected the request';
      return res.status(502).json({ error: apiMessage });
    }

    let insight = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!insight) {
      return res.status(502).json({ error: 'Gemini returned an empty response' });
    }

    insight = insight.replace(/```json/g, '').replace(/```/g, '').trim();
    return res.status(200).json({ insight });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to generate insight' });
  }
}
