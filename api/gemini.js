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

    // Normalize response to include a `text` field for backward compatibility with the frontend.
    // Different SDK versions may return text in different places; try common locations.
    let normalizedText = null;
    try {
      if (response && typeof response.text === 'string') {
        normalizedText = response.text;
      } else if (response && response.output && Array.isArray(response.output) && response.output[0]) {
        // e.g. response.output[0].content[0].text
        const out0 = response.output[0];
        if (out0.content && Array.isArray(out0.content) && out0.content[0] && typeof out0.content[0].text === 'string') {
          normalizedText = out0.content[0].text;
        }
      } else if (response && response.candidates && Array.isArray(response.candidates) && response.candidates[0]) {
        const cand = response.candidates[0];
        if (cand.content && Array.isArray(cand.content) && cand.content[0] && typeof cand.content[0].text === 'string') {
          normalizedText = cand.content[0].text;
        }
      }
    } catch (e) {
      console.error('Error normalizing Gemini response:', e);
    }

    const safeResponse = Object.assign({}, response, { text: normalizedText });

    // Return structured JSON to the frontend.
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, response: safeResponse }));
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
