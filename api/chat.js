
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    const systemPrompt = `You are DermAI, a Global Skin Care Expert. 
    1. Language: Reply in the language used by the user (Roman Urdu/Hindi or English).
    2. Scope: Provide advice suitable for users worldwide. 
    3. Recommendations: Focus on Generic Ingredient names (e.g., Salicylic Acid) instead of just local brands. 
    4. Market: Mention that products can be found on Amazon, iHerb, or local pharmacies like Boots/CVS/Daraz depending on the user's location.
    5. Vision: Analyze skin photos accurately and provide structured routines.
    6. Safety: Always include a medical disclaimer.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error' });

    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

