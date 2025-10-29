// Serverless proxy for Gemini calls.
// This file should live at /api/gemini.js and is intended for platforms like Vercel.
// It reads GEMINI_API_KEY from process.env and never exposes it to the client.

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const model = body.model || 'gemini-1.5-flash';
    const contents = body.contents || body.contents || { parts: body.promptParts || [] };
    const config = body.config || {};

    // Dynamically import the official GenAI client so this file can be used in Node serverless envs.
    const { GoogleGenAI } = await import('@google/genai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      return res.json({ error: 'GEMINI_API_KEY not configured in environment' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({ model, contents, config });

    // Forward the AI response directly. The frontend expects response.text with the generated JSON string.
    res.statusCode = 200;
    return res.json({ ok: true, response });
  } catch (error) {
    console.error('Error in /api/gemini:', error);
    res.statusCode = 500;
    return res.json({ ok: false, error: String(error) });
  }
};
