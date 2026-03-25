export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in Vercel environment variables' });
    }

    const imageString = String(image);
    const mimeMatch = imageString.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
    const mimeType = mimeMatch ? mimeMatch[1].replace('jpg', 'jpeg') : 'image/jpeg';
    const base64Data = imageString.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Analyze this food. Return ONLY a raw JSON object with these exact keys: 'name' (string), 'calories' (number), 'protein' (number), 'fat' (number), 'carbs' (number). Do not include any markdown formatting, backticks, or extra text."
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(502).json({
        error: 'Gemini API rejected the request',
        details: data
      });
    }

    let textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!textResponse) {
      return res.status(502).json({ error: 'Gemini returned an empty response', details: data });
    }

    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = textResponse.indexOf('{');
    const end = textResponse.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      textResponse = textResponse.slice(start, end + 1);
    }

    const nutritionalInfo = JSON.parse(textResponse);
    return res.status(200).json(nutritionalInfo);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process image', details: error.message });
  }
}
