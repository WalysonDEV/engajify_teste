// Avoid importing the GenAI types in the browser bundle; use a local fallback for the Part type.
type Part = any;
import type { EngajifyResult, AdvancedOptions } from '../types';

// Removed responseSchema for strategy, as it's not used in this specific context (only for CreativeStudio)
// The response schema for generateContentStrategy is already defined in the App.tsx for strategy generation.
// It seems there was a misunderstanding in the previous turn, generateContentStrategy is working fine.

export const generateContentStrategy = async (
  imageBase64: string | null,
  imageMimeType: string | null,
  theme: string | null,
  contextText: string | null,
  mode: 'Rápido' | 'Avançado',
  advancedOptions: AdvancedOptions
): Promise<EngajifyResult> => {
  // Instead of calling the Gemini client directly from the browser (which would expose the key),
  // we POST the request to our serverless route `/api/gemini` which holds the GEMINI_API_KEY.
  // Use gemini-2.5-flash as a safer default since some API keys may not have access to newer models.
  const model = 'gemini-2.5-flash';

  const textParts: { text: string }[] = [
    { text: `Você é 'Engajify', um especialista em marketing de mídias sociais e criador de conteúdo. Sua missão é analisar o contexto fornecido (imagem ou tema) e as preferências do usuário para criar uma estratégia de postagem completa e otimizada para máximo engajamento.`},
    { text: `Gere uma estratégia de conteúdo completa em formato JSON, seguindo estritamente o schema definido. O idioma de saída deve ser ${advancedOptions.language}.`},
    { text: `---`},
    { text: `MODO DE GERAÇÃO: ${mode}`}
  ];

  if (imageBase64) {
     textParts.push({ text: `INSTRUÇÃO DE ANÁLISE VISUAL (prioridade máxima): Baseie TODA a sua análise e geração de conteúdo exclusivamente no que você vê na imagem.
     1.  **Análise Profunda da Imagem:** Descreva os objetos, pessoas, cores dominantes, contexto (ex: "mulher treinando na academia"), emoções (ex: "motivacional, energético") e elementos de foco.
     2.  **Título Contextual:** Crie um título que reflita o conteúdo visual real.
     3.  **Descrição Coerente:** Escreva uma legenda que descreva naturalmente a cena ou o sentimento da imagem.
     4.  **Hashtags Visuais:** Gere hashtags baseadas nos elementos identificados na imagem (ex: #coffeetime, #workoutmotivation).`});
  } else if (theme) {
     textParts.push({ text: `TEMA/NICHO: ${theme}`});
  }

  if (contextText) {
    textParts.push({ text: `CONTEXTO ADICIONAL FORNECIDO PELO USUÁRIO: ${contextText}`});
  }

  if (mode === 'Avançado') {
    textParts.push({ text: `PLATAFORMA ALVO: ${advancedOptions.platform}`});
    textParts.push({ text: `OBJETIVO PRINCIPAL: ${advancedOptions.objective}`});
    textParts.push({ text: `ESTILO DE VOZ: ${advancedOptions.voiceStyle}`});
  }

  const promptParts: Part[] = [...textParts];
  
  // The generateContentStrategy does not handle image input via inlineData for its main prompt,
  // it expects text. The description of strategy generation in App.tsx passes base64,
  // but the prompt structure suggests text-only content with visual analysis implied.
  // For actual multimodal input with an image, the image should be passed as a Part directly,
  // not just a text description. However, following the existing structure for strategy,
  // the image is described in text. If the intention was for multimodal analysis for strategy,
  // this part needs a different structure in App.tsx.

  // Re-adding image as a part for actual multimodal input if imageBase64 is provided for strategy
  if (imageBase64 && imageMimeType) {
      // Use the provided mimeType instead of guessing from base64 string
      promptParts.unshift({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      });
  }
  
  // Define responseSchema for strategy generation here, as it was removed from App.tsx in a previous step.
  // This ensures the strategy generation has its schema.
  const strategyResponseSchema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING", description: "Um título perfeito e cativante para a postagem, com emojis relevantes." },
      description: { type: "STRING", description: "Uma legenda/descrição completa para a postagem, incluindo uma chamada para ação (CTA) e emojis." },
      hashtags: { type: "ARRAY", items: { type: "STRING" }, description: "Uma lista com 10 a 15 hashtags otimizadas e relevantes." },
      best_times: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            platform: { type: "STRING" },
            times: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ['platform', 'times']
        },
        description: "Uma lista de melhores horários para postar, com base na plataforma e no tipo de conteúdo."
      },
      creative_ideas: { type: "ARRAY", items: { type: "STRING" }, description: "Uma lista de 3 a 5 ideias criativas para postagens relacionadas ao tema." },
      platform_style: { type: "STRING", description: "O formato de postagem recomendado (ex: Reel, Story, Feed, Carrossel)." },
      niche: { type: "STRING", description: "O nicho de conteúdo principal identificado." }
    },
    required: ['title', 'description', 'hashtags', 'best_times', 'creative_ideas', 'platform_style', 'niche']
  };


  try {
    const payload = {
      model,
      contents: { parts: promptParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: strategyResponseSchema,
        temperature: 0.8,
        topP: 0.95
      }
    };

    const resp = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Read as text first so we can provide better debugging info if the server returns HTML or plain text.
    const text = await resp.text();
    let jsonBody: any = null;
    try {
      jsonBody = text ? JSON.parse(text) : null;
    } catch (parseErr) {
      console.error('Non-JSON response from /api/gemini:', text);
      throw new Error('Server error: ' + (text ? text.slice(0, 500) : 'empty response'));
    }

    if (!resp.ok || !jsonBody || !jsonBody.ok) {
      console.error('Server /api/gemini error:', jsonBody || text);
      throw new Error('Failed to generate content from serverless Gemini endpoint. ' + (jsonBody?.error || ''));
    }

    const response = jsonBody.response;
    if (!response || !response.text) {
      throw new Error('Resposta inválida da API do Gemini para estratégia: Texto não encontrado.');
    }

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as EngajifyResult;
  } catch (error) {
    console.error('Error calling Gemini (server proxy) for strategy:', error);
    throw new Error('Failed to generate content from Gemini API.');
  }
};