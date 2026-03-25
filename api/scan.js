export default async function handler(req, res) { 
  // 1. Only allow POST requests 
  if (req.method !== 'POST') { 
    return res.status(405).json({ error: 'Method not allowed' }); 
  } 
 
  try { 
    // 2. Extract the base64 image from the frontend 
    const { image } = req.body; 
    if (!image) { 
      return res.status(400).json({ error: 'No image provided' }); 
    } 
 
    // 3. Clean the base64 string (remove the "data:image/jpeg;base64," part) 
    const base64Data = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ""); 
 
    // 4. Prepare the exact Gemini REST payload 
    const apiKey = process.env.GEMINI_API_KEY; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`; 
 
    const payload = { 
      contents: [ 
        { 
          parts: [ 
            { 
              text: "Analyze this food. Return ONLY a raw JSON object with these exact keys: 'name' (string), 'calories' (number), 'protein' (number), 'fat' (number), 'carbs' (number). Do not include any markdown formatting, backticks, or extra text." 
            }, 
            { 
              inline_data: { 
                mime_type: "image/jpeg", // We assume jpeg for camera captures 
                data: base64Data 
              } 
            } 
          ] 
        } 
      ] 
    }; 
 
    // 5. Call the Gemini API 
    const response = await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    }); 
 
    const data = await response.json(); 
 
    // Check if Google rejected the API key or payload 
    if (!response.ok) { 
      console.error("Gemini API Error Details:", data); 
      return res.status(500).json({ error: 'Gemini API rejected the request', details: data }); 
    } 
 
    // 6. Extract the text and clean up any accidental markdown (```json) 
    let textResponse = data.candidates[0].content.parts[0].text; 
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim(); 
 
    // Parse the final nutritional object 
    const nutritionalInfo = JSON.parse(textResponse); 
 
    // 7. Send success back to Calorify AI frontend! 
    return res.status(200).json(nutritionalInfo); 
 
  } catch (error) { 
    console.error("Backend Error:", error); 
    return res.status(500).json({ error: 'Failed to process image', details: error.message }); 
  } 
 }
