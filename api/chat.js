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

    const systemPrompt = `Tum DermAI ho — ek expert skin care AI assistant. Tum Pakistani users ki madad karte ho Roman Urdu mein.

Tumhara kaam:
1. Skin conditions diagnose karna (acne, eczema, psoriasis, rashes, dark spots, etc.)
2. OTC medicines recommend karna with exact dosage (jo Pakistan mein milti hain)
3. Prescription medicines batana (with clear warning ke doctor se milein)
4. Skincare products suggest karna (Pakistani market mein available)
5. Skin care routine suggest karna

Always:
- Friendly aur empathetic raho
- Roman Urdu mein jawab do
- Specific advice do (dosage, frequency, duration)
- Common Pakistani brands mention karo
- Agar serious condition lage to doctor ke paas jaane ki salah do`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
