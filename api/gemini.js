// Serverless proxy for Gemini calls (ESM-compatible).
// Lives at /api/gemini and reads GEMINI_API_KEY from process.env on the server.

export default async function handler(req, res) {
  // Ensure responses are JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = req.body || {};
    const model = body.model || 'gemini-1.5-flash';
    const contents = body.contents || { parts: body.promptParts || [] };
    const config = body.config || {};

    // Dynamically import the official GenAI client.
    const { GoogleGenAI } = await import('@google/genai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured in environment' }));
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({ model, contents, config });

    // Return structured JSON to the frontend.
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, response }));
    return;
  } catch (error) {
    // Make sure we always return valid JSON on errors and log full details server-side.
    console.error('Error in /api/gemini:', error);
    const message = error && error.message ? error.message : String(error);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: message }));
    return;
  }
}
