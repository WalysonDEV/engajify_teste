// Serverless proxy for Gemini calls (ESM-compatible).
// Lives at /api/gemini and reads GEMINI_API_KEYS or GEMINI_API_KEY from process.env on the server.

import { getKeyManager } from './keyManager.js';

export default async function handler(req, res) {
  // Ensure responses are JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const keyManager = getKeyManager();

  // Verifica se há chaves configuradas
  if (keyManager.keys.length === 0) {
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      ok: false, 
      error: 'GEMINI_API_KEYS ou GEMINI_API_KEY não configurado no ambiente' 
    }));
    return;
  }

  let keyHandle = null;

  try {
    // Tenta adquirir uma chave (pode retornar erro de fila)
    try {
      keyHandle = await keyManager.acquireKey();
    } catch (queueError) {
      // Erro de fila - retorna resposta imediata informando a posição
      if (queueError.isQueueError) {
        res.statusCode = 503; // Service Unavailable
        res.end(JSON.stringify({ 
          ok: false, 
          error: queueError.message,
          queuePosition: queueError.queuePosition,
          queueInfo: true
        }));
        return;
      }
      throw queueError;
    }

    try {
      const body = req.body || {};
      const model = body.model || 'gemini-1.5-flash';
      const contents = body.contents || { parts: body.promptParts || [] };
      const config = body.config || {};

      // Dynamically import the official GenAI client.
      const { GoogleGenAI } = await import('@google/genai');

      const ai = new GoogleGenAI({ apiKey: keyHandle.key });

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

      // Sucesso - libera a chave
      keyHandle.release();

      // Return structured JSON to the frontend.
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, response: safeResponse }));
      return;
    } catch (apiError) {
      // Extrai informações do erro do SDK do Google
      let statusCode = 500;
      let errorMessage = apiError?.message || String(apiError);
      
      // Tenta extrair status code de várias formas possíveis
      if (apiError?.status) {
        statusCode = apiError.status;
      } else if (apiError?.statusCode) {
        statusCode = apiError.statusCode;
      } else if (apiError?.code) {
        // Alguns SDKs usam 'code' ao invés de 'status'
        statusCode = apiError.code;
      } else if (errorMessage) {
        // Tenta extrair de strings como "429" ou "HTTP 429"
        const statusMatch = errorMessage.match(/[^0-9](4\d{2}|5\d{2})[^0-9]/);
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1]);
        }
      }
      
      // Marca erro na chave (para cooldown se necessário)
      // Passa um objeto com status e message para facilitar a detecção
      keyHandle.markError({
        status: statusCode,
        statusCode: statusCode,
        message: errorMessage
      });
      
      // Retorna o erro ao cliente
      res.statusCode = statusCode === 429 || statusCode === 401 || statusCode === 403 ? statusCode : 500;
      res.end(JSON.stringify({ 
        ok: false, 
        error: errorMessage,
        retryAfter: statusCode === 429 ? 60 : undefined
      }));
      return;
    }
  } catch (error) {
    // Erro geral (não relacionado à API)
    if (keyHandle) {
      keyHandle.release();
    }
    
    console.error('Error in /api/gemini:', error);
    const message = error && error.message ? error.message : String(error);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: message }));
    return;
  }
}
