export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const systemPrompt = `Tum DermAI ho — ek expert skin care AI assistant. 
    Tum Pakistani users ki madad karte ho Roman Urdu mein.
    Tum tasveerein (images) dekh kar skin conditions ko analyze kar sakte ho.
    
    Tumhara kaam:
    1. Skin conditions diagnose karna (acne, eczema, rashes, etc.)
    2. Pakistan mein milne wali OTC medicines aur skincare products suggest karna.
    3. Dosage aur frequency batana.
    4. Hamesha warning dena ke serious masle ke liye doctor se milain.
    
    Hamesha Roman Urdu (Hinglish/Urdu) mein jawab do.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview', // <-- Ye model change karna zaroori tha
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq Error:", err); // Taake logs mein error dikhe
      return res.status(500).json({ error: err.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

