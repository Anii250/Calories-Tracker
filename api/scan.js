export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY in Vercel environment variables' });
    }

    const imageString = String(image);
    const mimeMatch = imageString.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
    const mimeType = mimeMatch ? mimeMatch[1].replace('jpg', 'jpeg') : 'image/jpeg';
    const base64Data = imageString.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const model = 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "Analyze this food image. Return ONLY a raw JSON object with these exact keys: name (string), calories (number), protein (number), fat (number), carbs (number). Do not include markdown, backticks, or extra text."
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const statusCode = data?.error?.code || response.status;
      const apiMessage = data?.error?.message || 'OpenAI API rejected the request';
      if (statusCode === 429) {
        return res.status(429).json({
          error: 'OpenAI quota exceeded',
          details: apiMessage
        });
      }
      return res.status(502).json({
        error: 'OpenAI API rejected the request',
        details: apiMessage
      });
    }

    let textResponse = data?.choices?.[0]?.message?.content || '';
    if (!textResponse) {
      return res.status(502).json({ error: 'OpenAI returned an empty response', details: data });
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
